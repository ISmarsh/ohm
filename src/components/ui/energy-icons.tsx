import type { SVGProps } from 'react';

interface EnergyIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/** 1 segment -- small energy */
export function EnergySmall({ size = 24, ...props }: EnergyIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <rect x="4" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

/** 2 segments -- medium energy */
export function EnergyMedium({ size = 24, ...props }: EnergyIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <rect x="4" y="4" width="5" height="16" rx="1" />
      <rect x="11" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

/** 3 segments -- large energy */
export function EnergyLarge({ size = 24, ...props }: EnergyIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <rect x="4" y="4" width="5" height="16" rx="1" />
      <rect x="11" y="4" width="5" height="16" rx="1" />
      <rect x="18" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}
