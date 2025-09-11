import apiClient from "../utils/apiClient";
import { showErrorToast } from "../utils/toast";

class MessageService {
  async getUserProfile() {
    if (!apiClient) {
     showErrorToast('API client not initialized.');
     return;
    }
    const response = await apiClient.get("/api/profile");
    return response.data;
  }

  async getChatContacts() {
    if (!apiClient) {
     showErrorToast('API client not initialized.');
     return;
    }
    const response = await apiClient.get("/api/profile/contacts");
    return response.data;
  }

  async getUserById(userId: string) {
    if (!apiClient) {
     showErrorToast('API client not initialized.');
     return;
    }
    const response = await apiClient.get(`/api/profile/users/${userId}`);
    return response.data;
  }

  async getOrCreateConversation(userId: string) {
    if (!apiClient) {
     showErrorToast('API client not initialized.');
     return;
    }
    const response = await apiClient.post("/api/conversation/create-conversation", {
        userId
    });
    return response.data;
  }

  async getConversationMessages(conversationId: string) {
    if (!apiClient) {
     showErrorToast('API client not initialized.');
     return;
    }
    const response = await apiClient.get(`/api/messages/${conversationId}`);
    return response.data;
  }
}   

export default new MessageService();