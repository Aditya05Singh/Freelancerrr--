import { useEffect, useState } from 'react';
import { supabase, Application } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Calendar } from 'lucide-react';

export function ApplicationsList() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [profile]);

  const loadApplications = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(
            *,
            employer:profiles!jobs_employer_id_fkey(*)
          )
        `)
        .eq('freelancer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You haven't applied to any jobs yet</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Applications</h1>

      <div className="space-y-4">
        {applications.map((application) => (
          <div
            key={application.id}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {application.job?.title}
                </h3>
                {application.job?.employer && (
                  <p className="text-sm text-gray-600">
                    Posted by {application.job.employer.full_name}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">
              {application.cover_letter}
            </p>

            <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span>
                  Applied {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center font-semibold text-green-600">
                <DollarSign className="w-4 h-4" />
                <span>{application.proposed_rate.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
