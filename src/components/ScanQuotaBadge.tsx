import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Sparkles, AlertCircle } from 'lucide-react';

interface ScanQuotaBadgeProps {
  userId: string;
}

export function ScanQuotaBadge({ userId }: ScanQuotaBadgeProps) {
  const [scansUsed, setScansUsed] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuota() {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('plan, ai_scans_used')
          .eq('id', userId)
          .single();

        if (data && !error) {
          setPlan(data.plan || 'free');
          setScansUsed(data.ai_scans_used ?? 0);
        }
      } catch (err) {
        console.error('Error fetching scan quota:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuota();
  }, [userId]);

  if (loading) {
    return <span className="text-xs text-slate-400">Loading quota...</span>;
  }

  const isFree = plan === 'free';
  const limit = 10;
  const remaining = isFree ? Math.max(0, limit - (scansUsed ?? 0)) : 'Unlimited';

  return (
    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
      <span className="text-xs font-semibold text-slate-700">
        {isFree ? (
          <>
            Free AI Scans: <strong className={remaining === 0 ? 'text-rose-600' : 'text-slate-900'}>{scansUsed} / {limit}</strong> used
          </>
        ) : (
          <>
            Plan: <strong className="text-emerald-600 uppercase">{plan}</strong> (Unlimited AI Scans)
          </>
        )}
      </span>
      {isFree && scansUsed !== null && scansUsed >= limit && (
        <span className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
          <AlertCircle className="w-3 h-3" /> Limit Reached
        </span>
      )}
    </div>
  );
}