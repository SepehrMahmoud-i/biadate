import React, { useState } from 'react';
import { PageId, Invitation } from '../../types';
import { ArrowRight, Sparkles, Copy, Check, Trash2, Link as LinkIcon, AlertTriangle } from 'lucide-react';

interface InvitationDetailsPageProps {
  invitation: Invitation | null;
  onNavigate: (page: PageId) => void;
  onShowToast: (msg: string) => void;
  onDeleteInvitation?: (invitationId: string | number, token: string) => Promise<void>;
  onOpenLivePreview?: () => void;
}

export const InvitationDetailsPage: React.FC<InvitationDetailsPageProps> = ({
  invitation,
  onNavigate,
  onShowToast,
  onDeleteInvitation,
  onOpenLivePreview,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inv = invitation || {
    id: 'default',
    token: 'default-tok',
    slug: 'sara-77x',
    recipientName: 'سارا',
    message: 'یه سوال مهم ازت دارم... حاضری با من یه قرار بریم؟ ❤️',
    status: 'accepted' as const,
    createdAt: '۱۴۰۵/۰۶/۱۸',
    acceptedAt: '۱۴۰۵/۰۶/۱۸ - ۲۱:۴۵',
    preferences: {
      activities: ['☕ کافه', '🎬 سینما'],
      days: ['پنجشنبه', 'جمعه'],
      timeSlot: 'غروب و شب (۱۸:۰۰ تا ۲۲:۰۰)',
      notes: 'جای دنج دوست دارم.',
    },
  };

  const prefs = inv.preferences || {
    activities: ['☕ کافه', '🎬 سینما'],
    days: ['پنجشنبه', 'جمعه'],
    timeSlot: 'غروب و شب (۱۸:۰۰ تا ۲۲:۰۰)',
    notes: 'جای دنج دوست دارم.',
  };

  const inviteToken = inv.token || inv.slug || String(inv.id);
  const inviteUrl = `${window.location.origin}/?token=${inviteToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    onShowToast('لینک دعوت در حافظه کپی شد');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDelete = async () => {
    if (!onDeleteInvitation) {
      onShowToast('امکان حذف برای این آیتم وجود ندارد.');
      return;
    }
    setIsDeleting(true);
    try {
      await onDeleteInvitation(inv.id, inv.token);
      onShowToast('دعوت‌نامه با موفقیت حذف گردید.');
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Error deleting invitation:', err);
      onShowToast(err.message || 'خطا در حذف دعوت‌نامه');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <section className="space-y-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs text-stone-500 hover:text-rose-500 mb-1 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به داشبورد</span>
          </button>
          <h1 className="text-xl font-black text-stone-900">
            دعوت‌نامه برای {inv.recipientName} ❤️
          </h1>
        </div>

        {inv.status === 'accepted' && (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200">
            پذیرفته شده
          </span>
        )}
        {inv.status === 'pending' && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
            در انتظار پاسخ
          </span>
        )}
        {inv.status === 'rejected' && (
          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 font-bold text-xs border border-stone-200">
            رد شده
          </span>
        )}
      </div>

      {/* Invitation Info & Share Link */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-xs font-bold text-stone-600">اطلاعات دعوت</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onOpenLivePreview) onOpenLivePreview();
                else onNavigate('public-invitation');
              }}
              className="text-xs text-stone-700 hover:text-stone-900 font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <span>پیش‌نمایش 👁️</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'کپی شد!' : 'کپی کردن لینک'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-stone-500 block">نام گیرنده:</span>
            <span className="font-bold text-stone-900 text-sm mt-0.5 block">{inv.recipientName}</span>
          </div>
          <div>
            <span className="text-stone-500 block">تاریخ ساخت:</span>
            <span className="font-semibold text-stone-900 mt-0.5 block">{inv.createdAt}</span>
          </div>
          <div>
            <span className="text-stone-500 block">وضعیت فعلی:</span>
            <span className="font-semibold text-stone-900 mt-0.5 block">
              {inv.status === 'accepted' ? `پذیرفته شده (${inv.acceptedAt || 'ثبت‌شده'})` : inv.status === 'pending' ? 'هنوز باز یا پاسخ داده نشده' : 'پاسخ منفی ثبت شده'}
            </span>
          </div>
          <div>
            <span className="text-stone-500 block">لینک اختصاصی دعوت:</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-stone-600 text-[11px] dir-ltr truncate bg-stone-50 px-2 py-1 rounded-lg border border-stone-200 flex-1">
                {inviteUrl}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Date Choices (If accepted) */}
      {inv.status === 'accepted' && (
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>ترجیحات قرار</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-stone-500 block mb-1.5">مکان‌های مورد علاقه:</span>
              <div className="flex flex-wrap gap-2">
                {prefs.activities.map((act) => (
                  <span
                    key={act}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-stone-500 block mb-1.5">روزهای مناسب:</span>
              <div className="flex flex-wrap gap-2">
                {prefs.days.map((day) => (
                  <span
                    key={day}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-semibold"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-stone-500 block mb-1">ساعت ترجیحی:</span>
              <span className="font-semibold text-stone-900">{prefs.timeSlot}</span>
            </div>

            <div>
              <span className="text-stone-500 block mb-1">یادداشت {inv.recipientName}:</span>
              <p className="p-3 bg-[#faf8f5] rounded-xl border border-stone-200 text-stone-800 leading-relaxed font-medium">
                «{prefs.notes || 'جای دنج دوست دارم.'}»
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Invitation Section */}
      <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-stone-900">مدیریت این دعوت‌نامه</h4>
            <p className="text-[11px] text-stone-500">
              در صورت حذف، این دعوت از پایگاه داده پاک شده و لینک آن خطای صفحه پیدا نشد (404) می‌دهد.
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف دعوت</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>آیا از حذف این دعوت اطمینان دارید؟</span>
            </div>
            <p className="text-[11px] text-red-600 leading-relaxed">
              این عملیات غیرقابل بازگشت است و دیگر کسی امکان مشاهده یا ثبت پاسخ روی لینک آن را نخواهد داشت.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
              <button
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
