"""
aws_s3.py — AWS S3 Cloud Storage engine for VisionForge AI.
Handles secure file uploads, deletion, and public URL generation.
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


class S3StorageManager:
    """Manages AWS S3 file upload, download, and delete operations."""

    def __init__(
        self,
        bucket_name: Optional[str] = None,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        region_name: Optional[str] = None,
        cdn_domain: Optional[str] = None
    ):
        self.bucket_name = bucket_name or os.environ.get("AWS_BUCKET_NAME")
        self.access_key = access_key or os.environ.get("AWS_ACCESS_KEY_ID")
        self.secret_key = secret_key or os.environ.get("AWS_SECRET_ACCESS_KEY")
        self.region_name = region_name or os.environ.get("AWS_REGION", "us-east-1")
        self.cdn_domain = cdn_domain or os.environ.get("AWS_CDN_DOMAIN")
        
        self.client = None
        if BOTO3_AVAILABLE and self.access_key and self.secret_key and self.bucket_name:
            try:
                self.client = boto3.client(
                    "s3",
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    region_name=self.region_name
                )
            except Exception as e:
                print(f"WARNING: Failed to initialize AWS S3 client: {str(e)}")

    @property
    def is_active(self) -> bool:
        """Returns True if the S3 manager is fully initialized and active."""
        return self.client is not None

    def upload(self, local_path: str, object_name: str, folder: str = "renders") -> Optional[str]:
        """Uploads a local file to S3 and returns its public URL."""
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
                    "ContentType": content_type,
                    "ACL": "public-read"
                }
            )
            # Rewrite URL to CDN domain if configured
            if self.cdn_domain:
                domain = self.cdn_domain.rstrip('/')
                return f"{domain}/{key}"
            
            # Default public S3 URL
            url = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{key}"
            return url
        except ClientError as e:
            print(f"ERROR: AWS S3 upload failed for {object_name}: {str(e)}")
            return None

    def delete(self, key_or_url: str) -> bool:
        """Deletes a file from S3 bucket."""
        if not self.is_active:
            return False

        key = key_or_url
        
        # Parse key from custom CDN URL if configured
        if self.cdn_domain:
            domain = self.cdn_domain.rstrip('/')
            if key.startswith(domain):
                key = key[len(domain):].lstrip('/')
                
        # Parse key from standard S3 URL
        url_prefix = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/"
        if key.startswith(url_prefix):
            key = key[len(url_prefix):]

        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError as e:
            print(f"ERROR: AWS S3 delete failed for key {key}: {str(e)}")
            return False
