import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useCurrentUser } from "./store";
import { Shell } from "./components/Shell";
import { LoginPage } from "./pages/LoginPage";
import { JobBoardPage } from "./pages/JobBoardPage";
import { TechBoardPage } from "./pages/TechBoardPage";
import { RepairOrderPage } from "./pages/RepairOrderPage";
import { InspectionPage } from "./pages/InspectionPage";
import { CustomersPage } from "./pages/CustomersPage";
import { NewROPage } from "./pages/NewROPage";
import { EstimatePage } from "./pages/EstimatePage";

function Guard({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  const user = useCurrentUser();
  const home = user?.role === "tech" ? "/techs" : "/board";

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home} replace /> : <LoginPage />} />
      <Route path="/approve/:id" element={<EstimatePage />} />
      <Route
        path="/"
        element={
          <Guard>
            <Navigate to={home} replace />
          </Guard>
        }
      />
      <Route path="/board" element={<Guard><JobBoardPage /></Guard>} />
      <Route path="/techs" element={<Guard><TechBoardPage /></Guard>} />
      <Route path="/customers" element={<Guard><CustomersPage /></Guard>} />
      <Route path="/ro/new" element={<Guard><NewROPage /></Guard>} />
      <Route path="/ro/:id" element={<Guard><RepairOrderPage /></Guard>} />
      <Route path="/ro/:id/inspect" element={<Guard><InspectionPage /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
