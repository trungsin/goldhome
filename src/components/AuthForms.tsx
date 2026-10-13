"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/app/actions/auth";

function Err({ msg }: { msg?: string[] }) {
  return msg ? <p className="mt-1 text-xs text-red-600">{msg[0]}</p> : null;
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state?.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" autoComplete="email" /></div>
      <div><label className="label" htmlFor="password">Mật khẩu</label><input id="password" name="password" type="password" required className="input" autoComplete="current-password" /></div>
      <button disabled={pending} className="btn-dark w-full">{pending ? "Đang đăng nhập…" : "Đăng nhập"}</button>
      <p className="text-center text-sm text-ink-600">Chưa có tài khoản? <Link href={`/dang-ky?next=${encodeURIComponent(next)}`} className="font-semibold text-gold-700">Đăng ký</Link></p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(register, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state?.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <div><label className="label" htmlFor="name">Họ tên</label><input id="name" name="name" required className="input" autoComplete="name" /><Err msg={state?.fieldErrors?.name} /></div>
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" autoComplete="email" /><Err msg={state?.fieldErrors?.email} /></div>
      <div><label className="label" htmlFor="phone">Số điện thoại</label><input id="phone" name="phone" required className="input" autoComplete="tel" /><Err msg={state?.fieldErrors?.phone} /></div>
      <div><label className="label" htmlFor="password">Mật khẩu</label><input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" /><Err msg={state?.fieldErrors?.password} /></div>
      <button disabled={pending} className="btn-dark w-full">{pending ? "Đang tạo tài khoản…" : "Tạo tài khoản"}</button>
      <p className="text-center text-sm text-ink-600">Đã có tài khoản? <Link href={`/dang-nhap?next=${encodeURIComponent(next)}`} className="font-semibold text-gold-700">Đăng nhập</Link></p>
    </form>
  );
}
