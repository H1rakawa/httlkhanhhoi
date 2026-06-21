import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

export default function DashboardBackdrop() {
  return (
    <SiteParallaxBackdrop
      imageOpacity="opacity-58"
      overlayClassName="bg-white/36 backdrop-blur-[1px]"
      priority
      strength={0.075}
    />
  );
}
