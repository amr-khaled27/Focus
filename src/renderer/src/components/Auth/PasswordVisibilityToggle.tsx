type PasswordVisibilityToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
};

export function PasswordVisibilityToggle({
  isVisible,
  onToggle,
}: PasswordVisibilityToggleProps) {
  const label = isVisible ? "إخفاء الرقم السري" : "إظهار الرقم السري";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onToggle}
      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
    >
      {isVisible ? (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.5 3.5 20.5 20.5M10.6 10.6a2 2 0 0 0 2.8 2.8M6.2 6.3C4.5 7.4 3.2 9 2.5 12c1.4 4.4 4.8 6.5 9.5 6.5 1.7 0 3.2-.3 4.5-.9M9.8 5.6c.7-.1 1.4-.1 2.2-.1 4.7 0 8.1 2.1 9.5 6.5-.4 1.3-1 2.4-1.8 3.3"
          />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.5 12s3.4-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.4 6.5-9.5 6.5S2.5 12 2.5 12Z"
          />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )}
    </button>
  );
}
