import type {
  ChangeEvent,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type AuthInputRootProps = {
  children: ReactNode;
};

function AuthInputRoot({ children }: AuthInputRootProps) {
  return <div>{children}</div>;
}

function AuthInputLabel({
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={`mb-3 block text-base font-semibold text-text ${className}`}
    />
  );
}

type AuthInputControlProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onChange"
> & {
  children?: ReactNode;
  className?: string;
  numericOnly?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  registration?: UseFormRegisterReturn;
};

function AuthInputControl({
  children,
  className = "",
  numericOnly = false,
  onChange,
  registration,
  ...inputProps
}: AuthInputControlProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (numericOnly) {
      event.target.value = event.target.value.replace(/\D/g, "");
    }

    registration?.onChange(event);
    onChange?.(event);
  };

  return (
    <div className="relative">
      <input
        {...inputProps}
        {...registration}
        onChange={handleChange}
        className={`h-14 w-full rounded-xl border border-slate-200 bg-background px-4 text-base text-text outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10 ${className}`}
      />
      {children}
    </div>
  );
}

function AuthInputAdornment({ children }: { children: ReactNode }) {
  return children;
}

function AuthInputError({ error }: { error?: string }) {
  return error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null;
}

export const AuthInput = Object.assign(AuthInputRoot, {
  Root: AuthInputRoot,
  Label: AuthInputLabel,
  Control: AuthInputControl,
  Adornment: AuthInputAdornment,
  Error: AuthInputError,
});
