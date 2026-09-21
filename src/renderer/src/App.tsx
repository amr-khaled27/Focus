import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { PageLoader } from "@renderer/components/PageLoader";
import { AdminGuard } from "@renderer/components/AdminGuard";

const Auth = lazy(() => import("./pages/Auth"));
const POSMain = lazy(() => import("./pages/POSMain"));

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Auth />} />

          <Route element={<AdminGuard />}>
            <Route path="/pos" element={<POSMain />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
