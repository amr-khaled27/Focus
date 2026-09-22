import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@renderer/components/Input";
import { PasswordVisibilityToggle } from "./PasswordVisibilityToggle";
import useSettingsStore from "@renderer/store/settings";

const adminSignUpSchema = z.object({
  name: z.string().trim().min(2, "يرجى إدخال الاسم الكامل"),
  email: z.string().trim().email("يرجى إدخال بريد إلكتروني صحيح"),
  pin: z.string().regex(/^\d{6}$/, "يجب أن يتكون الرقم السري من 6 أرقام"),
});

type AdminSignUpValues = z.infer<typeof adminSignUpSchema>;

export default function AdminSignUp() {
  console.log("AdminSignUp component rendered");
  const { setIsAdminInitialized, setUser } = useSettingsStore();
  const navigate = useNavigate();
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminSignUpValues>({
    resolver: zodResolver(adminSignUpSchema),
    mode: "onBlur",
  });

  const handleValidSubmit = async (data: AdminSignUpValues) => {
    setSubmitError("");

    try {
      const res = await window.api.initAdmin(data);

      if (!res.user) {
        setSubmitError(res.error || "حدث خطأ أثناء إنشاء الحساب");
        return;
      }

      if (res.success) {
        setIsAdminInitialized(true);
        setUser({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
        });
        navigate("/pos", { replace: true });
        return;
      }

      if (res.error) {
        setSubmitError(res.error);
      }
    } catch {
      setSubmitError("حدث خطأ أثناء إنشاء الحساب");
    }
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-background text-right">
      <div className="grid h-full w-full grid-cols-[0.9fr_1.1fr] overflow-hidden bg-white">
        <section className="relative order-1 flex min-h-0 flex-col justify-between overflow-hidden bg-primary px-20 py-16 text-white">
          <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full border-38 border-secondary/25" />
          <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-accent/35 blur-[2px]" />

          <div className="relative">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 text-2xl font-bold ring-1 ring-white/20">
              ن
            </div>
            <h1 className="max-w-xl text-5xl font-bold leading-[1.35]">
              ابدأ بإعداد حساب المسؤول
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-9 text-white/80">
              أنشئ حسابك الأول لإدارة التطبيق والوصول إلى أدواتك من مكان واحد.
            </p>
          </div>

          <div className="relative mt-12 flex items-center gap-3 text-base text-white/80">
            <span className="h-2 w-2 rounded-full bg-[#b9e7d3]" />
            إعداد سريع وآمن
          </div>
        </section>

        <section className="order-2 flex min-h-0 items-center overflow-hidden px-24 py-16">
          <div className="w-full">
            <div className="mb-9">
              <p className="mb-3 text-base font-semibold text-accent">
                مرحبًا بك
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-text">
                إنشاء حساب جديد
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-500">
                أدخل بياناتك لإنشاء حساب المسؤول والبدء باستخدام التطبيق.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={handleSubmit(handleValidSubmit)}
              noValidate
            >
              <Input.Root>
                <Input.Label htmlFor="name">الاسم الكامل</Input.Label>
                <Input.Control
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="مثال: أحمد محمد"
                  registration={register("name")}
                />
                <Input.Error error={errors.name?.message} />
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor="email">البريد الإلكتروني</Input.Label>
                <Input.Control
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  dir="ltr"
                  registration={register("email")}
                />
                <Input.Error error={errors.email?.message} />
              </Input.Root>

              <Input.Root>
                <Input.Label htmlFor="pin">الرقم السري</Input.Label>
                <Input.Control
                  id="pin"
                  type={isPinVisible ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="new-password"
                  maxLength={6}
                  placeholder="••••••"
                  dir="ltr"
                  className="pl-14 text-left text-lg tracking-[0.35em]"
                  numericOnly
                  registration={register("pin")}
                >
                  <Input.Adornment>
                    <PasswordVisibilityToggle
                      isVisible={isPinVisible}
                      onToggle={() => setIsPinVisible((visible) => !visible)}
                    />
                  </Input.Adornment>
                </Input.Control>
                <Input.Error error={errors.pin?.message} />
              </Input.Root>

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="mt-4 h-14 w-full rounded-xl bg-primary px-5 text-base font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </button>
            </form>

            {submitError && (
              <p className="mt-4 text-sm text-red-600">{submitError}</p>
            )}

            <p className="mt-6 text-center text-sm leading-7 text-slate-400">
              بإنشاء الحساب، أنت توافق على شروط استخدام التطبيق.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
