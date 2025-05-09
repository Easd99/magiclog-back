import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUD_KEY'),
      api_secret: this.configService.get<string>('CLOUD_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'products' }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        })
        .end(file.buffer);
    });
  }

  async getImageUrl(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { width: 300, height: 300, crop: 'fit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
  }
}
