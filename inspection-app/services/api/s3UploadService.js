import { apiService } from "./api";
import { API_CONFIG } from "../../config/api.config";
import { Platform } from "react-native";
// import { Image as ImageCompressor, Video as VideoCompressor } from 'react-native-compressor';

class S3UploadService {
  /**
   * Request pre-signed URLs from the backend
   * @param {Array} fileMetadata Array of objects: { fileName, contentType, fileSize, uploadType, referenceId }
   * @returns {Promise<Array>} Array of PresignedUrlResponse objects
   */
  async getPresignedUrls(fileMetadata) {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.INSPECTIONS.PRESIGNED_URL,
        fileMetadata
      );
      // Assuming response is an array or contains the array in 'data'
      return response.data || response;
    } catch (error) {
      console.error("Error getting pre-signed URLs:", error);
      throw error;
    }
  }

  /**
   * Upload a physical file directly to S3 using the pre-signed URL
   * @param {String} fileUri Local file URI
   * @param {String} presignedUrl S3 PUT URL
   * @param {String} contentType MIME type
   */
  async uploadFileToS3(fileUri, presignedUrl, contentType) {
    try {
      // For React Native, fetch the local URI to get a Blob
      const localFileResponse = await fetch(fileUri);
      const blob = await localFileResponse.blob();

      // Execute PUT request directly to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 Upload failed with status ${uploadResponse.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }

  /**
   * Compress a media file before upload
   * @param {String} fileUri Local file URI
   * @param {String} contentType MIME type
   * @returns {Promise<String>} Compressed file URI
   */
  // async compressMedia(fileUri, contentType) {
  //   try {
  //     if (contentType.startsWith('video/')) {
  //       console.log(`[Compression] Compressing video: ${fileUri}`);
  //       const result = await VideoCompressor.compress(
  //         fileUri,
  //         {
  //           compressionMethod: 'auto',
  //         },
  //         (progress) => {
  //           // Optional: you can log progress here
  //         }
  //       );
  //       console.log(`[Compression] Video compression complete: ${result}`);
  //       return result;
  //     } else if (contentType.startsWith('image/')) {
  //       console.log(`[Compression] Compressing image: ${fileUri}`);
  //       const result = await ImageCompressor.compress(fileUri, {
  //         compressionMethod: 'auto',
  //         quality: 0.7,
  //         maxWidth: 1920,
  //         maxHeight: 1920,
  //       });
  //       console.log(`[Compression] Image compression complete: ${result}`);
  //       return result;
  //     }
  //     return fileUri;
  //   } catch (error) {
  //     console.warn(`[Compression] Failed to compress ${fileUri}, uploading original. Error:`, error);
  //     return fileUri; // Fallback to original if compression fails
  //   }
  // }

  /**
   * Orchestrates the batch processing of multiple files.
   * @param {Array} files Array of local file URIs
   * @param {String} uploadType The type of upload (e.g., 'VEHICLE_IMAGE')
   * @param {String} referenceId Reference ID (e.g., inspection ID)
   * @param {Function} onProgress Callback for tracking progress
   * @returns {Promise<Array>} Array of { fileUrl, key }
   */
  async processUploadBatch(files, uploadType = "VEHICLE_IMAGE", referenceId = "unknown", onProgress = null) {
    if (!files || files.length === 0) return [];

    let completed = 0;
    const total = files.length;
    const results = [];
    const BATCH_CONCURRENCY = 3;

    // 1. Prepare metadata for backend request
    const metadata = files.map((fileUri, index) => {
      // Extract filename from URI or assign a generic one
      const fileName = fileUri.split("/").pop() || `image_${index}.jpg`;
      const contentType = "image/jpeg"; // Default to jpeg for now
      
      return {
        fileName,
        contentType,
        fileSize: 1048576, // Mock size for POC: 1MB. In production, use FileSystem to get real size
        uploadType,
        referenceId,
        _originalUri: fileUri // temporary key to map back
      };
    });

    // 2. Fetch all presigned URLs at once
    console.log("Fetching presigned URLs for", metadata.length, "files...");
    const presignedResponses = await this.getPresignedUrls(metadata.map(m => {
      const copy = { ...m };
      delete copy._originalUri;
      return copy;
    }));
    console.log("Presigned responses:", JSON.stringify(presignedResponses, null, 2));

    // Normalize presignedResponses in case the backend returns it inside another wrapper (e.g. data.urls or something)
    let presignedArray = presignedResponses;
    if (presignedResponses && !Array.isArray(presignedResponses)) {
       if (Array.isArray(presignedResponses.data)) presignedArray = presignedResponses.data;
       else if (Array.isArray(presignedResponses.urls)) presignedArray = presignedResponses.urls;
       else if (Array.isArray(presignedResponses.presignedUrls)) presignedArray = presignedResponses.presignedUrls;
    }

    // 3. Upload to S3 with concurrency limit
    for (let i = 0; i < files.length; i += BATCH_CONCURRENCY) {
      const batch = files.slice(i, i + BATCH_CONCURRENCY);
      
      const uploadPromises = batch.map(async (fileUri, batchIdx) => {
        const globalIdx = i + batchIdx;
        const s3Meta = presignedArray ? presignedArray[globalIdx] : null;
        
        if (!s3Meta || !s3Meta.uploadUrl) {
          console.warn("No presigned URL returned for file:", fileUri);
          return null;
        }

        const contentType = s3Meta.contentType || "image/jpeg";
        await this.uploadFileToS3(fileUri, s3Meta.uploadUrl, contentType);
        // const compressedUri = await this.compressMedia(fileUri, contentType);
        // await this.uploadFileToS3(compressedUri, s3Meta.uploadUrl, contentType);
        
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }

        return {
          fileUrl: s3Meta.fileUrl,
          key: s3Meta.key,
          originalUri: fileUri
        };
      });

      const batchResults = await Promise.all(uploadPromises);
      results.push(...batchResults.filter(Boolean));
    }

    return results;
  }
}

export const s3UploadService = new S3UploadService();
