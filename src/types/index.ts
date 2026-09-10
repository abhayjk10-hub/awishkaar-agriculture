export type Language = 'en' | 'hi' | 'mr' | 'pa' | 'gu';

export interface Farmer {
  id: string;
  user_id?: string;
  full_name: string;
  mobile_number: string;
  village: string;
  district: string;
  state: string;
  land_plot_id: string;
  preferred_language: Language;
  created_at: string;
}

export interface ContactSubmission {
  id?: string;
  farmer_name: string;
  mobile_number: string;
  message_type: 'Query' | 'Suggestion' | 'Grievance';
  message: string;
  synced_to_sheet: boolean;
  created_at?: string;
}

export type AuthMode = 'login' | 'register';
export type LoginStep = 'mobile' | 'otp';
export type RegisterStep = 'details' | 'otp' | 'language';
