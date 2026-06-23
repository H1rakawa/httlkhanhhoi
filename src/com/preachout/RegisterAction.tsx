import Link from "next/link";

type RegisterActionProps = {
  label: string;
  featured?: boolean;
  compact?: boolean;
};

export default function RegisterAction({
  label,
  featured = false,
  compact = false,
}: RegisterActionProps) {
  return (
    <Link
      href="/contact"
      className={[
        "inline-flex items-center justify-center rounded-[12px] text-sm font-semibold no-underline",
        compact ? "h-10 px-5" : "h-11 w-full px-5",
        featured
          ? "bg-[#111113] text-white"
          : "border border-white/90 bg-white/58 text-[#424245]",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
