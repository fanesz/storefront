import React from "react";
import type { ProductArtworkSpec } from "../types";

interface ProductArtworkProps {
  spec: ProductArtworkSpec;
  size?: number;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({ spec, size = 76 }) => {
  const { shape, primary, secondary, accent, badgeText, subText } = spec;

  if (shape === "sack") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="15" y="14" width="50" height="56" rx="8" fill={secondary} stroke={accent} strokeWidth="2" />
        <path
          d="M21 14h38l-3-6H24l-3 6Z"
          fill={secondary}
          stroke={accent}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <rect x="19" y="25" width="42" height="25" rx="5" fill={primary} />
        <text
          x="40"
          y="40.5"
          textAnchor="middle"
          fontSize="6.6"
          fontWeight="800"
          fill="#FFFFFF"
          letterSpacing="0.2"
        >
          {badgeText}
        </text>
        <rect x="27" y="55" width="26" height="10" rx="5" fill={accent} />
        <text x="40" y="62.2" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#FFFFFF">
          {subText}
        </text>
      </svg>
    );
  }

  if (shape === "pouch") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <path
          d="M22 15h36l4 49a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4l4-49Z"
          fill={primary}
          stroke={accent}
          strokeWidth="1.8"
        />
        <rect x="45" y="10" width="9" height="5" rx="1.5" fill={accent} />
        <circle cx="40" cy="39" r="14.5" fill={secondary} />
        <text x="40" y="41.5" textAnchor="middle" fontSize="6" fontWeight="800" fill={accent}>
          {badgeText}
        </text>
        <rect x="27" y="57" width="26" height="8.5" rx="4.25" fill={accent} />
        <text x="40" y="63.3" textAnchor="middle" fontSize="6" fontWeight="700" fill="#FFFFFF">
          {subText}
        </text>
      </svg>
    );
  }

  if (shape === "bottle") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="33" y="9" width="14" height="7" rx="2" fill={accent} />
        <path
          d="M31 16h18l5 10v40a5 5 0 0 1-5 5H31a5 5 0 0 1-5-5V26l5-10Z"
          fill={secondary}
          stroke={primary}
          strokeWidth="2"
        />
        <rect x="26" y="33" width="28" height="22" fill={primary} />
        <text x="40" y="43.5" textAnchor="middle" fontSize="5.8" fontWeight="800" fill="#FFFFFF">
          {badgeText}
        </text>
        <text x="40" y="51.5" textAnchor="middle" fontSize="5.4" fontWeight="700" fill="#E2E8F0">
          {subText}
        </text>
      </svg>
    );
  }

  if (shape === "tin") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="16" y="16" width="48" height="52" rx="6" fill={primary} stroke={accent} strokeWidth="2" />
        <rect x="14" y="12" width="52" height="6" rx="3" fill={accent} />
        <rect x="21" y="27" width="38" height="24" rx="4" fill={secondary} />
        <text x="40" y="38.5" textAnchor="middle" fontSize="5.6" fontWeight="800" fill={primary}>
          {badgeText}
        </text>
        <text x="40" y="47" textAnchor="middle" fontSize="5.8" fontWeight="700" fill={accent}>
          {subText}
        </text>
      </svg>
    );
  }

  if (shape === "pack") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="14" y="20" width="52" height="40" rx="6" fill={primary} stroke={accent} strokeWidth="1.8" />
        <rect x="19" y="26" width="42" height="20" rx="4" fill={secondary} />
        <text x="40" y="38.5" textAnchor="middle" fontSize="6.4" fontWeight="800" fill={primary}>
          {badgeText}
        </text>
        <text x="40" y="54.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#FFFFFF">
          {subText}
        </text>
      </svg>
    );
  }

  // Default: "box"
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <rect x="12" y="23" width="56" height="34" rx="6" fill={secondary} stroke={primary} strokeWidth="2" />
      <rect x="12" y="23" width="16" height="34" rx="4" fill={accent} />
      <text x="48" y="39" textAnchor="middle" fontSize="6.2" fontWeight="800" fill={primary}>
        {badgeText}
      </text>
      <text x="48" y="48.5" textAnchor="middle" fontSize="5.8" fontWeight="700" fill={accent}>
        {subText}
      </text>
    </svg>
  );
};
