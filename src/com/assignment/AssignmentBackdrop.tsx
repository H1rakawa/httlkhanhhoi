import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

export default function AssignmentBackdrop() {
  return (
    <SiteParallaxBackdrop
      imageOpacity="opacity-52"
      overlayClassName="bg-white/44 backdrop-blur-[1px]"
      priority
      strength={0.075}
    />
  );
}
