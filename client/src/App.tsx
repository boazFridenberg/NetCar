
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { VehicleDetailPage } from '@/pages/VehicleDetailPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { ComparisonPage } from '@/pages/ComparisonPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminPage } from '@/pages/AdminPage';
import { ContactPage } from '@/pages/ContactPage';
import { ContentPage } from '@/pages/ContentPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />

            <Route path="catalog" element={<CatalogPage />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="contact" element={<ContactPage />} />

            <Route path="about" element={<ContentPage pageId="about" />} />
            <Route path="how-it-works" element={<ContentPage pageId="how-it-works" />} />
            <Route path="careers" element={<ContentPage pageId="careers" />} />
            <Route path="press" element={<ContentPage pageId="press" />} />
            <Route path="gov-registry" element={<ContentPage pageId="gov-registry" />} />
            <Route path="calculation-method" element={<ContentPage pageId="calculation-method" />} />
            <Route path="help" element={<ContentPage pageId="help" />} />
            <Route path="privacy" element={<ContentPage pageId="privacy" />} />
            <Route path="terms" element={<ContentPage pageId="terms" />} />
            <Route path="cookies" element={<ContentPage pageId="cookies" />} />
            <Route path="data-sources" element={<ContentPage pageId="data-sources" />} />

            
            <Route
              path="compare"
              element={
                <ProtectedRoute>
                  <ComparisonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
