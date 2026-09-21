import type {
  ChangeEvent,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type InputRootProps = {
  children: ReactNode;
};

function InputRoot({ children }: InputRootProps) {
  return <div>{children}</div>;
}

function InputLabel({
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={`mb-3 block text-base font-semibold ${className}`}
    />
  );
}

type InputControlProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onChange"
> & {
  children?: ReactNode;
  className?: string;
  numericOnly?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  registration?: UseFormRegisterReturn;
};

function InputControl({
  children,
  className = "",
  numericOnly = false,
  onChange,
  registration,
  ...inputProps
}: InputControlProps) {
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

function InputAdornment({ children }: { children: ReactNode }) {
  return children;
}

function InputError({ error }: { error?: string }) {
  return error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null;
}

export const Input = Object.assign(InputRoot, {
  Root: InputRoot,
  Label: InputLabel,
  Control: InputControl,
  Adornment: InputAdornment,
  Error: InputError,
});
