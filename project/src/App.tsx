import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForms } from './components/AuthForms';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { JobList } from './components/JobList';
import { JobDetails } from './components/JobDetails';
import { CreateJob } from './components/CreateJob';
import { ApplicationsList } from './components/ApplicationsList';
import { PaymentsList } from './components/PaymentsList';
import { Profile } from './components/Profile';
import { Job } from './lib/supabase';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthForms />;
  }

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
  };

  const handleJobCreated = () => {
    setCurrentPage('jobs');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && <Dashboard />}

        {currentPage === 'jobs' && !selectedJob && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {profile.role === 'employer' ? 'My Jobs' : 'Find Jobs'}
            </h1>
            <JobList
              onSelectJob={handleJobSelect}
              isEmployerView={profile.role === 'employer'}
            />
          </div>
        )}

        {currentPage === 'jobs' && selectedJob && (
          <JobDetails
            job={selectedJob}
            onBack={handleBackToJobs}
            isEmployerView={profile.role === 'employer'}
          />
        )}

        {currentPage === 'create-job' && profile.role === 'employer' && (
          <CreateJob onSuccess={handleJobCreated} />
        )}

        {currentPage === 'applications' && profile.role === 'freelancer' && (
          <ApplicationsList />
        )}

        {currentPage === 'payments' && <PaymentsList />}

        {currentPage === 'profile' && <Profile />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
