import { prisma } from './db';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Validation schema for login
export const loginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Get user by username
export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  });
}

// Create user
export async function createUser(username: string, password: string) {
  const hashedPassword = await hashPassword(password);
  return prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });
}

