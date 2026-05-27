export const MainLogo = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 24 24" fill="white" className={`w-5 h-5 ${className}`}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
};
