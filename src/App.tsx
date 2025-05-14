import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';
import { AuthGuard } from './components/AuthGuard';
import { ConfigurationViewPage } from './pages/ConfigurationViewPage';
import { DamageScenarioPage } from './pages/configpages/DamageScenarioPage';

function App() {
  return (
    <Router>
      <AuthGuard>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/project/:projectId?" element={<ProjectPage />} />
          <Route path="/configuration/:id" element={<ConfigurationViewPage />} />
          <Route path="/configuration/:configId/damage-scenarios" element={<DamageScenarioPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthGuard>
    </Router>
  );
}

export default App;
