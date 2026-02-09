import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import SubjectsPage from './pages/Subjects';
import SubjectDetailPage from './pages/SubjectDetail';
import CreateSubjectPage from './pages/CreateSubject';
import MyWorkPage from './pages/MyWork';
import ReviewQueuePage from './pages/ReviewQueue';
import UsersPage from './pages/Users';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/subjects/new" element={<CreateSubjectPage />} />
                <Route path="/subjects/:id" element={<SubjectDetailPage />} />
                <Route path="/my-work" element={<MyWorkPage />} />
                <Route path="/review-queue" element={<ReviewQueuePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
