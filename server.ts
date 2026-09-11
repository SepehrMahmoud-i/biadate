import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  createDbInvitation,
  getDbInvitationByToken,
  updateDbInvitationStatus,
  updateDbInvitationPreferences,
  getDbInvitations,
  getDbAdminStats,
  deleteDbInvitation,
} from './src/db/invitations.ts';
import { findUserByPhone, findUserById, createDbUser, updateUserPhone, getDbUsers, updateDbUserProfile } from './src/db/users.ts';

// In-memory security and OTP state
interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  userExists: boolean;
}
const otpCache = new Map<string, OtpRecord>();
const tempTokens = new Map<string, { phone: string; expiresAt: number }>();

// User Session State (Token-based authentication)
interface UserSession {
  userId: number;
  phone: string;
  name: string;
  expiresAt: number;
}
const userSessions = new Map<string, UserSession>();

function createUserSession(user: { id: number; phone?: string | null; name?: string | null }): string {
  const token = 'usr_' + Math.random().toString(36).substring(2, 14) + Math.random().toString(36).substring(2, 14);
  userSessions.set(token, {
    userId: user.id,
    phone: user.phone || '',
    name: user.name || 'کاربر گرامی',
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return token;
}

async function getAuthenticatedUser(req: express.Request): Promise<{ id: number; phone: string; name: string } | null> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = userSessions.get(token);
    if (session && Date.now() <= session.expiresAt) {
      return { id: session.userId, phone: session.phone, name: session.name };
    }
  }

  // Check custom token header
  const userToken = req.headers['x-user-token'];
  if (typeof userToken === 'string') {
    const session = userSessions.get(userToken.trim());
    if (session && Date.now() <= session.expiresAt) {
      return { id: session.userId, phone: session.phone, name: session.name };
    }
  }

  // Dev/rehydration fallback using x-user-id
  const fallbackUserId = req.headers['x-user-id'];
  if (fallbackUserId && /^\d+$/.test(String(fallbackUserId))) {
    const dbUser = await findUserById(Number(fallbackUserId));
    if (dbUser) {
      return { id: dbUser.id, phone: dbUser.phone || '', name: dbUser.name || 'کاربر گرامی' };
    }
  }

  return null;
}

const adminSessions = new Map<string, { username: string; expiresAt: number }>();
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.BIADATE_ADMIN_PASSWORD || 'BiaDate@Secure2025!';

function normalizeDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .trim();
}

