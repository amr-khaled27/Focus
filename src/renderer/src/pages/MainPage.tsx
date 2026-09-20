import type { JSX } from "react";
import useSettingsStore from "@renderer/store/settings";
import { PageLoader } from "@renderer/components/PageLoader";
import { useNavigate } from "react-router-dom";

export default function MainPage(): JSX.Element {
  const { user, clearUser, isChecking } = useSettingsStore();
  const navigate = useNavigate();

  const handleLogOut = () => {
    void window.api
      .logout()
      .then(() => {
        clearUser();
        navigate("/", { replace: true });
      })
      .catch((error) => {
        console.error("Failed to log out:", error);
      });
  };

  if (isChecking) {
    return <PageLoader />;
  }

  if (!user) {
    return <main className="p-6">No authenticated user found.</main>;
  }

  return (
    <main className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h1 className="text-2xl font-bold">{user.name}</h1>
          </div>
          <button
            type="button"
            onClick={handleLogOut}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <dt className="text-slate-500">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <dt className="text-slate-500">Role</dt>
            <dd>{user.role}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">User ID</dt>
            <dd>{user.id}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
