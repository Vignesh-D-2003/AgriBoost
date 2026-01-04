import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full p-4 md:p-6 overflow-y-auto">
      <div class="max-w-3xl mx-auto space-y-6">
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center gap-3 mb-4">
             <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"><i class="fas fa-stethoscope text-xl"></i></div>
             <div>
               <h2 class="text-2xl font-bold text-slate-800">Crop Doctor</h2>
               <p class="text-slate-500 text-sm">Upload crop photo for instant diagnosis.</p>
             </div>
          </div>

          <!-- Upload Area -->
          <div class="relative group">
            <div class="border-2 border-dashed border-green-300 rounded-2xl p-8 text-center bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer min-h-[250px] flex flex-col items-center justify-center">
              <input type="file" accept="image/*" (change)="onFileSelected($event)" 
                     class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
              
              @if (!selectedImage()) {
                <div class="text-green-700 flex flex-col items-center gap-3">
                  <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <i class="fas fa-camera text-3xl"></i>
                  </div>
                  <div>
                    <p class="font-bold text-lg">Take Photo or Upload</p>
                    <p class="text-sm text-green-600/80">Supports JPG, PNG</p>
                  </div>
                </div>
              } @else {
                <div class="relative w-full h-full flex items-center justify-center">
                   <img [src]="selectedImage()" class="max-h-64 max-w-full rounded-lg shadow-lg object-contain" alt="Selected crop">
                </div>
              }
            </div>
            
             @if (selectedImage()) {
                <button (click)="clearImage($event)" class="absolute top-4 right-4 bg-white text-red-500 rounded-full w-10 h-10 shadow-md hover:bg-red-50 z-20 flex items-center justify-center transition-transform hover:rotate-90">
                  <i class="fas fa-times"></i>
                </button>
             }
          </div>

          @if (selectedImage()) {
            <button (click)="analyze()" 
                    [disabled]="loading()"
                    class="w-full mt-6 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg hover:shadow-xl transform active:scale-95">
              @if (loading()) {
                <i class="fas fa-circle-notch fa-spin text-xl"></i> Analyzing Crop Health...
              } @else {
                <i class="fas fa-user-md text-xl"></i> Diagnose Disease
              }
            </button>
          }
        </div>

        @if (result()) {
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
            <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <i class="fas fa-file-medical-alt text-green-600"></i> Diagnosis Report
            </h3>
            <div class="prose prose-green max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
              {{ result() }}
            </div>
            
             <div class="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm flex items-start gap-2">
                <i class="fas fa-exclamation-triangle mt-0.5"></i>
                <p>AI diagnosis is for guidance. Please consult a local agricultural extension officer for confirmation before applying chemical treatments.</p>
             </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DiseaseComponent {
  private gemini = inject(GeminiService);
  
  selectedImage = signal<string | null>(null);
  loading = signal(false);
  result = signal<string | null>(null);

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage.set(e.target.result);
        this.result.set(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(e: Event) {
    e.stopPropagation(); // Prevent triggering file input
    this.selectedImage.set(null);
    this.result.set(null);
  }

  async analyze() {
    const img = this.selectedImage();
    if (!img) return;

    this.loading.set(true);
    // Remove data URL prefix for API
    const base64Data = img.split(',')[1];
    
    const prompt = "Analyze this image of a crop. 1. Identify the crop. 2. DETECT DISEASE/PEST: If healthy, explicitly state it. If diseased, identify the specific disease/pest. 3. SYMPTOMS: List visual symptoms. 4. TREATMENT: Suggest organic and chemical control methods. Format with Markdown headings.";
    
    const analysis = await this.gemini.analyzeImage(base64Data, prompt);
    this.result.set(analysis);
    this.loading.set(false);
  }
}