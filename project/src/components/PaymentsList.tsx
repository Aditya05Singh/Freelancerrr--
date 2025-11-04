import { useEffect, useState } from 'react';
import { supabase, Payment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

export function PaymentsList() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [profile]);

  const loadPayments = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      let query = supabase
        .from('payments')
        .select(`
          *,
          job:jobs(*),
          freelancer:profiles!payments_freelancer_id_fkey(*),
          employer:profiles!payments_employer_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (profile.role === 'employer') {
        query = query.eq('employer_id', profile.id);
      } else {
        query = query.eq('freelancer_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
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

  if (payments.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">No payment records found</p>
        </div>
      </div>
    );
  }

  const totalAmount = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payments</h1>
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <p className="text-green-100 text-sm mb-2">
            {profile?.role === 'employer' ? 'Total Spent' : 'Total Earned'}
          </p>
          <div className="flex items-center text-4xl font-bold">
            <DollarSign className="w-8 h-8" />
            <span>{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {payment.job?.title}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {profile?.role === 'employer' ? (
                    <p>Paid to: {payment.freelancer?.full_name}</p>
                  ) : (
                    <p>Received from: {payment.employer?.full_name}</p>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center text-2xl font-bold text-green-600 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span>{Number(payment.amount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-end">
                  {getStatusIcon(payment.status)}
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
