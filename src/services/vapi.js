import { Vapi } from '@vapi-ai/web';

const vapiService = {
  initialize: async (publicKey) => {
    const instance = new Vapi(publicKey);
    return instance;
  },
  
  analyzeConversation: async (transcript) => {
    // Implementation moved to VoiceConversation component
    return {};
  }
};

export default vapiService;
