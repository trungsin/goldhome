"use client";
import { useActionState } from "react";
import { sendInquiry } from "@/app/actions/listings";

export function InquiryForm({ listingId, defaultName = "", defaultPhone = "" }: { listingId: string; defaultName?: string; defaultPhone?: string }) {
  const [state, action, pending] = useActionState(sendInquiry, undefined);
  if (state?.ok) return <p className="rounded-xl bg-gold-50 p-4 text-sm text-gold-800">Đã gửi lời nhắn. Người đăng sẽ liên hệ lại với bạn sớm.</p>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <div>
        <input name="name" defaultValue={defaultName} placeholder="Họ tên" className="input" aria-label="Họ tên" />
        {state?.fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>}
      </div>
      <div>
        <input name="phone" defaultValue={defaultPhone} placeholder="Số điện thoại" className="input" aria-label="Số điện thoại" />
        {state?.fieldErrors?.phone && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone[0]}</p>}
      </div>
      <div>
        <textarea name="message" rows={3} defaultValue="Tôi quan tâm đến bất động sản này, vui lòng liên hệ lại." className="input" aria-label="Lời nhắn" />
        {state?.fieldErrors?.message && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.message[0]}</p>}
      </div>
      <button disabled={pending} className="btn-dark w-full">{pending ? "Đang gửi…" : "Gửi lời nhắn"}</button>
    </form>
  );
}
