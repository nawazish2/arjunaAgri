export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  state: string;
  language: 'en' | 'hi';
  created_at?: string;
}

export interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  location: string;
  preferred_crop?: string;
}

export interface CropOption {
  name: string;
  expectedYield: string;
  inputCostEstimate: string;
  costBreakdown: string;
  careTips: string;
}

export interface SoilCorrectionPlan {
  nitrogenFix: string;
  phosphorusFix: string;
  potassiumFix: string;
  phCorrection: string;
  organicAlternatives: string;
  targetCropNote?: string;
}

export interface CropRecommendation {
  topCrops: CropOption[];
  soilCorrectionPlan: SoilCorrectionPlan;
  summary: string;
}

export interface Treatment {
  type: 'organic' | 'chemical';
  name: string;
  dosage: string;
  estimatedCost: string;
}

export interface DiseaseResult {
  diseaseName: string;
  severity: 'low' | 'medium' | 'high';
  immediateActions: string[];
  treatments: Treatment[];
  preventionTips: string;
}

export interface SoilReport {
  id: string;
  farmer_id: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  location: string;
  preferred_crop?: string;
  recommendations: CropRecommendation;
  created_at: string;
}

export interface DiseaseReport {
  id: string;
  farmer_id: string;
  disease_name: string;
  severity: string;
  actions: string[];
  treatments: Treatment[];
  created_at: string;
}
