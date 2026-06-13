import Image from "next/image";

export default function DashboardBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#dfe8ef]">
      <Image
        src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=88"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-66"
      />
      <div className="absolute inset-0 bg-white/28 backdrop-blur-[1px]" />
    </div>
  );
}
