import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/login/LoginPage";
import AppLayout from "./AppLayout";
import PrivateRoute from "./PrivateRoute";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import ApartmentsManagementPage from "../pages/apartments-management/ApartmentsManagement";
import ApartmentDetailPage from "../pages/apartments-management/ApartmentDetailPage";
import NotificationPage from "../pages/notifications/NotificationPage";
import RevenuePage from "../pages/revenue/RevenuePage";
import HistoryPage from "../pages/history/HistoryPage";
import TransactionPage from "../pages/transaction/TransactionPage";

const Index = () => {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route
          path="/apartments-management"
          element={<ApartmentsManagementPage />}
        />
        <Route path="/revenue" element={<RevenuePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/transaction" element={<TransactionPage />} />
        <Route
          path="/apartments-management/:id"
          element={<ApartmentDetailPage />}
        />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default Index;
