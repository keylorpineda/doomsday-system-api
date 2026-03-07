import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAdmission } from './entities/ai-admission.entity';
import { Camp } from '../camps/entities/camp.entity';
import { Profession } from '../users/entities/profession.entity';
import { SubmitAdmissionDto } from './dto/submit-admission.dto';
import { ReviewAdmissionDto } from './dto/review-admission.dto';
import { CreateUserAccountDto } from './dto/create-user-account.dto';
import { CampAnalysisService } from './services/camp-analysis.service';
import { AiEvaluationService, EvaluationResult } from './services/ai-evaluation.service';
import { AdmissionReviewService } from './services/admission-review.service';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiAdmission)
    private readonly admissionRepo: Repository<AiAdmission>,
    @InjectRepository(Camp)
    private readonly campRepo: Repository<Camp>,
    private readonly campAnalysisService: CampAnalysisService,
    private readonly evaluationService: AiEvaluationService,
    private readonly reviewService: AdmissionReviewService,
  ) {}

  async submitAdmission(dto: SubmitAdmissionDto): Promise<AiAdmission> {
    const camp = await this.campRepo.findOne({ where: { id: dto.camp_id } });
    if (!camp) {
      throw new NotFoundException(`Camp ${dto.camp_id} not found`);
    }

    const campContext = await this.campAnalysisService.analyzeCampContext(dto.camp_id);
    const criticalRule = this.evaluationService.checkCriticalRules(dto, campContext);

    let evaluation: EvaluationResult;
    let suggestedProfession: Profession | null = null;

    if (criticalRule.applies) {
      evaluation = {
        score: criticalRule.decision === 'ACCEPT' ? 100 : 0,
        decision: criticalRule.decision || 'REJECT',
        confidence: 'CRITICAL',
        factors: [{ category: 'Critical Rule', score: 100, maxScore: 100, detail: criticalRule.reason || '' }],
      };
    } else {
      evaluation = await this.evaluationService.calculateAdmissionScore(dto, campContext);
      suggestedProfession = await this.evaluationService.matchProfession(dto.skills, campContext);
    }

    const trackingCode = this.generateTrackingCode();
    const justification = this.evaluationService.generateJustification(evaluation, campContext, dto);

    const admission = this.admissionRepo.create({
      tracking_code: trackingCode,
      camp_id: dto.camp_id,
      candidate_data: dto,
      score: evaluation.score,
      status: 'PENDING_REVIEW',
      suggested_decision: evaluation.decision,
      suggested_profession_id: suggestedProfession?.id || null,
      justification,
      raw_ai_response: evaluation,
    });

    return this.admissionRepo.save(admission);
  }

  async trackAdmission(trackingCode: string): Promise<any> {
    const admission = await this.admissionRepo.findOne({
      where: { tracking_code: trackingCode },
      relations: ['camp', 'suggestedProfession', 'person'],
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    const candidateData: any = admission.candidate_data;

    return {
      tracking_code: admission.tracking_code,
      status: admission.status,
      camp_name: admission.camp.name,
      candidate_name: `${candidateData.first_name} ${candidateData.last_name}`,
      submission_date: admission.submission_date,
      review_date: admission.review_date,
      final_decision: admission.final_human_decision,
      suggested_profession: admission.suggestedProfession?.name,
      person_code: admission.person?.identification_code,
    };
  }

  async getPendingAdmissions(campId?: number): Promise<AiAdmission[]> {
    const where: any = { status: 'PENDING_REVIEW' };
    if (campId) {
      where.camp_id = campId;
    }

    return this.admissionRepo.find({
      where,
      relations: ['camp', 'suggestedProfession'],
      order: { submission_date: 'DESC' },
    });
  }

  async getAdmissionDetail(id: number): Promise<AiAdmission> {
    const admission = await this.admissionRepo.findOne({
      where: { id },
      relations: ['camp', 'suggestedProfession', 'reviewedBy', 'person'],
    });

    if (!admission) {
      throw new NotFoundException(`Admission ${id} not found`);
    }

    return admission;
  }

  async reviewAdmission(
    id: number,
    dto: ReviewAdmissionDto,
    adminUserId: number,
  ) {
    return this.reviewService.reviewAdmission(id, dto, adminUserId);
  }

  async createUserAccountForPerson(admissionId: number, dto: CreateUserAccountDto) {
    return this.reviewService.createUserAccountForPerson(admissionId, dto);
  }

  private generateTrackingCode(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ADM-${year}-${random}`;
  }
}
