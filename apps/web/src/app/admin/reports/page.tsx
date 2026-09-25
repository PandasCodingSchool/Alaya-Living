'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Profile } from '@/lib/types';

type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
type ReportTargetKind = 'USER' | 'ROOM' | 'PG' | 'FLAT';

interface AdminReport {
  id: string;
  targetKind: ReportTargetKind;
  targetId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  reporter: Profile;
}

function ReportsInner() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>(
    (searchParams.get('status') as ReportStatus) || 'PENDING',
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api<AdminReport[]>(`/admin/reports${params}`)
      .then(setReports)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load reports'));
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function runAction(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    try {
      await action();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Reports</h2>
          <p className="mt-1 text-sm text-muted">Moderation queue</p>
        </div>
        <select
          className="field py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-orange-700">{error}</p>}

      <div className="mt-6 space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {report.targetKind} · {report.status}
                </p>
                <p className="mt-1 font-medium">{report.reason}</p>
                {report.details && <p className="mt-2 text-sm text-muted">{report.details}</p>}
                <p className="mt-2 text-xs text-muted">
                  Reported by {report.reporter.name} · {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {report.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={busy === `${report.id}-review`}
                    className="btn-ghost text-xs"
                    onClick={() =>
                      runAction(`${report.id}-review`, () =>
                        api(`/admin/reports/${report.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ status: 'REVIEWING' }),
                        }),
                      )
                    }
                  >
                    Mark reviewing
                  </button>
                )}
                {report.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    disabled={busy === `${report.id}-resolve`}
                    className="btn-ghost text-xs"
                    onClick={() =>
                      runAction(`${report.id}-resolve`, () =>
                        api(`/admin/reports/${report.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ status: 'RESOLVED' }),
                        }),
                      )
                    }
                  >
                    Resolve
                  </button>
                )}
                {report.status !== 'DISMISSED' && (
                  <button
                    type="button"
                    disabled={busy === `${report.id}-dismiss`}
                    className="btn-ghost text-xs"
                    onClick={() =>
                      runAction(`${report.id}-dismiss`, () =>
                        api(`/admin/reports/${report.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ status: 'DISMISSED' }),
                        }),
                      )
                    }
                  >
                    Dismiss
                  </button>
                )}
                {report.targetKind === 'USER' && (
                  <button
                    type="button"
                    disabled={busy === `${report.id}-suspend`}
                    className="btn-dark text-xs"
                    onClick={() =>
                      runAction(`${report.id}-suspend`, () =>
                        api(`/admin/users/${report.targetId}/suspend`, { method: 'POST' }),
                      )
                    }
                  >
                    Suspend user
                  </button>
                )}
                {report.targetKind !== 'USER' && (
                  <button
                    type="button"
                    disabled={busy === `${report.id}-close`}
                    className="btn-dark text-xs"
                    onClick={() =>
                      runAction(`${report.id}-close`, () =>
                        api('/admin/listings/close', {
                          method: 'POST',
                          body: JSON.stringify({ kind: report.targetKind, targetId: report.targetId }),
                        }),
                      )
                    }
                  >
                    Close listing
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!reports.length && (
          <p className="py-10 text-center text-muted">
            {statusFilter ? `No ${statusFilter.toLowerCase()} reports.` : 'No reports yet.'}
          </p>
        )}
      </div>
    </>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading reports…</p>}>
      <ReportsInner />
    </Suspense>
  );
}
