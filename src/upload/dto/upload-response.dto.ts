import { ApiProperty } from "@nestjs/swagger";

export class UploadResponseDto {
  @ApiProperty({
    description: "URL completa de la imagen en Cloudinary",
    example:
      "https://res.cloudinary.com/demo/image/upload/v1234567890/zombie-camp/person/abc123.jpg",
  })
  url: string;

  @ApiProperty({
    description: "ID p�blico de Cloudinary (para eliminar la imagen)",
    example: "zombie-camp/person/abc123",
  })
  publicId: string;

  @ApiProperty({
    description: "URL del thumbnail optimizado",
    example:
      "https://res.cloudinary.com/demo/image/upload/c_fill,h_100,w_100/zombie-camp/person/abc123.jpg",
  })
  thumbnailUrl: string;
}
