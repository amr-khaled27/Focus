import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { PageLoader } from "@renderer/components/PageLoader";
import { AdminGuard } from "@renderer/components/AdminGuard";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const POSMainPage = lazy(() => import("./pages/POSMainPage"));

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<AuthPage />} />

          <Route element={<AdminGuard />}>
            <Route path="/pos" element={<POSMainPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
