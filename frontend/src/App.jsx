import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import UserEdit from './pages/admin/UserEdit';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Experience from './pages/Experience';
import Education from './pages/Education';
import Certifications from './pages/Certifications';
import Languages from './pages/Languages';
import ResumeManager from './pages/ResumeManager';
import Settings from './pages/Settings';
import JobPreferences from './pages/JobPreferences';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import SavedJobs from './pages/SavedJobs';
import JobActivity from './pages/JobActivity';
import Applications from './pages/Applications';
import ApplicationKanban from './pages/ApplicationKanban';
import ApplicationDetail from './pages/ApplicationDetail';
import ApplicationFormPage from './pages/ApplicationFormPage';
import InterviewManager from './pages/InterviewManager';
import ApplicationAnalytics from './pages/ApplicationAnalytics';
import AIToolsDashboard from './pages/AIToolsDashboard';
import AIToolPage from './pages/AIToolPage';
import GeneratedDocuments from './pages/GeneratedDocuments';
import GeneratedDocumentDetail from './pages/GeneratedDocumentDetail';
import NotFound from './pages/NotFound';
import AutomationDashboard from './pages/automation/AutomationDashboard';
import AutomationProfile from './pages/automation/AutomationProfile';
import AutomationHistory from './pages/automation/AutomationHistory';
import StartAutomation from './pages/automation/StartAutomation';
import AutomationRunDetail from './pages/automation/AutomationRunDetail';
import AutomationReview from './pages/automation/AutomationReview';
import AutomationActionRequired from './pages/automation/AutomationActionRequired';
import AutomationAnswers from './pages/automation/AutomationAnswers';
import AutomationMonitoring from './pages/admin/AutomationMonitoring';
import NotificationCenter from './pages/notifications/NotificationCenter';
import NotificationPreferences from './pages/notifications/NotificationPreferences';
import NotificationMonitoring from './pages/admin/NotificationMonitoring';
import SchedulerMonitoring from './pages/admin/SchedulerMonitoring';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes */}
          <Route element={<ProtectedRoute requiredRole="user" />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/skills" element={<Skills />} />
            <Route path="/profile/experience" element={<Experience />} />
            <Route path="/profile/education" element={<Education />} />
            <Route path="/profile/certifications" element={<Certifications />} />
            <Route path="/profile/languages" element={<Languages />} />
            <Route path="/profile/resume" element={<ResumeManager />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/job-preferences" element={<JobPreferences />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/jobs/:id/activity" element={<JobActivity />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/kanban" element={<ApplicationKanban />} />
            <Route path="/applications/analytics" element={<ApplicationAnalytics />} />
            <Route path="/applications/new" element={<ApplicationFormPage />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/applications/:id/edit" element={<ApplicationFormPage />} />
            <Route path="/applications/:id/interviews" element={<InterviewManager />} />
            <Route path="/ai" element={<AIToolsDashboard />} />
            <Route path="/ai/cover-letter" element={<AIToolPage tool="coverLetter" />} />
            <Route path="/ai/resume-summary" element={<AIToolPage tool="resumeSummary" />} />
            <Route path="/ai/resume-optimizer" element={<AIToolPage tool="resumeOptimizer" />} />
            <Route path="/ai/job-fit" element={<AIToolPage tool="jobFit" />} />
            <Route path="/ai/interview-prep" element={<AIToolPage tool="interviewPrep" />} />
            <Route path="/ai/follow-up" element={<AIToolPage tool="followUp" />} />
            <Route path="/generated-documents" element={<GeneratedDocuments />} />
            <Route path="/generated-documents/:id" element={<GeneratedDocumentDetail />} />
            <Route path="/automation" element={<AutomationDashboard />} />
            <Route path="/automation/profile" element={<AutomationProfile />} />
            <Route path="/automation/runs" element={<AutomationHistory />} />
            <Route path="/automation/start/:applicationId" element={<StartAutomation />} />
            <Route path="/automation/runs/:id" element={<AutomationRunDetail />} />
            <Route path="/automation/runs/:id/review" element={<AutomationReview />} />
            <Route path="/automation/runs/:id/action-required" element={<AutomationActionRequired />} />
            <Route path="/automation/answers" element={<AutomationAnswers />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/notifications/preferences" element={<NotificationPreferences />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/users/:id" element={<UserEdit />} />
            <Route path="/admin/automation" element={<AutomationMonitoring />} />
            <Route path="/admin/notifications" element={<NotificationMonitoring />} />
            <Route path="/admin/scheduler" element={<SchedulerMonitoring />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;