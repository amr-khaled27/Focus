import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { PageLoader } from "@renderer/components/PageLoader";
import { AdminGuard } from "@renderer/components/AdminGuard";

const Auth = lazy(() => import("./pages/Auth"));
const MainPage = lazy(() => import("./pages/MainPage"));

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Auth />} />

          <Route element={<AdminGuard />}>
            <Route path="/test" element={<MainPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
