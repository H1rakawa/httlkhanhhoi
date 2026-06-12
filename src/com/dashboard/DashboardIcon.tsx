type DashboardIconProps = {
  name: string;
  className?: string;
};

export default function DashboardIcon({
  name,
  className = "h-6 w-6",
}: DashboardIconProps) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  if (name === "book") {
    return (
      <svg {...commonProps}>
        <path d="M4 5.5c2.8-.8 5.5-.3 8 1.4v12c-2.5-1.7-5.2-2.2-8-1.4z" />
        <path d="M20 5.5c-2.8-.8-5.5-.3-8 1.4v12c2.5-1.7 5.2-2.2 8-1.4z" />
      </svg>
    );
  }

  if (name === "document" || name === "upload") {
    return (
      <svg {...commonProps}>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M14 3v4h4" />
        <path d="M9 13h6M9 16h4" />
      </svg>
    );
  }

  if (name === "group" || name === "community") {
    return (
      <svg {...commonProps}>
        <circle cx="9" cy="9" r="2.5" />
        <circle cx="16.5" cy="10" r="2" />
        <path d="M4 19c.5-3.2 2.2-5 5-5s4.5 1.8 5 5" />
        <path d="M14 15c2.8 0 4.5 1.2 5 4" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...commonProps}>
        <path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" />
        <path d="M8 12h2M14 12h2M8 16h2M14 16h2" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...commonProps}>
        <path d="M6 16h12l-1.5-2V9a4.5 4.5 0 0 0-9 0v5z" />
        <path d="M10 19h4" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 14.7 6L14.4 3h-4.8L9.3 6a8 8 0 0 0-1.8 1.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A8 8 0 0 0 9.3 18l.3 3h4.8l.3-3a8 8 0 0 0 1.8-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 3v18M3 12h18" />
    </svg>
  );
}
