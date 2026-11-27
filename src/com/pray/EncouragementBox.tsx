"use client";

import { FormEvent, useState } from "react";

export default function EncouragementBox({
  disabled,
  disabledReason,
  onSubmit,
}: {
  disabled: boolean;
  disabledReason: string;
  onSubmit: (message: string) => Promise<boolean>;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = message.trim();
    if (!value || disabled) return;
    setSending(true);
    if (await onSubmit(value)) setMessage("");
    setSending(false);
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-3 border-t border-[#ececf0] bg-white px-6 py-5"
    >
      <label className="sr-only" htmlFor="encouragement">
        Viết lời động viên
      </label>
      <input
        id="encouragement"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={disabled || sending}
        maxLength={1000}
        placeholder={disabled ? disabledReason : "Viết lời động viên..."}
        className="h-12 flex-1 rounded-[14px] border border-[#e1e3e8] bg-[#f5f5f7] px-4 text-sm outline-none focus:border-[#6c4cff] disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled || sending || !message.trim()}
        className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f0ecff] text-xl font-bold text-[#6c4cff] disabled:opacity-50"
        aria-label="Gửi lời động viên"
      >
        {sending ? "…" : "▷"}
      </button>
    </form>
  );
}
