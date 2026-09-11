import { Invitation, DatePreferences, AdminStatsData, AdminUserItem } from '../types';

export function getUserAuthToken(): string | null {
  try {
    return localStorage.getItem('biadate_user_token');
  } catch (e) {
    return null;
  }
}

export function setUserAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('biadate_user_token', token);
    } else {
      localStorage.removeItem('biadate_user_token');
    }
  } catch (e) {}
}

export function getStoredUser(): any {
  try {
    const raw = localStorage.getItem('biadate_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getUserAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const storedUser = getStoredUser();
  if (storedUser?.id) {
    headers['x-user-id'] = String(storedUser.id);
  }
  return headers;
}

export async function fetchInvitationsApi(params?: {
  status?: string;
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Invitation[]> {
  try {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.dateFilter) query.set('dateFilter', params.dateFilter);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/invitations?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 401) {
      return [];
    }
    if (!res.ok) throw new Error('Failed to fetch invitations');
    const data = await res.json();
    return data.map(formatInvitationRecord);
  } catch (err) {
    console.warn('fetchInvitationsApi error:', err);
    return [];
  }
}

export async function fetchInvitationByTokenApi(token: string): Promise<Invitation | null> {
  try {
    const userToken = getUserAuthToken();
    const headers: Record<string, string> = {};
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    const res = await fetch(`/api/invitations/token/${token}`, { headers });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch invitation');
    }
    const data = await res.json();
    return formatInvitationRecord(data);
  } catch (err) {
    console.error('fetchInvitationByTokenApi error:', err);
    return null;
  }
}

export async function createInvitationApi(payload: {
  recipientName: string;
  message: string;
  senderName?: string;
}): Promise<Invitation> {
  const res = await fetch('/api/invitations', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'خطا در ثبت دعوت‌نامه در پایگاه داده');
  }

  const data = await res.json();
  return formatInvitationRecord(data);
}

export async function updateInvitationStatusApi(
  token: string,
  status: 'accepted' | 'rejected'
): Promise<Invitation> {
  const res = await fetch(`/api/invitations/token/${token}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('خطا در به‌روزرسانی وضعیت دعوت‌نامه');
  }

  const data = await res.json();
  return formatInvitationRecord(data);
}

export async function submitInvitationPreferencesApi(
  token: string,
  preferences: DatePreferences
): Promise<Invitation> {
  const res = await fetch(`/api/invitations/token/${token}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences }),
  });

  if (!res.ok) {
    throw new Error('خطا در ثبت ترجیحات قرار');
  }

  const data = await res.json();
  return formatInvitationRecord(data);
}

export async function deleteInvitationApi(tokenOrId: string | number): Promise<boolean> {
  const res = await fetch(`/api/invitations/${tokenOrId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'خطا در حذف دعوت‌نامه');
  }

  const data = await res.json();
  return data.success;
}

export async function sendChangePhoneOtpApi(
  currentPhone: string,
  newPhone: string
): Promise<{
  success: boolean;
  phone: string;
  message: string;
  testOtp?: string;
  expiresInSeconds: number;
}> {
  const res = await fetch('/api/user/change-phone-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPhone, newPhone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'خطا در ارسال کد تایید');
  }
  return data;
}

export async function verifyChangePhoneOtpApi(
  currentPhone: string,
  newPhone: string,
  code: string
): Promise<{
  success: boolean;
  newPhone: string;
  user?: any;
  message: string;
}> {
  const res = await fetch('/api/user/verify-change-phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPhone, newPhone, code }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'کد وارد شده صحیح نمی‌باشد');
  }
  return data;
}

export async function sendOtpApi(phone: string): Promise<{
  success: boolean;
  userExists: boolean;
  phone: string;
  message: string;
  testOtp?: string;
  expiresInSeconds: number;
}> {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'خطا در ارسال کد تایید');
  }
  return data;
}

export async function verifyOtpApi(
  phone: string,
  code: string
): Promise<{
  success: boolean;
  isNewUser: boolean;
  token?: string;
  user?: { id: number; name: string; phone: string; role: string; token?: string };
  tempToken?: string;
  message: string;
}> {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'کد وارد شده صحیح نمی‌باشد');
  }
  if (data.token) {
    setUserAuthToken(data.token);
  }
  return data;
}

export async function completeRegistrationApi(
  tempToken: string,
  name: string,
  gender?: string
): Promise<{
  success: boolean;
  token?: string;
  user: { id: number; name: string; phone: string; role: string; gender?: string; token?: string };
  message: string;
}> {
  const res = await fetch('/api/auth/complete-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, name, gender }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'خطا در ثبت نام نهایی');
  }
  if (data.token) {
    setUserAuthToken(data.token);
  }
  return data;
}

export async function updateProfileApi(
  name: string,
  gender?: string
): Promise<{
  success: boolean;
  user: { id: number; name: string; phone: string; gender?: string };
  message: string;
}> {
  const res = await fetch('/api/user/profile', {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, gender }),
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'خطا در بروزرسانی اطلاعات');
  }
  return data;
}

export async function checkAuthStatusApi(): Promise<{
  authenticated: boolean;
  user?: { id: number; name: string; phone: string };
}> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch (e) {
    return { authenticated: false };
  }
}

export async function logoutUserApi(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (e) {
  } finally {
    setUserAuthToken(null);
  }
}

// ==========================================
// ADMIN AUTHENTICATION APIS
// ==========================================

export async function adminLoginApi(
  credentials: { username: string; password: string }
): Promise<{ success: boolean; token: string; admin: { username: string } }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ورود به پنل مدیریت ناموفق بود');
  }

  // Save session securely in sessionStorage
  if (data.token) {
    sessionStorage.setItem('biadate_admin_token', data.token);
  }
  return data;
}

export async function verifyAdminSessionApi(): Promise<boolean> {
  const token = sessionStorage.getItem('biadate_admin_token');
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminLogoutApi(): Promise<void> {
  const token = sessionStorage.getItem('biadate_admin_token');
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    sessionStorage.removeItem('biadate_admin_token');
  }
}

export async function fetchAdminStatsApi(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<AdminStatsData | null> {
  try {
    const token = sessionStorage.getItem('biadate_admin_token');
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);

    const res = await fetch(`/api/admin/stats?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('biadate_admin_token');
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch admin stats');
    }
    const data = await res.json();
    return {
      summary: data.summary,
      userStats: data.userStats,
      todayInvitations: (data.todayInvitations || []).map(formatInvitationRecord),
      weekInvitations: (data.weekInvitations || []).map(formatInvitationRecord),
      dailyStats: data.dailyStats || [],
    };
  } catch (err: any) {
    console.error('fetchAdminStatsApi error:', err);
    throw err;
  }
}

