import { useState, useEffect } from 'react';
import { Job, Application, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Tag, User, ArrowLeft, Send } from 'lucide-react';

interface JobDetailsProps {
  job: Job;
  onBack: () => void;
  isEmployerView?: boolean;
}

export function JobDetails({ job, onBack, isEmployerView = false }: JobDetailsProps) {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (isEmployerView) {
      loadApplications();
    } else {
      checkIfApplied();
    }
  }, [job.id, isEmployerView]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          freelancer:profiles!applications_freelancer_id_fkey(*)
        `)
        .eq('job_id', job.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const checkIfApplied = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('freelancer_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      setHasApplied(!!data);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('applications').insert([
        {
          job_id: job.id,
          freelancer_id: profile.id,
          cover_letter: coverLetter,
          proposed_rate: parseFloat(proposedRate),
        },
      ]);

      if (error) throw error;

      setShowApplicationForm(false);
      setCoverLetter('');
      setProposedRate('');
      setHasApplied(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    newStatus: 'accepted' | 'rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to jobs
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>

          {job.employer && (
            <div className="flex items-center text-gray-600 mb-4">
              <User className="w-4 h-4 mr-2" />
              <span>Posted by {job.employer.full_name}</span>
            </div>
          )}

          <div className="flex items-center text-2xl font-bold text-green-600 mb-6">
            <DollarSign className="w-6 h-6" />
            <span>{job.budget.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg"
              >
                <Tag className="w-4 h-4 mr-2" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {!isEmployerView && profile?.role === 'freelancer' && (
          <div className="border-t border-gray-200 pt-6">
            {hasApplied ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
                You have already applied to this job
              </div>
            ) : showApplicationForm ? (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Apply for this job</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Letter
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why you're the best fit for this job..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Proposed Rate ($)
                  </label>
                  <input
                    type="number"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your rate"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        )}

        {isEmployerView && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Applications ({applications.length})
            </h2>

            {applications.length === 0 ? (
              <p className="text-gray-500">No applications yet</p>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {application.freelancer?.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {application.freelancer?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${application.proposed_rate.toLocaleString()}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                            application.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : application.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {application.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{application.cover_letter}</p>

                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(application.id, 'accepted')
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(application.id, 'rejected')
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
