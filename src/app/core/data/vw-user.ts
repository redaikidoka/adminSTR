export interface VwUser {
  idAdmApp: number;
  idAdmUser: number;

  userEmail: string;
  userName: string;
  imageUrl?: string;
  imageLink?: string;
  userScore: number;

  isActive: boolean;

  tags?: string;
  userPreferences?: object;

  idUserType: number;
  userTypeTitle?: string;
  userTypeNotes?: string;

  idManager: number;

  sCreate: Date;
  sCreateUser?: number;
  sUpdateUser?: number;
  sUpdate: Date;
}
