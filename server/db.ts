import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, organizationMembers, organizations, OrganizationMember, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { createHash } from "node:crypto";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch {
      console.warn("[Database] Failed to connect");
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user");
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function ensurePersonalOrganization(userId: number, openId: string, displayName?: string | null) {
  const db = await getDb();
  if (!db) return undefined;
  const suffix = createHash("sha256").update(openId).digest("hex").slice(0, 16);
  const slug = `oficina-${suffix}`;
  const name = displayName?.trim() ? `Oficina de ${displayName.trim().slice(0, 120)}` : "Minha oficina MotoDiag";
  await db.insert(organizations).values({ name, slug }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  const organization = (await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1))[0];
  if (!organization) return undefined;
  await db.insert(organizationMembers).values({ organizationId: organization.id, userId, role: "owner" }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  return organization;
}

export async function getMembership(userId: number, organizationId?: number): Promise<OrganizationMember | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const query = organizationId
    ? and(eq(organizationMembers.userId, userId), eq(organizationMembers.organizationId, organizationId))
    : eq(organizationMembers.userId, userId);
  return (await db.select().from(organizationMembers).where(query).limit(1))[0];
}
