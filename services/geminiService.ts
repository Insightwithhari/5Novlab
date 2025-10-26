import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { DR_RHESUS_SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChatSession(): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: DR_RHESUS_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });
  return chat;
}

export async function sendMessage(chat: Chat, message: string): Promise<string> {
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error: any) {
    console.error("Error sending message to Gemini:", error);
    // Construct a JSON string representing the error to maintain the expected response format.
    return JSON.stringify({
        prose: `I'm sorry, I encountered an error: ${error.message || 'An unknown error occurred.'}`,
        tool_calls: [],
        actions: []
    });
  }
}

export async function sendMessageWithSearch(message: string): Promise<GenerateContentResponse> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        tools: [{googleSearch: {}}],
        systemInstruction: DR_RHESUS_SYSTEM_INSTRUCTION,
      },
    });
    return response;
  } catch(error) {
     console.error("Error sending message with search to Gemini:", error);
     throw error;
  }
}
