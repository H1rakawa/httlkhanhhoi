import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

export default function AuthBackdrop() {
  return (
    <SiteParallaxBackdrop
      imageOpacity="opacity-40"
      overlayClassName="bg-white/58 backdrop-blur-[3px]"
      priority
    />
  );
}
