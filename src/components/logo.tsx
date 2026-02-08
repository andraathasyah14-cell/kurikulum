export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>UECD Logo</title>
      <circle cx="20" cy="20" r="18" fill="url(#paint0_linear_1_2)" />
      <path
        d="M12 28C12 28 15 22 20 22C25 22 28 28 28 28M12 12C12 12 15 18 20 18C25 18 28 12 28 12"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 30V10"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1_2"
          x1="20"
          y1="2"
          x2="20"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
    </svg>
  );
}
