import { eq, desc, or, ilike, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { users, invitations } from './schema.ts';

export async function findUserByPhone(phone: string) {
  try {
    const cleanPhone = phone.trim().replace(/^(\+98|0098)/, '0');
    const result = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error in findUserByPhone:', error);
    return null;
  }
}

export async function findUserById(id: number) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error in findUserById:', error);
    return null;
  }
}

export async function createDbUser({
  phone,
  name,
  gender,
  email,
}: {
  phone: string;
  name: string;
  gender?: string;
  email?: string;
}) {
  const cleanPhone = phone.trim().replace(/^(\+98|0098)/, '0');
  const uid = 'usr_' + Math.random().toString(36).substring(2, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      uid,
      phone: cleanPhone,
      name: name.trim(),
      gender: gender || null,
      email: email?.trim() || null,
      role: 'user',
    })
    .returning();

  return newUser;
}

export async function getDbUserStats() {
  try {
    const allUsers = await db.select().from(users);
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

    const total = allUsers.length;
    const todayCount = allUsers.filter((u) => getTime(u.createdAt) >= startOfToday.getTime()).length;
    const weekCount = allUsers.filter((u) => getTime(u.createdAt) >= startOfWeek.getTime()).length;
    const monthCount = allUsers.filter((u) => getTime(u.createdAt) >= startOfMonth.getTime()).length;

    return {
      total,
      todayCount,
      weekCount,
      monthCount,
    };
  } catch (error) {
    console.error('Error in getDbUserStats:', error);
    return {
      total: 0,
      todayCount: 0,
      weekCount: 0,
      monthCount: 0,
    };
  }
}

export async function updateUserPhone(currentPhone: string, newPhone: string) {
  try {
    const cleanCurrent = currentPhone.trim().replace(/^(\+98|0098)/, '0');
    const cleanNew = newPhone.trim().replace(/^(\+98|0098)/, '0');

    const [updated] = await db
      .update(users)
      .set({ phone: cleanNew })
      .where(eq(users.phone, cleanCurrent))
      .returning();

    return updated || null;
  } catch (error) {
    console.error('Error in updateUserPhone:', error);
    throw error;
  }
}

export async function updateDbUserProfile(
  userId: number,
  data: { name?: string; gender?: string }
) {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.gender !== undefined) updateData.gender = data.gender;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return updated || null;
  } catch (error) {
    console.error('Error in updateDbUserProfile:', error);
    throw error;
  }
}

export async function getDbUsers(params?: { search?: string; limit?: number }) {
  try {
    const limit = params?.limit || 10;
    const search = params?.search?.trim();

    const baseQuery = db
      .select({
        id: users.id,
        uid: users.uid,
        phone: users.phone,
        name: users.name,
        gender: users.gender,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        invitationsCount: sql<number>`count(${invitations.id})::int`,
      })
      .from(users)
      .leftJoin(invitations, eq(users.id, invitations.userId));

    if (search) {
      const cleanPhone = search.replace(/^(\+98|0098)/, '0');
      const conditions = or(
        ilike(users.name, `%${search}%`),
        ilike(users.phone, `%${search}%`),
        ilike(users.phone, `%${cleanPhone}%`)
      );

      return await baseQuery
        .where(conditions)
        .groupBy(users.id)
        .orderBy(desc(users.createdAt))
        .limit(limit);
    } else {
      return await baseQuery
        .groupBy(users.id)
        .orderBy(desc(users.createdAt))
        .limit(limit);
    }
  } catch (error) {
    console.error('Error in getDbUsers:', error);
    return [];
  }
}
