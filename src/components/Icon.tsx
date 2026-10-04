interface IconProps {
  name: string;
  size?: number;
}

export default function Icon({ name, size = 18 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "setup":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="10" rx="1.5" />
          <line x1="9" y1="19" x2="15" y2="19" />
          <line x1="12" y1="15" x2="12" y2="19" />
        </svg>
      );
    case "tecnologia":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
          <rect x="10.5" y="10.5" width="3" height="3" />
          <line x1="9" y1="4" x2="9" y2="7" />
          <line x1="15" y1="4" x2="15" y2="7" />
          <line x1="9" y1="17" x2="9" y2="20" />
          <line x1="15" y1="17" x2="15" y2="20" />
          <line x1="4" y1="9" x2="7" y2="9" />
          <line x1="4" y1="15" x2="7" y2="15" />
          <line x1="17" y1="9" x2="20" y2="9" />
          <line x1="17" y1="15" x2="20" y2="15" />
        </svg>
      );
    case "acessorios":
      return (
        <svg {...common}>
          <rect x="8" y="3" width="8" height="18" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
      );
    case "estudo":
      return (
        <svg {...common}>
          <path d="M4 5.5c2.5-1 5.5-1 8 .5 2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" />
          <line x1="12" y1="6" x2="12" y2="19" />
        </svg>
      );
    case "games":
      return (
        <svg {...common}>
          <rect x="3" y="9" width="18" height="8" rx="4" />
          <line x1="7" y1="11.6" x2="7" y2="14.4" />
          <line x1="5.6" y1="13" x2="8.4" y2="13" />
          <circle cx="16" cy="12" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="18" cy="14" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <rect x="2" y="9" width="11" height="7" />
          <path d="M13 11h3l3 3v2h-6z" />
          <circle cx="6.5" cy="17.3" r="1.3" />
          <circle cx="15.5" cy="17.3" r="1.3" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M8 16 17 7" />
          <path d="M10 7h7v7" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4 5h16" />
          <path d="M7 12h10" />
          <path d="M10 19h4" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case "review":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="6" />
          <line x1="14.5" y1="14.5" x2="19" y2="19" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );
    case "dot":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case "import":
      return (
        <svg {...common}>
          <path d="M12 4v10" />
          <path d="M8 11l4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    case "backup":
      return (
        <svg {...common}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
          <path d="M9 21v-6h6v6" />
          <path d="M9 3v4h6" />
        </svg>
      );
    case "notes":
      return (
        <svg {...common}>
          <path d="M7 3h8l4 4v14H7z" />
          <path d="M15 3v4h4" />
          <line x1="9.5" y1="12" x2="14.5" y2="12" />
          <line x1="9.5" y1="15.5" x2="13.5" y2="15.5" />
        </svg>
      );
    default:
      return null;
  }
}
