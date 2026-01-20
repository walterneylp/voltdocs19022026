import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

export const getS3Client = () => {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY || !env.S3_REGION) {
    return null;
  }
  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY
    }
  });
};

export const uploadToS3 = async (
  key: string,
  body: Buffer,
  contentType: string | undefined
) => {
  const client = getS3Client();
  if (!client || !env.S3_BUCKET) {
    throw new Error("S3 não configurado");
  }
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType
  });
  await client.send(command);
  return key;
};
