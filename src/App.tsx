import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PremiumProvider } from './context/PremiumContext';
import { LandingPage } from './pages/LandingPage';
import { AdModal } from './components/AdModal';
import { Dashboard } from './pages/Dashboard';
import { MediaLab } from './pages/MediaLab';
import { AiChat } from './pages/AiChat';
import { EditorPage } from './pages/EditorPage';
import { PDFConverter } from './pages/PDFConverter';
import { ElementStudio } from './pages/ElementStudio';
import { ChartsLibrary } from './pages/ChartsLibrary';
import { AuthPage } from './pages/AuthPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { TrashPage } from './pages/TrashPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ModelLibraryPage } from './pages/ModelLibraryPage';
import { AiSheetsPage } from './pages/AiSheetsPage';
import FrameLibrary from './pages/FrameLibrary';
import ClipperPage from './pages/ClipperPage';
import { AutonomousAgentPage } from './pages/AutonomousAgentPage';
import { LogicMapper } from './pages/LogicMapper';
import SavedArchive from './pages/SavedArchive';
import { SignPDFPage } from './pages/SignPDFPage';
import { ImageTextEmbedderPage } from './pages/ImageTextEmbedderPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CompliancePage } from './pages/CompliancePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AboutPage } from './pages/AboutPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { FeaturesPage } from './pages/FeaturesPage';

import { ContactPage } from './pages/ContactPage';
import { SupportFormPage } from './pages/SupportFormPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ServicesPage } from './pages/ServicesPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { FAQPage } from './pages/FAQPage';

import { DocumentationPage } from './pages/DocumentationPage';
import { AnimatePresence, motion } from 'motion/react';
import { InternalSecurityGate } from './components/InternalSecurityGate';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full w-full flex bg-[#FAF9F6] text-[#1a1a1a]"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/cookies" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/careers" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support-form" element={<SupportFormPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/api" element={<Navigate to="/" replace />} />
        <Route path="/api-reference" element={<Navigate to="/" replace />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/status" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<PageTransition><ProtectedRoute><Dashboard /></ProtectedRoute></PageTransition>} />
        <Route path="/media" element={<PageTransition><ProtectedRoute><MediaLab /></ProtectedRoute></PageTransition>} />
        <Route path="/chat" element={<PageTransition><ProtectedRoute><AiChat /></ProtectedRoute></PageTransition>} />
        <Route path="/pdf/convert" element={<PageTransition><ProtectedRoute><PDFConverter /></ProtectedRoute></PageTransition>} />
        <Route path="/doc/:id" element={<PageTransition><ProtectedRoute><EditorPage /></ProtectedRoute></PageTransition>} />
        <Route path="/ai-sheets" element={<PageTransition><ProtectedRoute><AiSheetsPage /></ProtectedRoute></PageTransition>} />
        <Route path="/doc/:id/studio" element={<PageTransition><ProtectedRoute><ElementStudio /></ProtectedRoute></PageTransition>} />
        <Route path="/doc/:id/charts" element={<PageTransition><ProtectedRoute><ChartsLibrary /></ProtectedRoute></PageTransition>} />
        <Route path="/doc/:id/clipper" element={<PageTransition><ProtectedRoute><ClipperPage /></ProtectedRoute></PageTransition>} />
        <Route path="/doc/:id/frames" element={<PageTransition><ProtectedRoute><FrameLibrary /></ProtectedRoute></PageTransition>} />
        <Route path="/doc/:id/tools/agent" element={<PageTransition><ProtectedRoute><AutonomousAgentPage /></ProtectedRoute></PageTransition>} />
        <Route path="/tools/sign-pdf" element={<PageTransition><ProtectedRoute><SignPDFPage /></ProtectedRoute></PageTransition>} />
        <Route path="/tools/write-text-on-image" element={<PageTransition><ProtectedRoute><ImageTextEmbedderPage /></ProtectedRoute></PageTransition>} />
        <Route path="/preferences" element={<PageTransition><ProtectedRoute><PreferencesPage /></ProtectedRoute></PageTransition>} />
        <Route path="/trash" element={<PageTransition><ProtectedRoute><TrashPage /></ProtectedRoute></PageTransition>} />
        <Route path="/history/:id" element={<PageTransition><ProtectedRoute><HistoryPage /></ProtectedRoute></PageTransition>} />
        <Route path="/settings" element={<PageTransition><ProtectedRoute><SettingsPage /></ProtectedRoute></PageTransition>} />
        <Route path="/models" element={<PageTransition><ProtectedRoute><ModelLibraryPage /></ProtectedRoute></PageTransition>} />
        <Route path="/logic-mapper" element={<PageTransition><ProtectedRoute><LogicMapper /></ProtectedRoute></PageTransition>} />
        <Route path="/saved-archive" element={<PageTransition><ProtectedRoute><SavedArchive /></ProtectedRoute></PageTransition>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PremiumProvider>
          <Router>
            <AnimatedRoutes />
            <AdModal />
          </Router>
        </PremiumProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
