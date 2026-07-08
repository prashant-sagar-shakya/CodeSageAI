'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Shield, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { createOrder, verifyPayment } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleUpgrade = async (planKey: string) => {
    if (!user) {
      setError('You must be logged in to upgrade.');
      return;
    }
    if (user.subscription_tier === planKey) {
      setError('You are already on this plan.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoadingPlan(planKey);

    try {
      // 1. Create Order on Backend
      const order = await createOrder(user.id, planKey);

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "CodeSageAI",
        description: `Upgrade to ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan`,
        order_id: order.order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const res = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
              plan: planKey
            });
            
            // 4. Update local user state
            const updatedUser = { ...user, subscription_tier: res.new_tier };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setSuccess(`Successfully upgraded to ${planKey} plan!`);
            
            // Trigger layout event
            window.dispatchEvent(new Event('userUpdated'));
          } catch (err: any) {
            setError(err.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: user.name || user.username,
          email: user.email || '',
        },
        theme: {
          color: "#6366f1"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed.');
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Could not initiate checkout process.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      key: 'free',
      name: 'Free',
      price: '₹0',
      icon: Shield,
      color: '#9ca3af',
      features: ['Up to 2 Repositories', '5 AI Code Reviews / month', 'Basic Security Scans', 'Standard Support'],
    },
    {
      key: 'basic',
      name: 'Basic',
      price: '₹499',
      period: '/month',
      icon: Zap,
      color: '#3b82f6',
      popular: true,
      features: ['Up to 10 Repositories', '50 AI Code Reviews / month', 'Deep Dependency Scans', 'Priority Email Support', 'Custom Ignore Rules'],
    },
    {
      key: 'pro',
      name: 'Pro',
      price: '₹1499',
      period: '/month',
      icon: Sparkles,
      color: '#8b5cf6',
      features: ['Unlimited Repositories', 'Unlimited AI Reviews', 'Zero-Day Vulnerability Alerts', 'Dedicated 24/7 Support', 'Custom Webhooks', 'Team Analytics Dashboard'],
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Upgrade Your Code Intelligence
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Choose the perfect plan to scale your multi-agent automated code reviews. Unlock deeper insights and unlimited tracking.
        </p>
      </div>

      {error && (
        <div style={{ maxWidth: '600px', margin: '0 auto 32px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div style={{ maxWidth: '600px', margin: '0 auto 32px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={20} /> {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center' }}>
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          const isCurrentPlan = user?.subscription_tier === plan.key || (!user?.subscription_tier && plan.key === 'free');
          
          return (
            <div key={plan.key} className="glass-card animate-fade-up" style={{
              position: 'relative',
              padding: '40px 32px',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border-primary)',
              transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
              zIndex: plan.popular ? 10 : 1,
              animationDelay: `${i * 0.1}s`
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: `linear-gradient(135deg, ${plan.color}, #6366f1)`, color: 'white',
                  padding: '4px 16px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 800,
                  letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                }}>
                  Most Popular
                </div>
              )}

              <Icon size={40} style={{ color: plan.color, marginBottom: '24px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900 }}>{plan.price}</span>
                {plan.period && <span style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>{plan.period}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {plan.features.map((feature, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <CheckCircle2 size={18} style={{ color: plan.color, flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={isCurrentPlan || loadingPlan === plan.key || plan.key === 'free'}
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: 'var(--radius-md)',
                  background: isCurrentPlan ? 'var(--bg-tertiary)' : plan.popular ? plan.color : 'transparent',
                  color: isCurrentPlan ? 'var(--text-tertiary)' : plan.popular ? 'white' : plan.color,
                  border: `2px solid ${isCurrentPlan ? 'transparent' : plan.color}`,
                  fontWeight: 800, fontSize: '14px', cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (!isCurrentPlan && !plan.popular && plan.key !== 'free') {
                    e.currentTarget.style.background = `${plan.color}15`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isCurrentPlan && !plan.popular && plan.key !== 'free') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {isCurrentPlan ? 'Current Plan' : loadingPlan === plan.key ? 'Processing...' : plan.key === 'free' ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
