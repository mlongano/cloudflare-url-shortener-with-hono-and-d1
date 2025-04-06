import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { ThemeProvider } from "./components/theme-provider";
import DiagnisticsPage from "./pages/DiagnisticsPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col">
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />{" "}
            {/* Add dashboard route */}
            <Route path="/diagnostics" element={<DiagnisticsPage />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}
