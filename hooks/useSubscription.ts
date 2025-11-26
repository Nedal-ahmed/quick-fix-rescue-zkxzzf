
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id: string;
  price_amount: number;
  price_currency: string;
  interval: 'month' | 'year';
  features: string[];
  active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch available plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price_amount', { ascending: true });

      if (plansError) {
        console.error('Error fetching plans:', plansError);
        throw plansError;
      }

      setPlans(plansData || []);

      // Fetch user's subscription if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (subError && subError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subError);
        } else {
          setSubscription(subData);
        }
      }
    } catch (err: any) {
      console.error('Error in fetchSubscriptionData:', err);
      setError(err.message || 'Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planId: string, email?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to subscribe');
      }

      const response = await fetch(
        `https://yfvlxsqjvsbzbqsczuqt.supabase.co/functions/v1/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ planId, email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      console.log('Subscription created:', data);
      return data;
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Failed to create subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (cancelImmediately: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to cancel subscription');
      }

      const response = await fetch(
        `https://yfvlxsqjvsbzbqsczuqt.supabase.co/functions/v1/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ cancelImmediately }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      console.log('Subscription canceled:', data);
      await fetchSubscriptionData();
      return data;
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isPremium = () => {
    return subscription?.status === 'active' || subscription?.status === 'trialing';
  };

  const refreshSubscription = () => {
    return fetchSubscriptionData();
  };

  return {
    subscription,
    plans,
    loading,
    error,
    isPremium: isPremium(),
    createSubscription,
    cancelSubscription,
    refreshSubscription,
  };
}