export async function fetchAdminInvitationsApi(params?: {
  status?: string;
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Invitation[]> {
  try {
    const token = sessionStorage.getItem('biadate_admin_token');
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.dateFilter) query.set('dateFilter', params.dateFilter);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/admin/invitations?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('biadate_admin_token');
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch admin invitations');
    }
    const data = await res.json();
    return (data || []).map(formatInvitationRecord);
  } catch (err: any) {
    console.error('fetchAdminInvitationsApi error:', err);
    throw err;
  }
}

function formatInvitationRecord(raw: any): Invitation {
  return {
    id: raw.id,
    token: raw.token || `tok_${raw.id}`,
    slug: raw.slug || 'invitation',
    userId: raw.userId || raw.user_id || undefined,
    senderName: raw.senderName || raw.sender_name || 'کاربر biaDate',
    recipientName: raw.recipientName || raw.recipient_name,
    message: raw.message,
    status: raw.status || 'pending',
    createdAt: formatPersianDate(raw.createdAt || raw.created_at),
    acceptedAt: raw.acceptedAt || raw.accepted_at ? formatPersianDate(raw.acceptedAt || raw.accepted_at) : undefined,
    preferences: raw.preferences || undefined,
    senderPhone: raw.userPhone || raw.user_phone || undefined,
    senderAccountName: raw.userRegisteredName || raw.user_registered_name || undefined,
    isCreator: Boolean(raw.isCreator),
  };
}

export async function fetchAdminUsersApi(search?: string): Promise<AdminUserItem[]> {
  try {
    const token = sessionStorage.getItem('biadate_admin_token');
    const query = new URLSearchParams();
    if (search && search.trim()) {
      query.set('search', search.trim());
    }

    const res = await fetch(`/api/admin/users?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('biadate_admin_token');
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch admin users');
    }
    const data = await res.json();
    return (data || []).map((u: any) => ({
      id: u.id,
      uid: u.uid,
      phone: u.phone,
      name: u.name || 'بدون نام',
      email: u.email || undefined,
      role: u.role || 'user',
      createdAt: formatPersianDate(u.createdAt || u.created_at),
      invitationsCount: typeof u.invitationsCount === 'number' ? u.invitationsCount : 0,
    }));
  } catch (err: any) {
    console.error('fetchAdminUsersApi error:', err);
    throw err;
  }
}

export function formatPersianDate(dateString?: string | Date): string {
  if (!dateString) return 'نامشخص';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'چند لحظه پیش';
    if (diffHours < 24 && d.getDate() === now.getDate()) return `امروز، ${d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1 || (diffHours < 48 && d.getDate() === now.getDate() - 1)) return 'دیروز';
    if (diffDays < 7) return `${diffDays} روز پیش`;

    return d.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return String(dateString);
  }
}
