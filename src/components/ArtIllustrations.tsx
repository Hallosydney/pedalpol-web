export function ArticleCoverArt({
  coverKey,
  coverImageUrl,
  title,
}: {
  coverKey: string;
  coverImageUrl?: string;
  title: string;
}) {
  if (coverImageUrl) {
    return (
      <img
        src={coverImageUrl}
        alt={title}
        className="w-full h-full object-cover block"
      />
    );
  }

  switch (coverKey) {
    case "menyapa-museum":
      return (
        <svg viewBox="0 0 600 280" className="w-full h-full block" aria-hidden="true">
          <rect width="600" height="280" fill="#EBE3D3" />
          <polygon
            points="110,110 300,48 490,110"
            fill="#FF5B37"
            stroke="#14101C"
            strokeWidth="4"
          />
          <rect
            x="130"
            y="110"
            width="340"
            height="125"
            fill="#F5F0E6"
            stroke="#14101C"
            strokeWidth="4"
          />
          <rect x="160" y="124" width="24" height="111" fill="#8E47EE" stroke="#14101C" strokeWidth="3" />
          <rect x="235" y="124" width="24" height="111" fill="#8E47EE" stroke="#14101C" strokeWidth="3" />
          <rect x="340" y="124" width="24" height="111" fill="#8E47EE" stroke="#14101C" strokeWidth="3" />
          <rect x="415" y="124" width="24" height="111" fill="#8E47EE" stroke="#14101C" strokeWidth="3" />
          <rect x="278" y="158" width="44" height="77" fill="#14101C" />
          <rect x="0" y="235" width="600" height="45" fill="#92FA66" stroke="#14101C" strokeWidth="3" />
          <text
            x="300"
            y="264"
            textAnchor="middle"
            fill="#14101C"
            fontFamily="Impact, sans-serif"
            fontSize="22"
            letterSpacing="1.5"
          >
            MENYAPA MUSEUM × MUSKITNAS
          </text>
        </svg>
      );
    case "ngelayap-95km":
      return (
        <svg viewBox="0 0 600 280" className="w-full h-full block" aria-hidden="true">
          <rect width="600" height="280" fill="#8E47EE" />
          <circle cx="110" cy="72" r="34" fill="#92FA66" stroke="#14101C" strokeWidth="4" />
          <polygon points="0,240 160,115 310,240" fill="#176B3F" stroke="#14101C" strokeWidth="4" />
          <polygon points="190,240 390,78 600,240" fill="#14101C" stroke="#92FA66" strokeWidth="4" />
          <path d="M 0 258 Q 220 218 410 248 T 600 232" fill="none" stroke="#92FA66" strokeWidth="7" />
          <text x="34" y="232" fill="#F5F0E6" fontFamily="Impact, sans-serif" fontSize="30">
            NGELAYAP // 95 KM ESCAPE
          </text>
        </svg>
      );
    case "bikecheck-fixie-harian":
      return (
        <svg viewBox="0 0 600 280" className="w-full h-full block" aria-hidden="true">
          <rect width="600" height="280" fill="#92FA66" />
          <circle cx="195" cy="172" r="64" fill="none" stroke="#14101C" strokeWidth="11" />
          <circle cx="405" cy="172" r="64" fill="none" stroke="#14101C" strokeWidth="11" />
          <circle cx="195" cy="172" r="52" fill="none" stroke="#8E47EE" strokeWidth="6" />
          <circle cx="405" cy="172" r="52" fill="none" stroke="#8E47EE" strokeWidth="6" />
          <polygon
            points="195,172 260,82 378,86 292,172"
            fill="none"
            stroke="#14101C"
            strokeWidth="9"
            strokeLinejoin="round"
          />
          <line x1="378" y1="86" x2="405" y2="172" stroke="#14101C" strokeWidth="9" />
          <rect x="28" y="24" width="210" height="34" fill="#14101C" />
          <text x="42" y="47" fill="#92FA66" fontFamily="Impact, sans-serif" fontSize="22">
            BIKE CHECK // PEDALPOL
          </text>
        </svg>
      );
    case "for-rest-forest":
      return (
        <svg viewBox="0 0 600 280" className="w-full h-full block" aria-hidden="true">
          <rect width="600" height="280" fill="#143B28" />
          <circle cx="495" cy="64" r="34" fill="#92FA66" />
          <polygon points="110,245 155,115 200,245" fill="#2CC46C" stroke="#14101C" strokeWidth="4" />
          <polygon points="210,245 270,85 330,245" fill="#92FA66" stroke="#14101C" strokeWidth="4" />
          <polygon points="335,245 385,125 435,245" fill="#1D8B4E" stroke="#14101C" strokeWidth="4" />
          <polygon points="440,245 485,138 530,245" fill="#2CC46C" stroke="#14101C" strokeWidth="4" />
          <rect x="0" y="232" width="600" height="48" fill="#14101C" />
          <text
            x="34"
            y="264"
            fill="#92FA66"
            fontFamily="Impact, sans-serif"
            fontSize="24"
            letterSpacing="1"
          >
            FOR REST FOREST × LINDUNGIHUTAN
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 600 280" className="w-full h-full block" aria-hidden="true">
          <rect width="600" height="280" fill="#14101C" />
          <circle cx="490" cy="68" r="36" fill="#92FA66" opacity="0.92" />
          <rect x="40" y="95" width="46" height="140" fill="#2A203A" stroke="#8E47EE" strokeWidth="2" />
          <rect x="98" y="65" width="56" height="170" fill="#231B32" stroke="#8E47EE" strokeWidth="2" />
          <rect x="168" y="110" width="64" height="125" fill="#2A203A" stroke="#8E47EE" strokeWidth="2" />
          <rect x="360" y="80" width="54" height="155" fill="#231B32" stroke="#8E47EE" strokeWidth="2" />
          <rect x="428" y="120" width="76" height="115" fill="#2A203A" stroke="#8E47EE" strokeWidth="2" />
          <rect x="0" y="218" width="600" height="62" fill="#211A2E" />
          <line x1="0" y1="248" x2="600" y2="248" stroke="#92FA66" strokeWidth="4" strokeDasharray="24 18" />
          <path d="M 80 236 L 315 236" stroke="#FF5B37" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
          <circle cx="322" cy="236" r="10" fill="#92FA66" />
          <text
            x="36"
            y="48"
            fill="#92FA66"
            fontFamily="Impact, sans-serif"
            fontSize="28"
            letterSpacing="1"
          >
            RABO-RABO // 20:00 WIB
          </text>
        </svg>
      );
  }
}

