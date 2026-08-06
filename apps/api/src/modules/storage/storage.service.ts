import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicDomain: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || '';
    this.publicDomain = process.env.R2_PUBLIC_URL || '';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn("R2 storage credentials are not fully configured in environment variables.");
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async getPresignedUrl(fileName: string, contentType: string) {
    try {
      const uniqueKey = `${randomUUID()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueKey,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      const publicUrl = `${this.publicDomain.replace(/\/$/, '')}/${uniqueKey}`;

      return {
        uploadUrl,
        publicUrl,
      };
    } catch (error) {
      console.error("Error generating pre-signed URL", error);
      throw new InternalServerErrorException("Failed to generate upload URL");
    }
  }
}
