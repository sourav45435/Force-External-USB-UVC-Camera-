import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SystemProvider } from "@/context/SystemContext";
import Index from "./pages/Index";
import CameraConfig from "./pages/CameraConfig";
import ModuleSettings from "./pages/ModuleSettings";
import Logs from "./pages/Logs";
import TechSpec from "./pages/TechSpec";
import ProviderSettings from "./pages/ProviderSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SystemProvider>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/camera" element={<CameraConfig />} />
              <Route path="/modules" element={<ModuleSettings />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/spec" element={<TechSpec />} />
              <Route path="/provider" element={<ProviderSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </SystemProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
