import { Component, inject, signal, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

export type Tab = 'weather' | 'crop' | 'fertilizer' | 'schemes';

@Component({
  selector: 'app-advisory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col md:flex-row overflow-hidden bg-slate-50 md:bg-white">
      
      <!-- Mobile Tab Selector (Dropdown style for small screens, Sidebar for large) -->
      <div class="md:hidden bg-white p-3 border-b border-slate-200 shadow-sm z-10">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Select Tool</label>
        <select [ngModel]="activeTab()" (ngModelChange)="activeTab.set($event)" 
                class="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5">
          <option value="weather">🌦️ Weather Advice</option>
          <option value="crop">🌾 Crop Suggestion</option>
          <option value="fertilizer">🧪 Fertilizer Calc</option>
          <option value="schemes">💰 Govt Schemes</option>
        </select>
      </div>

      <!-- Desktop Sidebar -->
      <div class="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 h-full">
        <div class="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">Advisory Tools</div>
        
        <nav class="flex-1 overflow-y-auto py-2">
          <button (click)="activeTab.set('weather')" 
                  [class]="getTabClass('weather')"
                  class="w-full text-left flex items-center gap-3 px-6 py-4 transition-colors relative">
            <i class="fas fa-cloud-sun w-6 text-center text-lg"></i> 
            <span class="font-medium">Weather Advice</span>
            @if(activeTab() === 'weather') { <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div> }
          </button>

          <button (click)="activeTab.set('crop')"
                  [class]="getTabClass('crop')"
                  class="w-full text-left flex items-center gap-3 px-6 py-4 transition-colors relative">
            <i class="fas fa-seedling w-6 text-center text-lg"></i> 
            <span class="font-medium">Crop Suggestion</span>
             @if(activeTab() === 'crop') { <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div> }
          </button>

          <button (click)="activeTab.set('fertilizer')"
                  [class]="getTabClass('fertilizer')"
                  class="w-full text-left flex items-center gap-3 px-6 py-4 transition-colors relative">
            <i class="fas fa-flask w-6 text-center text-lg"></i> 
            <span class="font-medium">Fertilizer</span>
             @if(activeTab() === 'fertilizer') { <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div> }
          </button>

          <button (click)="activeTab.set('schemes')"
                  [class]="getTabClass('schemes')"
                  class="w-full text-left flex items-center gap-3 px-6 py-4 transition-colors relative">
            <i class="fas fa-hand-holding-dollar w-6 text-center text-lg"></i> 
            <span class="font-medium">Schemes</span>
             @if(activeTab() === 'schemes') { <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div> }
          </button>
        </nav>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
        
        <!-- Weather Tab -->
        @if (activeTab() === 'weather') {
          <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div class="flex items-center gap-3 mb-2">
               <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><i class="fas fa-cloud-sun"></i></div>
               <h2 class="text-2xl font-bold text-slate-800">Weather Advisory</h2>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Your Farm Location</label>
              <div class="flex flex-col md:flex-row gap-3">
                <input type="text" [(ngModel)]="location" placeholder="e.g. Madurai, Tamil Nadu" 
                       class="flex-1 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all">
                <button (click)="getWeatherAdvice()" [disabled]="loading() || !location" 
                        class="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                  @if(loading()) { <i class="fas fa-circle-notch fa-spin"></i> } @else { Get Advice }
                </button>
              </div>
            </div>
            @if (result()) {
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 prose prose-green max-w-none whitespace-pre-wrap leading-relaxed">{{ result() }}</div>
            }
          </div>
        }

        <!-- Crop Suggestion Tab -->
        @if (activeTab() === 'crop') {
          <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
             <div class="flex items-center gap-3 mb-2">
               <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><i class="fas fa-seedling"></i></div>
               <h2 class="text-2xl font-bold text-slate-800">Crop Recommendation</h2>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Soil Type</label>
                  <select [(ngModel)]="soil" class="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Black Soil">Black Soil</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Loamy">Loamy</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Season / Month</label>
                  <input type="text" [(ngModel)]="season" placeholder="e.g. June (Kharif)" class="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                </div>
              </div>
              <button (click)="getCropSuggestion()" [disabled]="loading() || !soil || !season" 
                      class="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md">
                 @if(loading()) { <i class="fas fa-circle-notch fa-spin"></i> Analyzing... } @else { Recommend Crops }
              </button>
            </div>
            @if (result()) {
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 prose prose-green max-w-none whitespace-pre-wrap leading-relaxed">{{ result() }}</div>
            }
          </div>
        }

        <!-- Fertilizer Tab -->
        @if (activeTab() === 'fertilizer') {
          <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div class="flex items-center gap-3 mb-2">
               <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><i class="fas fa-flask"></i></div>
               <h2 class="text-2xl font-bold text-slate-800">Fertilizer Calculator</h2>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Crop Name</label>
                <input type="text" [(ngModel)]="cropName" placeholder="e.g. Rice, Wheat" class="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Land Area (Acres)</label>
                  <input type="number" [(ngModel)]="acres" placeholder="e.g. 2.5" class="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Growth Stage</label>
                  <select [(ngModel)]="stage" class="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select Stage</option>
                    <option value="Sowing/Planting">Sowing/Planting</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Harvest">Harvest</option>
                  </select>
                </div>
              </div>
              <button (click)="getFertilizerRec()" [disabled]="loading() || !cropName" 
                      class="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md">
                 @if(loading()) { <i class="fas fa-circle-notch fa-spin"></i> Calculating... } @else { Get Schedule }
              </button>
            </div>
            @if (result()) {
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 prose prose-green max-w-none whitespace-pre-wrap leading-relaxed">{{ result() }}</div>
            }
          </div>
        }

        <!-- Schemes Tab -->
        @if (activeTab() === 'schemes') {
          <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div class="flex items-center gap-3 mb-2">
               <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600"><i class="fas fa-landmark"></i></div>
               <h2 class="text-2xl font-bold text-slate-800">Govt Schemes & Subsidies</h2>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label class="block text-sm font-semibold text-slate-700 mb-2">State / Region</label>
              <div class="flex gap-3">
                <input type="text" [(ngModel)]="region" placeholder="e.g. Karnataka, India" 
                       class="flex-1 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                <button (click)="getSchemes()" [disabled]="loading() || !region" 
                        class="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md">
                   @if(loading()) { <i class="fas fa-circle-notch fa-spin"></i> } @else { Find }
                </button>
              </div>
            </div>
            
            @if (schemesData()) {
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
                <h3 class="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                  <i class="fas fa-info-circle text-green-600"></i> Latest Information
                </h3>
                <div class="prose prose-sm prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
                  {{ schemesData()?.text }}
                </div>
                
                @if (schemesData()?.links?.length) {
                  <div class="mt-6 pt-4 border-t border-slate-100">
                    <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sources & Application Links</h4>
                    <div class="flex flex-wrap gap-2">
                      @for (link of schemesData()?.links; track $index) {
                        @if (link.web?.uri) {
                          <a [href]="link.web.uri" target="_blank" class="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1">
                            <i class="fas fa-external-link-alt"></i> {{ link.web.title || 'Visit Website' }}
                          </a>
                        }
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdvisoryComponent {
  private gemini = inject(GeminiService);
  
  startTab = input<Tab>();
  activeTab = signal<Tab>('weather');
  loading = signal(false);
  result = signal<string | null>(null);
  
  // Inputs
  location = '';
  soil = '';
  season = '';
  cropName = '';
  acres = '';
  stage = '';
  region = '';

  schemesData = signal<{text: string, links: any[]} | null>(null);

  constructor() {
    effect(() => {
      const start = this.startTab();
      if (start) {
        this.activeTab.set(start);
      }
    });

    // Reset results when tab changes manually
    effect(() => {
      this.activeTab(); // dependency
      // We don't want to clear if it was just set by startTab, but simpler to just clear for now
      // Logic handled by separate user actions mostly.
    });
  }

  getTabClass(tab: Tab) {
    return this.activeTab() === tab
      ? 'bg-green-50 text-green-700 font-semibold'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
  }

  async getWeatherAdvice() {
    if (!this.location) return;
    this.loading.set(true);
    const prompt = `I am a farmer in ${this.location}. Provide a detailed farming advisory based on typical weather in this region right now. Include precautions for current crops.`;
    const res = await this.gemini.generateText(prompt);
    this.result.set(res);
    this.loading.set(false);
  }

  async getCropSuggestion() {
    if (!this.soil || !this.season) return;
    this.loading.set(true);
    const prompt = `Suggest profitable and suitable crops for ${this.soil} during ${this.season} season in India. Provide estimated duration, potential yield, and market value for each.`;
    const res = await this.gemini.generateText(prompt);
    this.result.set(res);
    this.loading.set(false);
  }

  async getFertilizerRec() {
    if (!this.cropName) return;
    this.loading.set(true);
    const prompt = `Recommend a detailed fertilizer schedule for ${this.cropName} (Area: ${this.acres || '1'} acres, Stage: ${this.stage || 'General'}). Include both organic (FYM, Vermicompost) and chemical (NPK) options with dosages.`;
    const res = await this.gemini.generateText(prompt);
    this.result.set(res);
    this.loading.set(false);
  }

  async getSchemes() {
    if (!this.region) return;
    this.loading.set(true);
    const prompt = `List current agricultural schemes, subsidies, and financial aid available for farmers in ${this.region}, India. Include eligibility and how to apply.`;
    const res = await this.gemini.getMarketUpdates(prompt); 
    this.schemesData.set(res);
    this.loading.set(false);
  }
}