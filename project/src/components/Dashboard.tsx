import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Briefcase, FileText, DollarSign, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      if (profile.role === 'employer') {
        const [jobsResult, applicationsResult, paymentsResult] = await Promise.all([
          supabase.from('jobs').select('id', { count: 'exact' }).eq('employer_id', profile.id),
          supabase
            .from('applications')
            .select('id', { count: 'exact' })
            .in(
              'job_id',
              (
                await supabase.from('jobs').select('id').eq('employer_id', profile.id)
              ).data?.map((j) => j.id) || []
            ),
          supabase
            .from('payments')
            .select('amount')
            .eq('employer_id', profile.id)
            .eq('status', 'completed'),
        ]);

        const totalPayments =
          paymentsResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        setStats({
          totalJobs: jobsResult.count || 0,
          totalApplications: applicationsResult.count || 0,
          acceptedApplications: 0,
          totalPayments,
        });
      } else {
        const [applicationsResult, acceptedResult, paymentsResult] = await Promise.all([
          supabase
            .from('applications')
            .select('id', { count: 'exact' })
            .eq('freelancer_id', profile.id),
          supabase
            .from('applications')
            .select('id', { count: 'exact' })
            .eq('freelancer_id', profile.id)
            .eq('status', 'accepted'),
          supabase
            .from('payments')
            .select('amount')
            .eq('freelancer_id', profile.id)
            .eq('status', 'completed'),
        ]);

        const totalPayments =
          paymentsResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        setStats({
          totalJobs: 0,
          totalApplications: applicationsResult.count || 0,
          acceptedApplications: acceptedResult.count || 0,
          totalPayments,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards =
    profile?.role === 'employer'
      ? [
          {
            title: 'Total Jobs Posted',
            value: stats.totalJobs,
            icon: Briefcase,
            color: 'bg-blue-500',
          },
          {
            title: 'Total Applications',
            value: stats.totalApplications,
            icon: FileText,
            color: 'bg-green-500',
          },
          {
            title: 'Total Spent',
            value: `$${stats.totalPayments.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-orange-500',
          },
        ]
      : [
          {
            title: 'Applications Sent',
            value: stats.totalApplications,
            icon: FileText,
            color: 'bg-blue-500',
          },
          {
            title: 'Accepted',
            value: stats.acceptedApplications,
            icon: TrendingUp,
            color: 'bg-green-500',
          },
          {
            title: 'Total Earned',
            value: `$${stats.totalPayments.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-orange-500',
          },
        ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600">
          {profile?.role === 'employer'
            ? 'Manage your job postings and applications'
            : 'Find your next freelance opportunity'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-3">
          {profile?.role === 'employer' ? 'Ready to hire?' : 'Ready to work?'}
        </h2>
        <p className="text-blue-100 mb-6">
          {profile?.role === 'employer'
            ? 'Post a job and connect with talented freelancers ready to bring your project to life.'
            : 'Browse available jobs and find the perfect project that matches your skills.'}
        </p>
      </div>
    </div>
  );
}
