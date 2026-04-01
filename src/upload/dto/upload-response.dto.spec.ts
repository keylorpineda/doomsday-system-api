import "reflect-metadata";
import { UploadResponseDto } from "./upload-response.dto";

describe("UploadResponseDto", () => {
  it("should assign all response properties", () => {
    const dto = new UploadResponseDto();

    dto.url = "https://cloudinary.com/image.jpg";
    dto.publicId = "zombie-camp/person/abc123";
    dto.thumbnailUrl = "https://cloudinary.com/thumb.jpg";

    expect(dto).toEqual({
      url: "https://cloudinary.com/image.jpg",
      publicId: "zombie-camp/person/abc123",
      thumbnailUrl: "https://cloudinary.com/thumb.jpg",
    });
  });

  it("should register swagger metadata for documented properties", () => {
    const properties = Reflect.getMetadata(
      "swagger/apiModelPropertiesArray",
      UploadResponseDto.prototype,
    ) as string[] | undefined;

    expect(properties).toEqual(
      expect.arrayContaining([":url", ":publicId", ":thumbnailUrl"]),
    );
  });
});
