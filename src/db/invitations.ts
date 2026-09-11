import { db } from './index.ts';
import { invitations, users } from './schema.ts';
import { eq, desc, sql, gte, lte, and, or, ilike } from 'drizzle-orm';
import crypto from 'crypto';
import { getDbUserStats } from './users.ts';

export interface CreateInvitationInput {
  recipientName: string;
  message: string;
  senderName?: string;
  userId?: number;
}

export interface DatePreferencesData {
  activities: string[];
  days: string[];
  timeSlot: string;
  notes: string;
}

// Generate unique, url-safe token for each invitation
export function generateDateToken(): string {
  const randomPart = crypto.randomBytes(6).toString('hex');
  return `tok_${randomPart}`;
}

export async function createDbInvitation(input: CreateInvitationInput) {
  try {
    const token = generateDateToken();
    const cleanName = input.recipientName.trim().replace(/\s+/g, '-').slice(0, 20);
    const slug = `${encodeURIComponent(cleanName.toLowerCase())}-${token.slice(4, 8)}`;

    const [newRecord] = await db.insert(invitations).values({
      token,
      slug,
      userId: input.userId || null,
      senderName: input.senderName || 'کاربر biaDate',
      recipientName: input.recipientName,
      message: input.message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return newRecord;
  } catch (error) {
    console.error('Database query createDbInvitation failed:', error);
    throw new Error('Failed to create invitation in database', { cause: error });
  }
}

export async function getDbInvitationByToken(token: string) {
  try {
    const records = await db.select().from(invitations).where(eq(invitations.token, token));
    return records[0] || null;
  } catch (error) {
    console.error(`Database query getDbInvitationByToken failed for token ${token}:`, error);
    throw new Error('Failed to retrieve invitation by token', { cause: error });
  }
}

export async function updateDbInvitationStatus(token: string, status: 'accepted' | 'rejected') {
  try {
    const isAccepted = status === 'accepted';
    const [updated] = await db.update(invitations)
      .set({
        status,
        acceptedAt: isAccepted ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(invitations.token, token))
      .returning();

    return updated || null;
  } catch (error) {
    console.error(`Database query updateDbInvitationStatus failed for token ${token}:`, error);
    throw new Error('Failed to update invitation status', { cause: error });
  }
}

export async function updateDbInvitationPreferences(token: string, prefs: DatePreferencesData) {
  try {
    const [updated] = await db.update(invitations)
      .set({
        preferences: prefs,
        updatedAt: new Date(),
      })
      .where(eq(invitations.token, token))
      .returning();

    return updated || null;
  } catch (error) {
    console.error(`Database query updateDbInvitationPreferences failed for token ${token}:`, error);
    throw new Error('Failed to save invitation preferences', { cause: error });
  }
}

export interface InvitationFilterOptions {
  userId?: number;
  status?: string;
  dateFilter?: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getDbInvitations(options: InvitationFilterOptions = {}) {
  try {
    const conditions = [];

    if (options.userId !== undefined && options.userId !== null) {
      conditions.push(eq(invitations.userId, options.userId));
    }

    if (options.status && options.status !== 'all') {
      conditions.push(eq(invitations.status, options.status));
    }

    if (options.search && options.search.trim()) {
      const q = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(invitations.recipientName, q),
          ilike(invitations.senderName, q),
          ilike(invitations.token, q)
        )
      );
    }

    const now = new Date();

    if (options.dateFilter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      conditions.push(gte(invitations.createdAt, startOfDay));
    } else if (options.dateFilter === 'week') {
      // 7 days ago
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      conditions.push(gte(invitations.createdAt, startOfWeek));
    } else if (options.dateFilter === 'month') {
      // 30 days ago
      const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      conditions.push(gte(invitations.createdAt, startOfMonth));
    } else if (options.dateFilter === 'custom') {
      if (options.startDate) {
        conditions.push(gte(invitations.createdAt, new Date(options.startDate)));
      }
      if (options.endDate) {
        // end of that day
        const endD = new Date(options.endDate);
        endD.setHours(23, 59, 59, 999);
        conditions.push(lte(invitations.createdAt, endD));
      }
    }

    const query = db
      .select({
        id: invitations.id,
        token: invitations.token,
        slug: invitations.slug,
        userId: invitations.userId,
        senderName: invitations.senderName,
        recipientName: invitations.recipientName,
        message: invitations.message,
        status: invitations.status,
        preferences: invitations.preferences,
        acceptedAt: invitations.acceptedAt,
        createdAt: invitations.createdAt,
        updatedAt: invitations.updatedAt,
        userPhone: users.phone,
        userRegisteredName: users.name,
      })
      .from(invitations)
      .leftJoin(users, eq(invitations.userId, users.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(invitations.createdAt));
    } else {
      return await query.orderBy(desc(invitations.createdAt));
    }
  } catch (error) {
    console.error('Database query getDbInvitations failed:', error);
    throw new Error('Failed to retrieve invitations list', { cause: error });
  }
}

export async function getDbAdminStats(options: { startDate?: string; endDate?: string } = {}) {
  try {
    const allRecords = await db.select().from(invitations).orderBy(desc(invitations.createdAt));

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const getTime = (d: any): number => {
      if (!d) return 0;
      if (d instanceof Date) return d.getTime();
      const p = new Date(d).getTime();
      return isNaN(p) ? 0 : p;
    };

    const total = allRecords.length;
    const accepted = allRecords.filter((i) => i.status === 'accepted').length;
    const pending = allRecords.filter((i) => i.status === 'pending').length;
    const rejected = allRecords.filter((i) => i.status === 'rejected').length;

    const todayList = allRecords.filter((i) => getTime(i.createdAt) >= startOfToday.getTime());
    const weekList = allRecords.filter((i) => getTime(i.createdAt) >= startOfWeek.getTime());
    const monthList = allRecords.filter((i) => getTime(i.createdAt) >= startOfMonth.getTime());

    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    // Daily breakdown for the last 7 days
    const dailyStats: { date: string; label: string; total: number; accepted: number; pending: number }[] = [];
    const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];

    for (let d = 6; d >= 0; d--) {
      const targetDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
      const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

      const dayItems = allRecords.filter((i) => {
        if (!i.createdAt) return false;
        const time = getTime(i.createdAt);
        return time >= dayStart.getTime() && time <= dayEnd.getTime();
      });

      const dayLabel = d === 0 ? 'امروز' : d === 1 ? 'دیروز' : dayNames[dayStart.getDay()];
      const isoDate = dayStart.toISOString().split('T')[0];

      dailyStats.push({
        date: isoDate,
        label: dayLabel,
        total: dayItems.length,
        accepted: dayItems.filter((i) => i.status === 'accepted').length,
        pending: dayItems.filter((i) => i.status === 'pending').length,
      });
    }

    const userStats = await getDbUserStats();

    return {
      summary: {
        total,
        accepted,
        pending,
        rejected,
        acceptanceRate,
        todayCount: todayList.length,
        weekCount: weekList.length,
        monthCount: monthList.length,
      },
      userStats,
      todayInvitations: todayList,
      weekInvitations: weekList,
      dailyStats,
    };
  } catch (error) {
    console.error('Database query getDbAdminStats failed:', error);
    throw new Error('Failed to retrieve admin stats', { cause: error });
  }
}

export async function deleteDbInvitation(tokenOrId: string | number, userId?: number) {
  try {
    let condition;
    if (typeof tokenOrId === 'number' || /^\d+$/.test(String(tokenOrId))) {
      condition = eq(invitations.id, Number(tokenOrId));
    } else {
      condition = eq(invitations.token, String(tokenOrId));
    }

    if (userId !== undefined && userId !== null) {
      condition = and(condition, eq(invitations.userId, userId));
    }

    const [deleted] = await db.delete(invitations).where(condition).returning();
    return deleted || null;
  } catch (error) {
    console.error(`Database query deleteDbInvitation failed for ${tokenOrId}:`, error);
    throw new Error('Failed to delete invitation', { cause: error });
  }
}

