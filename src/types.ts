export type PageId =
  | 'landing'
  | 'auth'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'admin-login'
  | 'admin-dashboard'
  | 'create-invitation'
  | 'invitation-created'
  | 'public-invitation'
  | 'invitation-accepted'
  | 'date-preferences'
  | 'preferences-submitted'
  | 'invitation-details'
  | 'invitations-list'
  | 'settings'
  | 'how-it-works'
  | 'faq'
  | '404';

export interface DatePreferences {
  activities: string[];
  days: string[];
  timeSlot: string;
  notes: string;
}

export interface Invitation {
  id: string | number;
  token: string;
  slug: string;
  userId?: number;
  senderName?: string;
  recipientName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  acceptedAt?: string;
  preferences?: DatePreferences;
  senderPhone?: string;
  senderAccountName?: string;
  isCreator?: boolean;
}

export interface AdminUserItem {
  id: number;
  uid: string;
  phone: string;
  name: string;
  email?: string;
  role?: string;
  createdAt: string;
  invitationsCount?: number;
}

export interface User {
  id?: number | string;
  name: string;
  phone?: string;
  email?: string;
  gender?: string;
  token?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

export interface AdminStatsSummary {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
  acceptanceRate: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

export interface DailyStat {
  date: string;
  label: string;
  total: number;
  accepted: number;
  pending: number;
}

export interface UserStatsSummary {
  total: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

export interface AdminStatsData {
  summary: AdminStatsSummary;
  userStats?: UserStatsSummary;
  todayInvitations: Invitation[];
  weekInvitations: Invitation[];
  dailyStats: DailyStat[];
}
