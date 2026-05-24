import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import HomePage          from './pages/Home/HomePage';
import LoginPage         from './pages/Auth/LoginPage';
import RegisterPage      from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import PricingPage       from './pages/Public/PricingPage';
import AboutPage         from './pages/Public/AboutPage';
import ContactPage       from './pages/Public/ContactPage';
import LegalPages        from './pages/Public/LegalPages';

// Dashboard pages
import DashboardPage  from './pages/Dashboard/DashboardPage';
import GeneratorPage  from './pages/Generator/GeneratorPage';
import AnalyticsPage  from './pages/Analytics/AnalyticsPage';
import PublishPage    from './pages/Publish/PublishPage';
import TemplatesPage  from './pages/Templates/TemplatesPage';
import SettingsPage   from './pages/Settings/SettingsPage';

// My Videos
import MyVideosPage   from './pages/MyVideos/MyVideosPage';

// Generator Suite
import ScriptWriterPage       from './pages/ScriptWriter/ScriptWriterPage';
import VoiceoverPage          from './pages/Voiceover/VoiceoverPage';
import SubtitlesPage          from './pages/Subtitles/SubtitlesPage';
import SEOGeneratorPage       from './pages/SEOGenerator/SEOGeneratorPage';
import CopyrightCheckerPage   from './pages/CopyrightChecker/CopyrightCheckerPage';
import ThumbnailGeneratorPage from './pages/ThumbnailGenerator/ThumbnailGeneratorPage';

// Help
import HelpPage from './pages/Help/HelpPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* ── Public ── */}
        <Route path="/"                element={<HomePage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/pricing"         element={<PricingPage />} />
        <Route path="/about"           element={<AboutPage />} />
        <Route path="/contact"         element={<ContactPage />} />
        <Route path="/terms"           element={<LegalPages page="terms" />} />
        <Route path="/privacy"         element={<LegalPages page="privacy" />} />
        <Route path="/dmca"            element={<LegalPages page="dmca" />} />
        <Route path="/cookies"         element={<LegalPages page="cookies" />} />

        {/* ── Dashboard (sidebar layout) ── */}
        <Route element={<DashboardLayout />}>
          {/* Core */}
          <Route path="/dashboard"        element={<DashboardPage />} />
          <Route path="/dashboard/videos" element={<MyVideosPage />} />

          {/* Generator suite */}
          <Route path="/generator"              element={<GeneratorPage />} />
          <Route path="/generator/script"       element={<ScriptWriterPage />} />
          <Route path="/generator/voice"        element={<VoiceoverPage />} />
          <Route path="/generator/subtitles"    element={<SubtitlesPage />} />
          <Route path="/generator/seo"          element={<SEOGeneratorPage />} />
          <Route path="/generator/copyright"    element={<CopyrightCheckerPage />} />
          <Route path="/generator/thumbnail"    element={<ThumbnailGeneratorPage />} />

          {/* Tools */}
          <Route path="/templates"  element={<TemplatesPage />} />
          <Route path="/analytics"  element={<AnalyticsPage />} />
          <Route path="/publish"    element={<PublishPage />} />

          {/* Settings */}
          <Route path="/settings"          element={<SettingsPage />} />
          <Route path="/settings/accounts" element={<SettingsPage />} />
          <Route path="/settings/billing"  element={<SettingsPage />} />

          {/* Help */}
          <Route path="/help" element={<HelpPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
