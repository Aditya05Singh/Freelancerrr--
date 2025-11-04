import { useEffect, useState } from 'react';
import { supabase, Job } from '../lib/supabase';
import { DollarSign, Clock, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface JobListProps {
  onSelectJob: (job: Job) => void;
  isEmployerView?: boolean;
}

export function JobList({ onSelectJob, isEmployerView = false }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadJobs();
  }, [isEmployerView, profile]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select(`
          *,
          employer:profiles!jobs_employer_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (isEmployerView && profile) {
        query = query.eq('employer_id', profile.id);
      } else {
        query = query.eq('status', 'open');
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
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

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {isEmployerView ? 'No jobs posted yet' : 'No jobs available at the moment'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => onSelectJob(job)}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            {isEmployerView && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  job.status
                )}`}
              >
                {job.status.replace('_', ' ')}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.required_skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                <Tag className="w-3 h-3 mr-1" />
                {skill}
              </span>
            ))}
            {job.required_skills.length > 3 && (
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                +{job.required_skills.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center font-semibold text-green-600">
              <DollarSign className="w-4 h-4" />
              <span>{job.budget.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
