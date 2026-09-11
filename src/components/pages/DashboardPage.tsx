import React from 'react';
import { PageId, Invitation } from '../../types';
import { ChevronLeft } from 'lucide-react';

interface DashboardPageProps {
  userName: string;
  invitations: Invitation[];
  onNavigate: (page: PageId) => void;
  onSelectInvitation: (inv: Invitation) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  userName,
  invitations,
  onNavigate,
  onSelectInvitation,
}) => {
  const totalCount = invitations.length;
  const acceptedCount = invitations.filter((i) => i.status === 'accepted').length;
  const pendingCount = invitations.filter((i) => i.status === 'pending').length;

  return (
    <section className="space-y-6 py-4">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-stone-900">سلام، {userName || 'کاربر عزیز'} 👋</h1>
          <p className="text-xs text-stone-600 mt-0.5">آماده‌ای یک قرار خوب بسازیم؟</p>
        </div>
        <button
          onClick={() => onNavigate('create-invitation')}
          className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
        >
          <span>ساخت دعوت‌نامه جدید</span>
          <span>❤️</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/70 text-center space-y-1 shadow-xs">
          <span className="text-[11px] text-stone-500">کل دعوت‌ها</span>
          <div className="text-xl font-black text-stone-900">{totalCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-rose-100 text-center space-y-1 shadow-xs">
          <span className="text-[11px] text-rose-600 font-medium">پذیرفته‌شده</span>
          <div className="text-xl font-black text-rose-600">{acceptedCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-amber-100 text-center space-y-1 shadow-xs">
          <span className="text-[11px] text-amber-700 font-medium">در انتظار</span>
          <div className="text-xl font-black text-amber-600">{pendingCount}</div>
        </div>
      </div>

      {/* Invitations Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900">آخرین دعوت‌نامه‌ها</h2>
          {invitations.length > 0 && (
            <button
              onClick={() => onNavigate('invitations-list')}
              className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
            >
              مشاهده همه
            </button>
          )}
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center space-y-3 border border-stone-200/80 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl">
              💌
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-stone-900">هنوز هیچ دعوت‌نامه‌ای نساخته‌اید</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                اولین دعوت‌نامه عاشقانه خود را بسازید و لینک اختصاصی آن را برای فرد مورد علاقه‌تان ارسال کنید.
              </p>
            </div>
            <button
              onClick={() => onNavigate('create-invitation')}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
            >
              ساخت اولین دعوت‌نامه ❤️
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {invitations.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                onClick={() => {
                  onSelectInvitation(inv);
                  if (inv.status === 'accepted') {
                    onNavigate('invitation-details');
                  } else {
                    onNavigate('invitation-created');
                  }
                }}
                className="bg-white p-4 rounded-2xl border border-stone-200/70 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center ${
                      inv.status === 'accepted'
                        ? 'bg-rose-50 text-rose-500'
                        : inv.status === 'pending'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {inv.recipientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-rose-600 transition-colors">
                      {inv.recipientName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                      <span>{inv.createdAt}</span>
                      <span>•</span>
                      {inv.status === 'accepted' ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-md">
                          پذیرفته شده ❤️
                        </span>
                      ) : inv.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                          در انتظار پاسخ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-stone-600 font-medium bg-stone-100 px-2 py-0.5 rounded-md">
                          رد شده 😐
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:translate-x-[-2px] transition-transform" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
