import { Outlet, Link, useLocation } from "react-router-dom";
import { Layout, Package, Clock, Calendar } from "lucide-react";

export default function MainPOSLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/pos", label: "الرئيسية", icon: Layout },
    { path: "/pos/inventory", label: "إدارة المخزون", icon: Package },
    { path: "/pos/daily", label: "جرد يومي", icon: Clock },
    { path: "/pos/history", label: "تاريخ", icon: Calendar },
  ];

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background text-text">
      <nav className="flex w-44 shrink-0 flex-col gap-2 pt-4 pr-4 border-r border-border h-full">
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

      <section className="flex-1 overflow-auto">
        <Outlet />
      </section>
    </main>
  );
}
