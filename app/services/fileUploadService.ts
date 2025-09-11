import apiClient from "../utils/apiClient";
import { FileAttachment } from "../types/message";
import { showErrorToast } from "../utils/toast";

class FileUploadService {
  async uploadFile(file: FileAttachment): Promise<string | null> {
     try {
      if (!apiClient) {
        throw new Error('API client not initialized.');
      }

      const formData = new FormData();

      // create the file object for FormData 
      const fileObject = {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any;

      formData.append('file', fileObject);

      const response = await apiClient.post('/upload', formData, {
         headers: {
          'Content-Type': 'multipart/form-data',
         },
      });

      const result = response.data;

      return result.fileUrl || result.url || result.path || null;
     } catch (error) {
        console.error('Faile upload error:', error);
        showErrorToast('Failed to upload file');
        return null;
     }
  }

  getFileUrl(filename: string): string {
    if (!apiClient) {
        return filename;
    }
    if (filename.startsWith('http')) {
        return filename;
    }
    return `${apiClient.defaults.baseURL}/upload/${filename}`
  }
}

export default new FileUploadService();