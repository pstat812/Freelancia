import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
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

function App() {
  const [userRole, setUserRole] = useState<'publisher' | 'freelancer'>('publisher');

  const toggleRole = () => {
    setUserRole(prev => prev === 'publisher' ? 'freelancer' : 'publisher');
  };

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={
            <>
              <Header userRole={userRole} onToggleRole={toggleRole} />
              <Profile />
            </>
          }
        />

        {/* Publisher Routes */}
        <Route
          path="/publisher/*"
          element={
            <>
              <Header userRole={userRole} onToggleRole={toggleRole} />
              <Routes>
                <Route path="tasks" element={<PublisherYourTasks />} />
                <Route path="task/:id" element={<PublisherTaskDetail />} />
                <Route path="add-task" element={<PublisherAddTask />} />
                <Route path="*" element={<Navigate to="/publisher/tasks" replace />} />
              </Routes>
            </>
          }
        />

        {/* Freelancer Routes */}
        <Route
          path="/freelancer/*"
          element={
            <>
              <Header userRole={userRole} onToggleRole={toggleRole} />
              <Routes>
                <Route path="browse" element={<FreelancerBrowseTasks />} />
                <Route path="task/:id" element={<FreelancerTaskDescription />} />
                <Route path="your-tasks" element={<FreelancerYourTasks />} />
                <Route path="submit/:id" element={<FreelancerTaskSubmission />} />
                <Route path="*" element={<Navigate to="/freelancer/browse" replace />} />
              </Routes>
            </>
          }
        />

        {/* Default redirect based on user role */}
        <Route
          path="*"
          element={
            <Navigate
              to={userRole === 'publisher' ? '/publisher/tasks' : '/freelancer/browse'}
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
