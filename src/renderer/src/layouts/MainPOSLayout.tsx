import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Package, Clock, Calendar } from "lucide-react";
import useSettingsStore from "@renderer/store/settings";

export default function MainPOSLayout() {
  const location = useLocation();
  const clearUser = useSettingsStore((state) => state.clearUser);
  const navigate = useNavigate();

  const navItems = [
    { path: "/pos", label: "الرئيسية", icon: Layout },
    { path: "/pos/inventory", label: "إدارة المخزون", icon: Package },
    { path: "/pos/daily", label: "جرد يومي", icon: Clock },
    { path: "/pos/history", label: "تاريخ", icon: Calendar },
  ];

  const handleLogout = async () => {
    await window.api.logout();
    clearUser();
    navigate("/", { replace: true });
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background text-text">
      <div>
        <nav className="flex w-44 shrink-0 flex-col gap-2 pt-4 pr-4 border-r border-border ">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-2 transition-colors ${
                  isActive
                    ? "bg-primary text-white rounded-2xl"
                    : "hover:bg-muted text-text rounded-2xl"
                }`}
              >
                <p>{item.label}</p>
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>

        <div className="buttons justify-center mt-4">
          <button
            onClick={handleLogout}
            className="p-2 rounded-2xl w-full text-center cursor-pointer"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      <section className="flex-1 overflow-auto">
        <Outlet />
      </section>
    </main>
  );
}
