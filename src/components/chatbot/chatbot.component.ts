import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      
      <!-- Chat Header -->
      <div class="bg-white p-4 border-b border-slate-200 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <i class="fas fa-robot text-lg"></i>
        </div>
        <div>
          <h2 class="font-bold text-slate-800">AgriBoost Assistant</h2>
          <p class="text-xs text-slate-500">Multilingual Support (English/Tamil)</p>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" #scrollContainer>
        @if (messages().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <i class="fas fa-comments text-4xl"></i>
            <p>Ask me anything about farming!</p>
          </div>
        }
        
        @for (msg of messages(); track $index) {
          <div class="flex" [class.justify-end]="msg.role === 'user'">
            <div [class]="msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'"
                 class="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm whitespace-pre-wrap">
              {{ msg.text }}
            </div>
          </div>
        }

        @if (isLoading()) {
          <div class="flex justify-start">
            <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div class="flex gap-1">
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-slate-200">
        <form (submit)="sendMessage($event)" class="flex gap-2">
          <input type="text" 
                 [(ngModel)]="userInput" 
                 name="message"
                 placeholder="Type your question..."
                 class="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                 [disabled]="isLoading()">
          <button type="submit" 
                  [disabled]="!userInput || isLoading()"
                  class="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
            <i class="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>

    </div>
  `,
  styles: [`
    .delay-75 { animation-delay: 75ms; }
    .delay-150 { animation-delay: 150ms; }
  `]
})
export class ChatbotComponent {
  private gemini = inject(GeminiService);
  
  messages = signal<ChatMessage[]>([]);
  userInput = '';
  isLoading = signal(false);

  async sendMessage(event: Event) {
    event.preventDefault();
    if (!this.userInput.trim()) return;

    const userText = this.userInput;
    this.userInput = '';
    
    // Add user message
    this.messages.update(msgs => [...msgs, { role: 'user', text: userText }]);
    this.isLoading.set(true);

    // Build context from previous messages (last 5)
    const history = this.messages().slice(-5).map(m => `${m.role}: ${m.text}`).join('\n');
    const prompt = `History:\n${history}\nUser: ${userText}\nModel:`;
    
    const systemInstruction = "You are AgriBoost, an expert agriculture AI assistant. You help farmers with decisions. Answer concisely. You support Tamil and English. If the user asks in Tamil, reply in Tamil.";

    const response = await this.gemini.generateText(prompt, systemInstruction);

    this.messages.update(msgs => [...msgs, { role: 'model', text: response }]);
    this.isLoading.set(false);
  }
}