export function MerchCoverArt({
  artKey,
  imageUrl,
  title,
}: {
  artKey: string;
  imageUrl?: string;
  title: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover block"
      />
    );
  }

  switch (artKey) {
    case "tee-sunday-pol":
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full block" aria-hidden="true">
          <rect width="360" height="220" fill="#14101C" />
          <path
            d="M 116,38 L 152,28 Q 180,42 208,28 L 244,38 L 286,84 L 256,114 L 238,98 L 238,196 L 122,196 L 122,98 L 104,114 L 74,84 Z"
            fill="#F5F0E6"
            stroke="#92FA66"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <text x="180" y="96" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="19" fill="#8E47EE">
            SUNDAY
          </text>
          <text x="180" y="118" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="15" fill="#63C738">
            MORNING
          </text>
          <text x="180" y="156" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="38" fill="#8E47EE">
            POL
          </text>
        </svg>
      );
    case "commuter-musette":
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full block" aria-hidden="true">
          <rect width="360" height="220" fill="#92FA66" />
          <path d="M 132,76 C 132,26 228,26 228,76" fill="none" stroke="#14101C" strokeWidth="6" />
          <rect x="108" y="76" width="144" height="118" fill="#F5F0E6" stroke="#14101C" strokeWidth="4" />
          <polygon points="122,126 232,114 238,144 128,156" fill="#8E47EE" stroke="#14101C" strokeWidth="3" />
          <text
            x="180"
            y="142"
            textAnchor="middle"
            fontFamily="Impact, sans-serif"
            fontSize="19"
            fill="#92FA66"
            transform="rotate(-6 180 142)"
          >
            PEDAL POL
          </text>
        </svg>
      );
    case "sticker-pack":
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full block" aria-hidden="true">
          <rect width="360" height="220" fill="#EBE3D3" />
          <g transform="translate(48, 36) rotate(-8)">
            <polygon points="8,14 146,6 158,36 28,54" fill="#8E47EE" stroke="#14101C" strokeWidth="3.5" />
            <text x="82" y="36" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="22" fill="#92FA66">
              PEDAL POL
            </text>
          </g>
          <g transform="translate(182, 114) rotate(7)">
            <rect x="0" y="0" width="128" height="46" fill="#14101C" stroke="#FFFFFF" strokeWidth="3" />
            <text x="64" y="22" textAnchor="middle" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#92FA66">
              ★ RABO-RABO
            </text>
            <text x="64" y="37" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#F5F0E6">
              MENTENG JKT
            </text>
          </g>
          <circle cx="96" cy="148" r="40" fill="#176B3F" stroke="#FFFFFF" strokeWidth="3.5" />
          <path d="M96 122 L80 152 L112 152 Z" fill="#92FA66" />
          <text x="96" y="170" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#FFFFFF">
            FOR REST
          </text>
        </svg>
      );
    case "bidon-forest":
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full block" aria-hidden="true">
          <rect width="360" height="220" fill="#143B28" />
          <rect x="150" y="28" width="60" height="22" rx="4" fill="#14101C" stroke="#92FA66" strokeWidth="3" />
          <rect x="138" y="50" width="84" height="142" rx="14" fill="#92FA66" stroke="#14101C" strokeWidth="4" />
          <path d="M180 86 L160 124 L200 124 Z" fill="#143B28" />
          <text x="180" y="152" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="14" fill="#14101C">
            FOR REST
          </text>
          <text x="180" y="168" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="14" fill="#14101C">
            FOREST
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 360 220" className="w-full h-full block" aria-hidden="true">
          <rect width="360" height="220" fill="#EBE3D3" />
          <path
            d="M 118,38 L 150,28 Q 180,44 210,28 L 242,38 L 284,82 L 254,114 L 236,96 L 236,196 L 124,196 L 124,96 L 106,114 L 76,82 Z"
            fill="#8E47EE"
            stroke="#14101C"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <line x1="180" y1="36" x2="180" y2="196" stroke="#14101C" strokeWidth="2.5" strokeDasharray="5 4" />
          <polygon points="124,104 236,92 236,132 124,144" fill="#92FA66" stroke="#14101C" strokeWidth="2.5" />
          <text
            x="180"
            y="125"
            textAnchor="middle"
            fontFamily="Impact, sans-serif"
            fontSize="22"
            fill="#14101C"
            transform="rotate(-6 180 125)"
          >
            PEDAL POL
          </text>
        </svg>
      );
  }
}
