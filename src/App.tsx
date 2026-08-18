import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CampProvider, useCamp } from './contexts/CampContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { CampSelectPage } from './pages/CampSelectPage';
import { DashboardPage } from './pages/DashboardPage';
import { DepartmentDetailPage } from './pages/DepartmentDetailPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { CampReportPage } from './pages/CampReportPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { selectedCampNo } = useCamp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!selectedCampNo) return <Navigate to="/login/select-camp" replace />;
  return children;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { selectedCampNo } = useCamp();
  if (isAuthenticated) {
    return <Navigate to={selectedCampNo ? '/' : '/login/select-camp'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CampProvider>
          <OrganizationProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/login/verify"
                  element={
                    <GuestRoute>
                      <VerifyOtpPage />
                    </GuestRoute>
                  }
                />
                <Route path="/login/select-camp" element={<CampSelectPage />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="departments" element={<Navigate to="/" replace />} />
                  <Route path="departments/:id" element={<DepartmentDetailPage />} />
                  <Route path="employees" element={<EmployeesPage />} />
                  <Route path="insights" element={<CampReportPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </OrganizationProvider>
        </CampProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
