export interface CleanerProfile {
  id: string;
  cleanerId: string;
  name: string;
  phone: string;
  email?: string;
}

export interface CleanerLoginData {
  phone: string;
  password?: string;
  smsCode?: string;
}

export type CleanerAuthMethod = "password" | "sms";
