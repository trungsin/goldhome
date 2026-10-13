"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type FormState = { error?: string; fieldErrors?: Record<string, string[] | undefined> } | undefined;

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "/";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
  phone: z.string().trim().regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const { name, email, phone, password } = parsed.data;
  if (await prisma.user.findUnique({ where: { email } })) return { error: "Email này đã được đăng ký" };
  const user = await prisma.user.create({ data: { name, email, phone, passwordHash: await bcrypt.hash(password, 10) } });
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "Email hoặc mật khẩu không đúng" };
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
