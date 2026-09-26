import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { PageLoader } from "@renderer/components/PageLoader";
import { AdminGuard } from "@renderer/components/AdminGuard";
import MainPOSLayout from "./layouts/MainPOSLayout";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const POSMainPage = lazy(() => import("./pages/POSMainPage"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Daily = lazy(() => import("./pages/Daily"));
const History = lazy(() => import("./pages/History"));

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<AuthPage />} />

          <Route element={<AdminGuard />}>
            <Route element={<MainPOSLayout />}>
              <Route path="/pos" element={<POSMainPage />} />
              <Route path="/pos/inventory" element={<Inventory />} />
              <Route path="/pos/daily" element={<Daily />} />
              <Route path="/pos/history" element={<History />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
