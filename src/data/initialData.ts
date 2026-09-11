import { Invitation, User } from '../types';

export const INITIAL_USER: User = {
  name: 'کاربر مهمان',
  phone: '',
  email: '',
  isLoggedIn: false,
};

export const INITIAL_INVITATIONS: Invitation[] = [];

export const PAGE_NAMES: { id: import('../types').PageId; title: string; category: string }[] = [
  { id: 'landing', title: '۱. صفحه اصلی (Landing Page)', category: 'عمومی' },
  { id: 'login', title: '۲. ورود (Login)', category: 'احراز هویت' },
  { id: 'register', title: '۳. ثبت‌نام (Register)', category: 'احراز هویت' },
  { id: 'dashboard', title: '۴. داشبورد کاربر (Dashboard)', category: 'پنل فرستنده' },
  { id: 'create-invitation', title: '۵. ساخت دعوت‌نامه (Create)', category: 'مهم' },
  { id: 'invitation-created', title: '۶. دعوت‌نامه آماده شد (Success)', category: 'اشتراک لینک' },
  { id: 'public-invitation', title: '۷. صفحه دعوت عمومی (Recipient)', category: 'گیرنده' },
  { id: 'invitation-accepted', title: '۸. پذیرش دعوت (Accepted)', category: 'جشن' },
  { id: 'date-preferences', title: '۹. پرسشنامه ترجیحات (4 Steps)', category: 'گیرنده' },
  { id: 'preferences-submitted', title: '۱۰. ثبت ترجیحات (Submitted)', category: 'گیرنده' },
  { id: 'invitation-details', title: '۱۱. جزئیات دعوت‌نامه (Details)', category: 'پنل فرستنده' },
  { id: 'invitations-list', title: '۱۲. لیست تمام دعوت‌ها (List)', category: 'پنل فرستنده' },
  { id: 'settings', title: '۱۳. تنظیمات کاربری (Settings)', category: 'پنل' },
  { id: 'how-it-works', title: '۱۴. چطور کار می‌کنه (How It Works)', category: 'راهنما' },
  { id: 'faq', title: '۱۵. سوالات متداول (FAQ)', category: 'راهنما' },
  { id: '404', title: '۱۶. صفحه پیدا نشد (404 Page)', category: 'خطا' },
];
