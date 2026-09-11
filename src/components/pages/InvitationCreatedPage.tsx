import React, { useState } from 'react';
import { PageId, Invitation } from '../../types';
import { Check, Copy, Share2, Eye } from 'lucide-react';

interface InvitationCreatedPageProps {
  invitation: Invitation | null;
  onNavigate: (page: PageId) => void;
  onShowToast: (msg: string) => void;
  onOpenLivePreview?: () => void;
}

export const InvitationCreatedPage: React.FC<InvitationCreatedPageProps> = ({
  invitation,
  onNavigate,
  onShowToast,
  onOpenLivePreview,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const token = invitation?.token || 'tok_' + (invitation?.id || 'demo');
  const inviteUrl = `${window.location.origin}/invite?token=${token}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    onShowToast('لینک دعوت در کلیپ‌بورد کپی شد ✨');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(token);
    setCopiedToken(true);
    onShowToast('توکن دعوت کپی شد ✨');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'یک دعوت‌نامه برای تو ❤️',
        text: `${invitation?.recipientName || 'عزیز'}، یک دعوت‌نامه اختصاصی داری!`,
        url: inviteUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <section className="space-y-6 py-6 text-center">
      <div className="space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-sm animate-bounce">
          🎉
        </div>
        <h1 className="text-2xl font-black text-stone-900">دعوت‌نامه‌ات آماده‌ست!</h1>
        <p className="text-xs text-stone-600">حالا فقط کافیه لینکش رو براش بفرستی.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4 text-right">
        <label className="block text-xs font-semibold text-stone-800">لینک اختصاصی دعوت:</label>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#faf8f5] border border-stone-200">
          <input
            readOnly
            value={inviteUrl}
            className="w-full bg-transparent text-xs text-stone-800 font-mono focus:outline-none px-2 dir-ltr text-left"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold shrink-0 hover:bg-rose-600 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد' : 'کپی کردن لینک'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleShare}
            className="py-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 hover:bg-rose-100 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>اشتراک‌گذاری 📤</span>
          </button>
          <button
            onClick={() => {
              if (onOpenLivePreview) {
                onOpenLivePreview();
              } else {
                onNavigate('public-invitation');
              }
            }}
            className="py-3 rounded-xl bg-white text-stone-900 font-bold text-xs border border-stone-300 hover:bg-stone-100 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>پیش‌نمایش دعوت‌نامه 👁️</span>
          </button>
        </div>
      </div>

      <div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs text-stone-600 hover:text-rose-500 cursor-pointer transition-colors"
        >
          بازگشت به داشبورد
        </button>
      </div>
    </section>
  );
};
