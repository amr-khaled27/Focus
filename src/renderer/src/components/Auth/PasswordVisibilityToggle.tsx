import { Eye, EyeOff } from "lucide-react";

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
      {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );
}
