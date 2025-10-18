import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import LandingPage from './pages/LandingPage';
import WalletNotConnected from './pages/WalletNotConnected';
import Profile from './pages/Profile';
import Header from './components/Header';
import PublisherYourTasks from './pages/publisher/YourTasks';
import PublisherTaskDetail from './pages/publisher/TaskDetail';
import PublisherAddTask from './pages/publisher/AddTask';
import FreelancerBrowseTasks from './pages/freelancer/BrowseTasks';
import FreelancerTaskDescription from './pages/freelancer/TaskDescription';
import FreelancerYourTasks from './pages/freelancer/YourTasks';
import FreelancerTaskSubmission from './pages/freelancer/TaskSubmission';
import './App.css';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletAddress } = useWallet();
  
  if (!walletAddress) {
    return <WalletNotConnected />;
  }
  
  return <>{children}</>;
};

function App() {
  const [userRole, setUserRole] = useState<'publisher' | 'freelancer'>('publisher');

  const selectRole = (role: 'publisher' | 'freelancer') => {
    setUserRole(role);
  };

  return (
    <WalletProvider>
      <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard redirect by role */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate
                to={userRole === 'publisher' ? '/publisher/tasks' : '/freelancer/browse'}
                replace
              />
            </ProtectedRoute>
          }
        />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Header userRole={userRole} onSelectRole={selectRole} />
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Publisher Routes */}
        <Route
          path="/publisher/*"
          element={
            <ProtectedRoute>
              <Header userRole={userRole} onSelectRole={selectRole} />
              <Routes>
                <Route path="tasks" element={<PublisherYourTasks />} />
                <Route path="task/:id" element={<PublisherTaskDetail />} />
                <Route path="add-task" element={<PublisherAddTask />} />
                <Route path="*" element={<Navigate to="/publisher/tasks" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Freelancer Routes */}
        <Route
          path="/freelancer/*"
          element={
            <ProtectedRoute>
              <Header userRole={userRole} onSelectRole={selectRole} />
              <Routes>
                <Route path="browse" element={<FreelancerBrowseTasks />} />
                <Route path="task/:id" element={<FreelancerTaskDescription />} />
                <Route path="your-tasks" element={<FreelancerYourTasks />} />
                <Route path="submit/:id" element={<FreelancerTaskSubmission />} />
                <Route path="*" element={<Navigate to="/freelancer/browse" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Default redirect - show wallet not connected */}
        <Route
          path="*"
          element={<WalletNotConnected />}
        />
      </Routes>
    </Router>
    </WalletProvider>
  );
}

export default App;
