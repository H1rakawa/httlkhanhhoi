import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

export default function ContactBackdrop() {
  return (
    <SiteParallaxBackdrop
      imageOpacity="opacity-46"
      overlayClassName="bg-white/50 backdrop-blur-[2px]"
      priority
    />
  );
}
