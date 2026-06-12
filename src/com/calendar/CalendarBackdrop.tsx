import Image from "next/image";

export default function CalendarBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#e5ebf1]">
      <Image
        src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=88"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-34"
      />
      <div className="absolute inset-0 bg-white/56 backdrop-blur-[2px]" />
    </div>
  );
}
