import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useSettingsStore from "@renderer/store/settings";
import { User } from "@shared/types/User";
import { AuthInput } from "./AuthInput";
import { PasswordVisibilityToggle } from "./PasswordVisibilityToggle";

type LoginUser = Omit<User, "pin">;

type UserLoginValues = {
  pin: string;
};

export default function UserLogin() {
  console.log("login page rendered");

  const [users, setUsers] = useState<LoginUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<LoginUser | null>(null);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<UserLoginValues>();

  const handelUserSelection = (user: LoginUser) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
    setSelectedUser(user);
    reset();
    setError("");
  };

  useEffect(() => {
    window.api
      .getUsers()
      .then(setUsers)
      .catch(() => setError("Unable to load accounts"))
      .finally(() => setIsLoadingUsers(false));
  }, []);

  const handleLogin = async ({ pin }: UserLoginValues) => {
    if (!selectedUser) {
      return;
    }

    setError("");
    const result = await window.api.login({ userId: selectedUser.id, pin });

    if (!result.success) {
      setError(result.error);
      return;
    }

    useSettingsStore.getState().setUser(result.user);
    navigate("/pos", { replace: true });
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
              مرحبًا بعودتك
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-9 text-white/80">
              اختر حسابك وأدخل الرقم السري للوصول إلى التطبيق.
            </p>
          </div>

          <div className="relative mt-12 flex items-center gap-3 text-base text-white/80">
            <span className="h-2 w-2 rounded-full bg-[#b9e7d3]" />
            تسجيل دخول سريع وآمن
          </div>
        </section>

        <section className="order-2 flex min-h-0 items-center overflow-hidden px-24 py-16">
          <div className="w-full">
            <div className="mb-9">
              <p className="mb-3 text-base font-semibold text-accent">
                تسجيل الدخول
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-text">
                اختر حسابك
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-500">
                اختر الحساب الذي تريد استخدامه للمتابعة.
              </p>
            </div>

            {isLoadingUsers ? (
              <p className="text-sm text-slate-500">جاري تحميل الحسابات...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      handelUserSelection(user);
                    }}
                    className={`rounded-2xl border p-4 text-right transition focus:outline-none focus:ring-4 focus:ring-accent/10 ${
                      user.role === "admin"
                        ? "border-primary bg-primary text-white"
                        : selectedUser?.id === user.id
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`block font-semibold ${
                        user.role === "admin" ? "text-white" : "text-text"
                      }`}
                    >
                      {user.name}
                    </span>
                    <span
                      className={`mt-1 block text-sm ${
                        user.role === "admin"
                          ? "text-white/75"
                          : "text-slate-500"
                      }`}
                      dir="ltr"
                    >
                      {user.email}
                    </span>
                    {user.role === "admin" && (
                      <span className="mt-3 inline-block text-xs font-semibold text-white/80">
                        المسؤول
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedUser && (
              <form
                className="mt-8 space-y-5"
                onSubmit={handleSubmit(handleLogin)}
              >
                <AuthInput.Root>
                  <AuthInput.Label htmlFor="pin">
                    الرقم السري لـ {selectedUser.name}
                  </AuthInput.Label>
                  <AuthInput.Control
                    id="pin"
                    type={isPinVisible ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    numericOnly
                    registration={register("pin", {
                      required: "يرجى إدخال الرقم السري",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "يجب أن يتكون الرقم السري من 6 أرقام",
                      },
                    })}
                    autoFocus
                    dir="ltr"
                    className="pl-12 text-left text-lg tracking-[0.35em]"
                  >
                    <AuthInput.Adornment>
                      <PasswordVisibilityToggle
                        isVisible={isPinVisible}
                        onToggle={() => setIsPinVisible((visible) => !visible)}
                      />
                    </AuthInput.Adornment>
                  </AuthInput.Control>
                  <AuthInput.Error error={formErrors.pin?.message} />
                </AuthInput.Root>

                <button
                  type="submit"
                  className="h-14 w-full rounded-xl bg-primary px-5 text-base font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 active:translate-y-px"
                >
                  تسجيل الدخول
                </button>
              </form>
            )}

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
