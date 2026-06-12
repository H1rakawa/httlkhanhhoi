import Image from "next/image";

export default function AuthBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#e8eef3]">
      <Image
        src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=88"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-46"
      />
      <div className="absolute inset-0 bg-white/48 backdrop-blur-[3px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.12),rgba(236,244,250,0.62))]" />
    </div>
  );
}
