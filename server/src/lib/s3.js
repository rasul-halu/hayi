import { S3Client } from "@aws-sdk/client-s3";

const REQUIRED_S3_ENV = [
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
];

let s3Client;

function createConfigurationError(message) {
  const error = new Error(message);
  error.code = "S3_CONFIGURATION_ERROR";
  error.statusCode = 503;
  error.expose = true;
  return error;
}

function getMissingEnvironmentVariables() {
  return REQUIRED_S3_ENV.filter(name => !process.env[name]?.trim());
}

export function hasS3Configuration() {
  return getMissingEnvironmentVariables().length === 0;
}

export function assertS3Configuration({ required = true } = {}) {
  const missingVariables = getMissingEnvironmentVariables();

  if (missingVariables.length > 0) {
    if (!required) {
      return false;
    }

    throw createConfigurationError(
      `S3 media storage is not configured: missing ${missingVariables.join(", ")}`
    );
  }

  let endpoint;

  try {
    endpoint = new URL(process.env.S3_ENDPOINT);
  } catch {
    throw createConfigurationError("S3_ENDPOINT must be a valid HTTPS URL");
  }

  if (endpoint.protocol !== "https:") {
    throw createConfigurationError("S3_ENDPOINT must be a valid HTTPS URL");
  }

  return true;
}

export function getS3Configuration() {
  assertS3Configuration();

  return {
    endpoint: process.env.S3_ENDPOINT.trim().replace(/\/+$/, ""),
    region: process.env.S3_REGION.trim(),
    bucket: process.env.S3_BUCKET.trim(),
    accessKeyId: process.env.S3_ACCESS_KEY.trim(),
    secretAccessKey: process.env.S3_SECRET_KEY.trim(),
  };
}

export function getS3Client() {
  if (!s3Client) {
    const config = getS3Configuration();

    s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return s3Client;
}

export function getPublicS3ObjectUrl(key) {
  const { endpoint, bucket } = getS3Configuration();
  const encodedBucket = encodeURIComponent(bucket);
  const encodedKey = key
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");

  // Timeweb public buckets support path-style object URLs.
  return `${endpoint}/${encodedBucket}/${encodedKey}`;
}