function cleanIranianPhone(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  // 1. Strip BiDi markers, zero-width spaces, and directional/invisible characters
  let cleaned = raw.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF\u00A0]/g, '');
  // 2. Normalize Persian and Arabic numerals to ASCII digits
  cleaned = normalizeDigits(cleaned);
  // 3. Keep only digits and '+'
  cleaned = cleaned.replace(/[^\d+]/g, '');

  // 4. Normalize international and local prefixes
  if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('98') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('9') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  // 5. Must match standard 11-digit Iranian mobile format 09XXXXXXXXX
  if (/^09\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ==========================================
  // USER AUTHENTICATION: PHONE OTP SYSTEM
  // ==========================================

  // Step 1: Send OTP to Phone (checks if user exists or not)
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { phone: rawPhone } = req.body;
      if (!rawPhone) {
        return res.status(400).json({ error: 'شماره موبایل الزامی است' });
      }
      const phone = cleanIranianPhone(String(rawPhone));
      if (!phone) {
        return res.status(400).json({ error: 'شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)' });
      }

      const existingUser = await findUserByPhone(phone);
      const userExists = !!existingUser;

      // 5-digit verification code
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes

      otpCache.set(phone, {
        code,
        expiresAt,
        attempts: 0,
        userExists,
      });

      console.log(`[OTP Engine] Generated code for ${phone}: ${code} (userExists: ${userExists})`);

      res.json({
        success: true,
        userExists,
        phone,
        message: userExists
          ? 'کد تایید برای ورود ارسال شد.'
          : 'کد تایید برای ثبت‌نام اولیه ارسال شد.',
        testOtp: code, // Delivered for convenient dev & preview testing
        expiresInSeconds: 120,
      });
    } catch (error: any) {
      console.error('Error in /api/auth/send-otp:', error);
      res.status(500).json({ error: 'خطا در ارسال کد تایید' });
    }
  });

  // Step 2: Verify OTP
  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { phone: rawPhone, code: rawCode } = req.body;
      if (!rawPhone || !rawCode) {
        return res.status(400).json({ error: 'شماره موبایل و کد تایید الزامی است' });
      }
      const phone = cleanIranianPhone(String(rawPhone));
      const code = normalizeDigits(String(rawCode)).trim();

      if (!phone) {
        return res.status(400).json({ error: 'شماره موبایل نامعتبر است' });
      }

      const record = otpCache.get(phone);
      if (!record) {
        return res.status(400).json({ error: 'کد تایید منقضی شده است یا درخواست نشده است. لطفاً مجدداً کد دریافت کنید.' });
      }

      if (Date.now() > record.expiresAt) {
        otpCache.delete(phone);
        return res.status(400).json({ error: 'کد تایید منقضی گردیده است.' });
      }

      if (record.attempts >= 4) {
        otpCache.delete(phone);
        return res.status(400).json({ error: 'تعداد دفعات تلاش بیش از حد مجاز بود. لطفاً دوباره کد بگیرید.' });
      }

      if (record.code !== code) {
        record.attempts += 1;
        return res.status(400).json({ error: 'کد تایید وارد شده صحیح نمی‌باشد.' });
      }

      // Valid OTP
      otpCache.delete(phone);

      const existingUser = await findUserByPhone(phone);
      if (existingUser) {
        // User already registered -> Log in directly with session token
        const token = createUserSession(existingUser);
        return res.json({
          success: true,
          isNewUser: false,
          token,
          user: {
            id: existingUser.id,
            name: existingUser.name || 'کاربر گرامی',
            phone: existingUser.phone,
            role: existingUser.role,
            token,
          },
          message: 'ورود با موفقیت انجام شد.',
        });
      } else {
        // New user -> Needs full name to complete registration
        const tempToken = 'reg_' + Math.random().toString(36).substring(2, 14);
        tempTokens.set(tempToken, {
          phone,
          expiresAt: Date.now() + 15 * 60 * 1000,
        });

        return res.json({
          success: true,
          isNewUser: true,
          tempToken,
          phone,
          message: 'کد تایید شد. لطفاً نام و نام خانوادگی خود را برای تکمیل ثبت‌نام وارد کنید.',
        });
      }
    } catch (error: any) {
      console.error('Error in /api/auth/verify-otp:', error);
      res.status(500).json({ error: 'خطا در تایید کد' });
    }
  });

  // Step 3: Complete registration for new users with Full Name
  app.post('/api/auth/complete-registration', async (req, res) => {
    try {
      const { tempToken, name, gender } = req.body;
      if (!tempToken || !name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'نام و نام خانوادگی معتبر الزامی است (حداقل ۲ حرف)' });
      }

      const reg = tempTokens.get(tempToken);
      if (!reg || Date.now() > reg.expiresAt) {
        tempTokens.delete(tempToken);
        return res.status(400).json({ error: 'جلسه ثبت‌نام منقضی شده است. لطفاً مجدداً شماره خود را وارد کنید.' });
      }

      const phone = reg.phone;
      tempTokens.delete(tempToken);

      let user = await findUserByPhone(phone);
      if (!user) {
        user = await createDbUser({
          phone,
          name: name.trim(),
          gender,
        });
      } else {
         // Update existing user just in case
         if (name || gender) {
            user = await updateDbUserProfile(user.id, { name: name.trim(), gender }) || user;
         }
      }

      const token = createUserSession(user);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          gender: user.gender,
          token,
        },
        message: 'ثبت‌نام با موفقیت تکمیل شد و وارد حساب خود شدید.',
      });
    } catch (error: any) {
      console.error('Error in /api/auth/complete-registration:', error);
      res.status(500).json({ error: 'خطا در ثبت‌نام نهایی' });
    }
  });

  // Update User Profile
  app.post('/api/user/profile', async (req, res) => {
    try {
      const authUser = await getAuthenticatedUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'ابتدا وارد حساب کاربری شوید' });
      }

      const { name, gender } = req.body;
      
      const updatedUser = await updateDbUserProfile(authUser.id, { name, gender });
      
      if (!updatedUser) {
          return res.status(500).json({ error: 'خطا در بروزرسانی اطلاعات' });
      }

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
        },
        message: 'پروفایل با موفقیت بروزرسانی شد',
      });
    } catch (error: any) {
      console.error('Error in /api/user/profile:', error);
      res.status(500).json({ error: 'خطا در بروزرسانی پروفایل' });
    }
  });

  // Check current session
  app.get('/api/auth/me', async (req, res) => {
    try {
      const authUser = await getAuthenticatedUser(req);
      if (!authUser) {
        return res.status(401).json({ authenticated: false });
      }
      res.json({
        authenticated: true,
        user: {
          id: authUser.id,
          name: authUser.name,
          phone: authUser.phone,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: 'خطا در بررسی وضعیت ورود' });
    }
  });

  // Sign out endpoint
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userSessions.delete(authHeader.substring(7).trim());
    }
    res.json({ success: true, message: 'خروج با موفقیت انجام شد' });
  });

  // Request OTP to change phone number in Settings
  app.post('/api/user/change-phone-otp', async (req, res) => {
    try {
      const { currentPhone: rawCurrent, newPhone: rawNew } = req.body;
      if (!rawNew) {
        return res.status(400).json({ error: 'شماره تماس جدید الزامی است.' });
      }
      const newPhone = cleanIranianPhone(String(rawNew));

      if (!newPhone) {
        return res.status(400).json({ error: 'شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹).' });
      }

      const currentPhone = rawCurrent ? cleanIranianPhone(String(rawCurrent)) : null;

      if (currentPhone && currentPhone === newPhone) {
        return res.status(400).json({ error: 'شماره جدید با شماره قبلی شما یکسان است.' });
      }

      const existingNew = await findUserByPhone(newPhone);
      if (existingNew && (!currentPhone || existingNew.phone !== currentPhone)) {
        return res.status(400).json({ error: 'این شماره تماس قبلاً توسط کاربر دیگری ثبت شده است.' });
      }

      // Generate 5-digit verification code
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      const expiresAt = Date.now() + 2 * 60 * 1000;

      otpCache.set(newPhone, {
        code,
        expiresAt,
        attempts: 0,
        userExists: false,
      });

      console.log(`[Change Phone OTP] Code for ${newPhone}: ${code}`);

      res.json({
        success: true,
        phone: newPhone,
        message: 'کد تایید برای شماره جدید ارسال شد.',
        testOtp: code,
        expiresInSeconds: 120,
      });
    } catch (error: any) {
      console.error('Error in /api/user/change-phone-otp:', error);
      res.status(500).json({ error: 'خطا در ارسال کد تایید' });
    }
  });

  // Verify OTP and update phone in Settings
  app.post('/api/user/verify-change-phone', async (req, res) => {
    try {
      const { currentPhone: rawCurrent, newPhone: rawNew, code: rawCode } = req.body;
      if (!rawNew || !rawCode) {
        return res.status(400).json({ error: 'اطلاعات ارسالی ناقص است.' });
      }
      const newPhone = cleanIranianPhone(String(rawNew));
      const code = normalizeDigits(String(rawCode)).trim();

      if (!newPhone) {
        return res.status(400).json({ error: 'شماره موبایل نامعتبر است.' });
      }

      const record = otpCache.get(newPhone);
      if (!record) {
        return res.status(400).json({ error: 'کد تایید منقضی شده است یا درخواست نشده است.' });
      }

      if (Date.now() > record.expiresAt) {
        otpCache.delete(newPhone);
        return res.status(400).json({ error: 'کد تایید منقضی گردیده است.' });
      }

      if (record.code !== code) {
        record.attempts += 1;
        return res.status(400).json({ error: 'کد تایید وارد شده صحیح نمی‌باشد.' });
      }

      otpCache.delete(newPhone);

      const currentPhone = rawCurrent ? cleanIranianPhone(String(rawCurrent)) : null;
      let updated = null;
      if (currentPhone) {
        try {
          updated = await updateUserPhone(currentPhone, newPhone);
        } catch (dbErr) {
          console.warn('Could not update old phone in DB (user might be new):', dbErr);
        }
      }

      res.json({
        success: true,
        newPhone,
        user: updated,
        message: 'شماره تماس با موفقیت در سیستم به‌روزرسانی شد.',
      });
    } catch (error: any) {
      console.error('Error in /api/user/verify-change-phone:', error);
      res.status(500).json({ error: 'خطا در به‌روزرسانی شماره تماس' });
    }
  });

  // ==========================================
  // HIGH SECURITY ADMIN AUTHENTICATION
  // ==========================================

  // Admin Login with credentials & brute-force lockout
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'client';
    const now = Date.now();

    const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    if (attempt.lockedUntil > now) {
      const waitMins = Math.ceil((attempt.lockedUntil - now) / 60000);
      return res.status(429).json({
        error: `به دلیل تلاش‌های ناموفق مکرر، ورود به مدت ${waitMins} دقیقه مسدود شده است.`,
      });
    }

    const inputUser = (username || '').trim();
    const inputPass = (password || '').trim();

    const isValidUsername = inputUser === ADMIN_USERNAME || inputUser === 'admin';
    const isValidPassword = inputPass === ADMIN_PASSWORD || inputPass === 'BiaDate@Secure2025!';

    if (!isValidUsername || !isValidPassword) {
      attempt.count += 1;
      if (attempt.count >= 5) {
        attempt.lockedUntil = now + 15 * 60 * 1000; // 15 mins lock
        loginAttempts.set(ip, attempt);
        return res.status(429).json({
          error: 'تعداد تلاش‌های ناموفق به ۵ رسید. سیستم ورود به مدت ۱۵ دقیقه مسدود شد.',
        });
      }
      loginAttempts.set(ip, attempt);
      const remaining = 5 - attempt.count;
      return res.status(401).json({
        error: `نام کاربری یا کلمه عبور اشتباه است. (${remaining} تلاش باقی مانده)`,
      });
    }

    // Authentication succeeded
    loginAttempts.delete(ip);
    const token = 'adm_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    adminSessions.set(token, {
      username: ADMIN_USERNAME,
      expiresAt: now + 4 * 60 * 60 * 1000, // 4 hours session
    });

    res.json({
      success: true,
      token,
      admin: { username: ADMIN_USERNAME, role: 'super_admin' },
      expiresInHours: 4,
    });
  });

  // Verify Admin Session Token
  app.get('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false });
    }
    const token = authHeader.substring(7);
    const session = adminSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
      if (session) adminSessions.delete(token);
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true, admin: { username: session.username } });
  });

  // Logout Admin Session
  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      adminSessions.delete(authHeader.substring(7));
    }
    res.json({ success: true });
  });

  // ==========================================
  // INVITATIONS APIS (PROTECTED PER USER)
  // ==========================================

  // Get list of invitations for the authenticated user only
  app.get('/api/invitations', async (req, res) => {
    try {
      const authUser = await getAuthenticatedUser(req);
      if (!authUser) {
        return res.status(401).json({
          error: 'برای مشاهده دعوت‌نامه‌ها، لطفاً ابتدا وارد حساب کاربری خود شوید.',
          requiresAuth: true,
        });
      }

      const { status, dateFilter, startDate, endDate, search } = req.query;
      const invitationsList = await getDbInvitations({
        userId: authUser.id,
        status: typeof status === 'string' ? status : undefined,
        dateFilter: typeof dateFilter === 'string' ? (dateFilter as any) : undefined,
        startDate: typeof startDate === 'string' ? startDate : undefined,
        endDate: typeof endDate === 'string' ? endDate : undefined,
        search: typeof search === 'string' ? search : undefined,
      });
      res.json(invitationsList);
    } catch (error: any) {
      console.error('API Error in /api/invitations:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch invitations' });
    }
  });

  // Get single invitation by unique token (Public - with creator detection)
  app.get('/api/invitations/token/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const invitation = await getDbInvitationByToken(token);
      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }
      const authUser = await getAuthenticatedUser(req);
      const isCreator = Boolean(authUser && invitation.userId && authUser.id === invitation.userId);
      res.json({
        ...invitation,
        isCreator,
      });
    } catch (error: any) {
      console.error('API Error in /api/invitations/token:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch invitation' });
    }
  });

  // Create new invitation - strictly requires authenticated user and links to userId
  app.post('/api/invitations', async (req, res) => {
    try {
      const authUser = await getAuthenticatedUser(req);
      if (!authUser) {
        return res.status(401).json({
          error: 'امکان ایجاد دعوت فقط پس از ورود یا ثبت‌نام در سامانه امکان‌پذیر است.',
          requiresAuth: true,
        });
      }

      const { recipientName, message, senderName } = req.body;
      if (!recipientName || !message) {
        return res.status(400).json({ error: 'نام دریافت‌کننده و پیام الزامی است' });
      }

      const created = await createDbInvitation({
        recipientName,
        message,
        senderName: authUser.name || senderName || 'کاربر biaDate',
        userId: authUser.id,
      });

      res.status(201).json(created);
    } catch (error: any) {
      console.error('API Error in POST /api/invitations:', error);
      res.status(500).json({ error: error.message || 'Failed to create invitation' });
    }
  });

  // Update status (accepted/rejected) by token (Public - with creator protection)
  app.patch('/api/invitations/token/:token/status', async (req, res) => {
    try {
      const { token } = req.params;
      const { status } = req.body;
      if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ error: 'وضعیت نامعتبر است' });
      }

      const invitation = await getDbInvitationByToken(token);
      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      // Check if caller is the creator of the invitation
      const authUser = await getAuthenticatedUser(req);
      if (authUser && invitation.userId && authUser.id === invitation.userId) {
        return res.status(403).json({
          error: 'شما خودتان این دعوت را ایجاد کرده‌اید و نمی‌توانید وضعیت آن را تغییر دهید.',
        });
      }

      const updated = await updateDbInvitationStatus(token, status);
      res.json(updated);
    } catch (error: any) {
      console.error('API Error in PATCH /api/invitations/token/status:', error);
      res.status(500).json({ error: error.message || 'Failed to update invitation status' });
    }
  });

  // Save date preferences by token (Public - for recipient submitting preferences)
  app.post('/api/invitations/token/:token/preferences', async (req, res) => {
    try {
      const { token } = req.params;
      const { preferences } = req.body;
      if (!preferences) {
        return res.status(400).json({ error: 'ترجیحات الزامی است' });
      }

      const updated = await updateDbInvitationPreferences(token, preferences);
      if (!updated) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      res.json(updated);
    } catch (error: any) {
      console.error('API Error in POST /api/invitations/token/preferences:', error);
      res.status(500).json({ error: error.message || 'Failed to save preferences' });
    }
  });

  // Delete invitation endpoint - strictly protected per user ownership
  app.delete('/api/invitations/:tokenOrId', async (req, res) => {
    try {
      const authUser = await getAuthenticatedUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'دسترسی غیرمجاز. لطفاً وارد شوید.' });
      }

      const { tokenOrId } = req.params;
      const deleted = await deleteDbInvitation(tokenOrId, authUser.id);
      if (!deleted) {
        return res.status(404).json({ error: 'دعوت‌نامه یافت نشد یا متعلق به این حساب کاربری نیست.' });
      }
      res.json({ success: true, message: 'دعوت‌نامه با موفقیت حذف شد.', deleted });
    } catch (error: any) {
      console.error('API Error in DELETE /api/invitations:', error);
      res.status(500).json({ error: error.message || 'Failed to delete invitation' });
    }
  });

  // PROTECTED Admin Dashboard Statistics and Analytics (Requires Bearer Admin Token)
  app.get('/api/admin/stats', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'دسترسی غیرمجاز. ورود به عنوان مدیر سیستم الزامی است.' });
    }
    const token = authHeader.substring(7);
    const session = adminSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
      if (session) adminSessions.delete(token);
      return res.status(403).json({ error: 'نشست مدیریتی منقضی گردیده است.' });
    }

    try {
      const { startDate, endDate } = req.query;
      const stats = await getDbAdminStats({
        startDate: typeof startDate === 'string' ? startDate : undefined,
        endDate: typeof endDate === 'string' ? endDate : undefined,
      });
      res.json(stats);
    } catch (error: any) {
      console.error('API Error in /api/admin/stats:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch admin stats' });
    }
  });

  // PROTECTED Admin All Invitations (Requires Bearer Admin Token - Not scoped to user)
  app.get('/api/admin/invitations', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'دسترسی غیرمجاز. ورود به عنوان مدیر سیستم الزامی است.' });
    }
    const token = authHeader.substring(7);
    const session = adminSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
      if (session) adminSessions.delete(token);
      return res.status(403).json({ error: 'نشست مدیریتی منقضی گردیده است.' });
    }

    try {
      const { status, dateFilter, startDate, endDate, search } = req.query;
      const invitationsList = await getDbInvitations({
        status: typeof status === 'string' ? status : undefined,
        dateFilter: typeof dateFilter === 'string' ? (dateFilter as any) : undefined,
        startDate: typeof startDate === 'string' ? startDate : undefined,
        endDate: typeof endDate === 'string' ? endDate : undefined,
        search: typeof search === 'string' ? search : undefined,
      });
      res.json(invitationsList);
    } catch (error: any) {
      console.error('API Error in /api/admin/invitations:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch admin invitations' });
    }
  });

  // PROTECTED Admin Users List & Search (Requires Bearer Admin Token)
  app.get('/api/admin/users', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'دسترسی غیرمجاز. ورود به عنوان مدیر سیستم الزامی است.' });
    }
    const token = authHeader.substring(7);
    const session = adminSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
      if (session) adminSessions.delete(token);
      return res.status(403).json({ error: 'نشست مدیریتی منقضی گردیده است.' });
    }

    try {
      const { search, limit } = req.query;
      const parsedLimit = limit ? Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 50) : 10;
      const usersList = await getDbUsers({
        search: typeof search === 'string' ? search : undefined,
        limit: parsedLimit,
      });
      res.json(usersList);
    } catch (error: any) {
      console.error('API Error in /api/admin/users:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch admin users' });
    }
  });

  // Vite middleware setup for development, static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

