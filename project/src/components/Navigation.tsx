import { Briefcase, LogOut, User, PlusCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 text-xl font-bold text-gray-900"
            >
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span>FreelanceHub</span>
            </button>

            <div className="hidden md:flex space-x-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => onNavigate('jobs')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'jobs'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {profile?.role === 'employer' ? 'My Jobs' : 'Find Jobs'}
              </button>

              {profile?.role === 'freelancer' && (
                <button
                  onClick={() => onNavigate('applications')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 'applications'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  My Applications
                </button>
              )}

              <button
                onClick={() => onNavigate('payments')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'payments'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Payments
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {profile?.role === 'employer' && (
              <button
                onClick={() => onNavigate('create-job')}
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Job</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('profile')}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 'profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center p-2 ${
              currentPage === 'dashboard' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('jobs')}
            className={`flex flex-col items-center p-2 ${
              currentPage === 'jobs' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs mt-1">Jobs</span>
          </button>

          {profile?.role === 'employer' && (
            <button
              onClick={() => onNavigate('create-job')}
              className={`flex flex-col items-center p-2 ${
                currentPage === 'create-job' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-xs mt-1">Post</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center p-2 ${
              currentPage === 'profile' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
