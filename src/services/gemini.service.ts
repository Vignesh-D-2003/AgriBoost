import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      return response.text || "No response generated.";
    } catch (error) {
      console.error('GenAI Error:', error);
      return "Error connecting to AgriBoost AI. Please try again.";
    }
  }

  async generateJson(prompt: string, schema: any): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('GenAI JSON Error:', error);
      return null;
    }
  }

  async analyzeImage(base64Image: string, prompt: string): Promise<string> {
    try {
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      };
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            imagePart,
            { text: prompt }
          ]
        }
      });
      return response.text || "Could not analyze the image.";
    } catch (error) {
      console.error('GenAI Vision Error:', error);
      return "Error analyzing image. Please try again.";
    }
  }

  async getMarketUpdates(query: string): Promise<{text: string, links: any[]}> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      
      const text = response.text || "No updates found.";
      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      return { text, links };
    } catch (error) {
      console.error('GenAI Search Error:', error);
      return { text: "Unable to fetch real-time updates.", links: [] };
    }
  }
}