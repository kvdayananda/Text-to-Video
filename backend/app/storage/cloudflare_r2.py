"""
cloudflare_r2.py — Cloudflare R2 Cloud Storage engine for VisionForge AI.
Leverages boto3 S3-compatible clients to upload and manage R2 assets.
"""
from __future__ import annotations

import os
import mimetypes
from typing import Optional

try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    boto3 = None
    BOTO3_AVAILABLE = False


class R2StorageManager:
    """Manages Cloudflare R2 S3-compatible file upload and delete operations."""

    def __init__(
        self,
        bucket_name: Optional[str] = None,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        endpoint_url: Optional[str] = None,
        public_domain: Optional[str] = None
    ):
        self.bucket_name = bucket_name or os.environ.get("R2_BUCKET_NAME")
        self.access_key = access_key or os.environ.get("R2_ACCESS_KEY_ID")
        self.secret_key = secret_key or os.environ.get("R2_SECRET_ACCESS_KEY")
        self.endpoint_url = endpoint_url or os.environ.get("R2_ENDPOINT_URL")
        self.public_domain = public_domain or os.environ.get("R2_PUBLIC_DOMAIN") # Custom domain or R2 dev sub
        
        self.client = None
        if BOTO3_AVAILABLE and self.access_key and self.secret_key and self.bucket_name and self.endpoint_url:
            try:
                self.client = boto3.client(
                    "s3",
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    endpoint_url=self.endpoint_url,
                    region_name="auto" # Cloudflare R2 auto routes region
                )
            except Exception as e:
                print(f"WARNING: Failed to initialize Cloudflare R2 client: {str(e)}")

    @property
    def is_active(self) -> bool:
        """Returns True if the R2 manager is fully initialized and active."""
        return self.client is not None

    def upload(self, local_path: str, object_name: str, folder: str = "renders") -> Optional[str]:
        """Uploads a local file to R2 and returns its public URL."""
        if not self.is_active:
            return None
            
        key = f"{folder}/{object_name}"
        content_type, _ = mimetypes.guess_type(local_path)
        content_type = content_type or "application/octet-stream"

        try:
            self.client.upload_file(
                local_path,
                self.bucket_name,
                key,
                ExtraArgs={
                    "ContentType": content_type
                }
            )
            
            # Construct public URL based on public domain config
            if self.public_domain:
                domain = self.public_domain.rstrip('/')
                return f"{domain}/{key}"
            else:
                # Default S3-compatible fallback format for R2
                return f"{self.endpoint_url}/{self.bucket_name}/{key}"
        except ClientError as e:
            print(f"ERROR: Cloudflare R2 upload failed for {object_name}: {str(e)}")
            return None

    def delete(self, key_or_url: str) -> bool:
        """Deletes a file from R2 bucket."""
        if not self.is_active:
            return False

        key = key_or_url
        
        # Parse key out of URL if possible
        if self.public_domain:
            domain = self.public_domain.rstrip('/')
            if key.startswith(domain):
                key = key[len(domain):].lstrip('/')
        else:
            prefix = f"{self.endpoint_url}/{self.bucket_name}/"
            if key.startswith(prefix):
                key = key[len(prefix):]

        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError as e:
            print(f"ERROR: Cloudflare R2 delete failed for key {key}: {str(e)}")
            return False
