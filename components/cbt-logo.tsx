import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { color?: string };

export function CbtLogo({ color = "#8a9b8e", className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Central Brain Trust"
      className={className}
      {...props}
    >
      {/* Top circle with "CBT" */}
      <circle
        cx="256"
        cy="135"
        r="105"
        fill="none"
        stroke={color}
        strokeWidth="7"
      />
      <text
        x="256"
        y="160"
        textAnchor="middle"
        fill={color}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="80"
        letterSpacing="3"
      >
        CBT
      </text>

      {/* Wordmark */}
      <text
        x="256"
        y="320"
        textAnchor="middle"
        fill={color}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="58"
        letterSpacing="4"
      >
        CENTRAL
      </text>
      <text
        x="256"
        y="385"
        textAnchor="middle"
        fill={color}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="58"
        letterSpacing="4"
      >
        BRAIN
      </text>
      <text
        x="256"
        y="450"
        textAnchor="middle"
        fill={color}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="58"
        letterSpacing="4"
      >
        TRUST
      </text>
    </svg>
  );
}
