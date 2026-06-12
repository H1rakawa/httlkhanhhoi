import Image from "next/image";

export default function AboutParallaxBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#dfe8ef]">
      <Image
        src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=88"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-42"
      />
      <div className="absolute inset-0 bg-white/52 backdrop-blur-[2px]" />
    </div>
  );
}
