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
import { TimeClockPage } from "./pages/TimeClockPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ReportsPage } from "./pages/ReportsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { MessagesPage } from "./pages/MessagesPage";
import { MarketingPage } from "./pages/MarketingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { VehiclePage } from "./pages/VehiclePage";
import { PrintPage } from "./pages/PrintPage";
import { BookPage } from "./pages/BookPage";

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
      <Route path="/book" element={<BookPage />} />
      <Route path="/approve/:id" element={<EstimatePage />} />
      <Route path="/print/:id/:kind" element={<PrintPage />} />
      <Route path="/" element={<Guard><Navigate to={home} replace /></Guard>} />
      <Route path="/board" element={<Guard><JobBoardPage /></Guard>} />
      <Route path="/techs" element={<Guard><TechBoardPage /></Guard>} />
      <Route path="/calendar" element={<Guard><CalendarPage /></Guard>} />
      <Route path="/clock" element={<Guard><TimeClockPage /></Guard>} />
      <Route path="/customers" element={<Guard><CustomersPage /></Guard>} />
      <Route path="/vehicles/:id" element={<Guard><VehiclePage /></Guard>} />
      <Route path="/inventory" element={<Guard><InventoryPage /></Guard>} />
      <Route path="/messages" element={<Guard><MessagesPage /></Guard>} />
      <Route path="/reports" element={<Guard><ReportsPage /></Guard>} />
      <Route path="/marketing" element={<Guard><MarketingPage /></Guard>} />
      <Route path="/settings" element={<Guard><SettingsPage /></Guard>} />
      <Route path="/ro/new" element={<Guard><NewROPage /></Guard>} />
      <Route path="/ro/:id" element={<Guard><RepairOrderPage /></Guard>} />
      <Route path="/ro/:id/inspect" element={<Guard><InspectionPage /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
