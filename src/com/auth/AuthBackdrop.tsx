import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

export default function AuthBackdrop() {
  return (
    <>
      <SiteParallaxBackdrop
        imageOpacity="opacity-56"
        overlayClassName="bg-white/36 backdrop-blur-[0.5px]"
        priority
        strength={0.072}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,247,222,0.34),transparent_28%),radial-gradient(circle_at_82%_76%,rgba(190,213,255,0.28),transparent_30%)]" />
    </>
  );
}
