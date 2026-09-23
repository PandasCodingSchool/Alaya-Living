import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateBucketCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { apiPublicUrl } from '../lib/media-url';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = process.env.S3_BUCKET || 'fmr-uploads';
  private client: S3Client | null = null;

  async onModuleInit() {
    const endpoint = process.env.S3_ENDPOINT;
    if (!endpoint) {
      this.logger.warn('S3_ENDPOINT not set — uploads will use local data URLs');
      return;
    }
    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minio',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minio12345',
      },
    });
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async upload(file: Express.Multer.File, folder: string) {
    const ext = (file.originalname.split('.').pop() || 'bin').toLowerCase();
    const key = `${folder}/${randomUUID()}.${ext}`;
    if (!this.client) {
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `${apiPublicUrl()}/files/${key}`;
  }

  async getObject(key: string) {
    if (!this.client) return null;
    try {
      const object = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      if (!object.Body) return null;
      return {
        body: object.Body as Readable,
        contentType: object.ContentType || 'application/octet-stream',
      };
    } catch {
      return null;
    }
  }
}
