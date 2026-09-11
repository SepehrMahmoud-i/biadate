import React, { useState } from 'react';
import { PageId, Invitation } from '../../types';

interface InvitationsListPageProps {
  invitations: Invitation[];
  onNavigate: (page: PageId) => void;
  onSelectInvitation: (inv: Invitation) => void;
  onShowToast: (msg: string) => void;
}

export const InvitationsListPage: React.FC<InvitationsListPageProps> = ({
  invitations,
  onNavigate,
  onSelectInvitation,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filtered = invitations.filter((inv) => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const totalCount = invitations.length;
  const pendingCount = invitations.filter((i) => i.status === 'pending').length;
  const acceptedCount = invitations.filter((i) => i.status === 'accepted').length;
  const rejectedCount = invitations.filter((i) => i.status === 'rejected').length;

  return (
    <section className="space-y-5 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">دعوت‌نامه‌های من</h1>
        <button
          onClick={() => onNavigate('create-invitation')}
          className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
        >
          دعوت‌نامه جدید +
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          همه ({totalCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
            filter === 'pending'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          در انتظار پاسخ ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
            filter === 'accepted'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          پذیرفته شده ({acceptedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
            filter === 'rejected'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          رد شده ({rejectedCount})
        </button>
      </div>

      {/* Invitations List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            موردی در این دسته یافت نشد.
          </div>
        ) : (
          filtered.map((inv) => (
            <div
              key={inv.id}
              className="bg-white p-4 rounded-2xl border border-stone-200/70 shadow-xs flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-stone-900">{inv.recipientName}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-stone-500">{inv.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {inv.status === 'accepted' && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                    پذیرفته شده ❤️
                  </span>
                )}
                {inv.status === 'pending' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                    در انتظار پاسخ
                  </span>
                )}
                {inv.status === 'rejected' && (
                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                    رد شده
                  </span>
                )}

                <button
                  onClick={() => {
                    onSelectInvitation(inv);
                    if (inv.status === 'accepted') {
                      onNavigate('invitation-details');
                    } else {
                      onNavigate('invitation-created');
                    }
                  }}
                  className="px-3 py-1 rounded-lg border border-stone-300 text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  مشاهده
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
