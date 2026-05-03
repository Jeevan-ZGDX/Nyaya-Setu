import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./layouts/AppLayout";
import CommandCenter from "./pages/CommandCenter";
import ActionWorkspace from "./pages/ActionWorkspace";
import ProcessingFeed from "./pages/ProcessingFeed";
import VerificationPanel from "./pages/VerificationPanel";
import DecisionDashboard from "./pages/DecisionDashboard";
import ResponsibilityGraphPage from "./pages/ResponsibilityGraphPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/workspace/:id" element={<ActionWorkspace />} />
            <Route path="/feed" element={<ProcessingFeed />} />
            <Route path="/verify/:id" element={<VerificationPanel />} />
            <Route path="/dashboard" element={<DecisionDashboard />} />
            <Route path="/graph/:id" element={<ResponsibilityGraphPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
