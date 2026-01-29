


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import EmployeeMaster from './pages/EmployeeMaster';
import OKRWorkspaceLevel1 from './pages/OKRWorkspaceLevel1';
import OKRWorkspaceLevel2 from './pages/OKRWorkspaceLevel2';
import OKRWorkspaceLevel3 from './pages/OKRWorkspaceLevel3';
import OKRWorkspaceLevel4 from './pages/OKRWorkspaceLevel4';
import OKRWorkspaceLevel5 from './pages/OKRWorkspaceLevel5';
import OKRWorkspaceLevel6 from './pages/OKRWorkspaceLevel6';
import OKRWorkspaceLevel7 from './pages/OKRWorkspaceLevel7';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/employee-master" element={<EmployeeMaster />} />
        <Route path="/okr-workspace-level-1" element={<OKRWorkspaceLevel1 />} />
        <Route path="/okr-workspace-level-2" element={<OKRWorkspaceLevel2 />} />
        <Route path="/okr-workspace-level-3" element={<OKRWorkspaceLevel3 />} />
        <Route path="/okr-workspace-level-4" element={<OKRWorkspaceLevel4 />} />
        <Route path="/okr-workspace-level-5" element={<OKRWorkspaceLevel5 />} />
        <Route path="/okr-workspace-level-6" element={<OKRWorkspaceLevel6 />} />
        <Route path="/okr-workspace-level-7" element={<OKRWorkspaceLevel7 />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
