import React, { useState } from 'react';
import { PageId, Invitation } from '../../types';

interface PublicInvitationPageProps {
  invitation: Invitation | null;
  onNavigate: (page: PageId) => void;
  onAccept: () => void;
  onReject: () => void;
  onShowToast: (msg: string) => void;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export const PublicInvitationPage: React.FC<PublicInvitationPageProps> = ({
  invitation,
  onNavigate,
  onAccept,
  onReject,
  onShowToast,
  isPreview,
  onExitPreview,
}) => {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [dodgeOffset, setDodgeOffset] = useState({ x: 0, y: 0 });
  const [dodgeHint, setDodgeHint] = useState('');

  const name = invitation?.recipientName || 'سارا';
  const message = invitation?.message || 'حاضری با من یه قرار بریم؟ ❤️';

  const handleDodge = () => {
    if (dodgeCount < 7) {
      // Increase movement range significantly
      const randomX = (Math.random() - 0.5) * 350;
      const randomY = (Math.random() - 0.5) * 200;
      setDodgeOffset({ x: randomX, y: randomY });
      const newCount = dodgeCount + 1;
      setDodgeCount(newCount);

      if (newCount === 1) {
        setDodgeHint('مطمئنی؟ یه کم دیگه فکر کن! 😉');
      } else if (newCount === 3) {
        setDodgeHint('دکمه «نه» راضی نیست! 😅');
      } else if (newCount === 5) {
        setDodgeHint('واقعاً می‌خوای نه بگی؟ 🥺');
      } else if (newCount === 7) {
        setDodgeOffset({ x: 0, y: 0 });
        setDodgeHint('خیلی خب، اگر واقعاً دوست داری می‌تونی انتخابش کنی 🤍');
      }
    }
  };

  const handleNoClick = () => {
    if (invitation?.isCreator) {
      onShowToast('شما خودتان این دعوت را ایجاد کرده‌اید و نمی‌توانید وضعیت آن را تغییر دهید.');
      return;
    }
    if (dodgeCount < 7) {
      handleDodge();
    } else {
      onReject();
      onShowToast('نظر شما کاملاً محترمه 🤍 دعوت رد شد.');
      setTimeout(() => onNavigate('landing'), 1500);
    }
  };

  const handleYesClick = () => {
    if (invitation?.isCreator) {
      onShowToast('شما خودتان این دعوت را ایجاد کرده‌اید و نمی‌توانید وضعیت آن را تغییر دهید.');
      return;
    }
    onAccept();
    onNavigate('invitation-accepted');
  };

  return (
    <section className="space-y-6 py-4 text-center max-w-sm mx-auto">
      {/* Live Preview Notification Banner */}
      {isPreview && (
        <div className="w-full bg-amber-500/15 border border-amber-300 text-amber-950 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2 text-right">
            <span className="text-base">✨</span>
            <span>
              {invitation?.isCreator
                ? 'پیش‌نمایش: شما این دعوت را ساخته‌اید'
                : 'این یک پیش نمایش هست'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onExitPreview) onExitPreview();
              onNavigate('landing');
            }}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-stone-800 text-[11px] font-bold border border-amber-200 transition-colors cursor-pointer shrink-0"
          >
            بازگشت به خانه
          </button>
        </div>
      )}

      {/* Top Badge & Recipient Name */}
      <div className="pt-2 space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold animate-pulse-soft">
          💌 یک دعوت‌نامه برای تو
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">{name}</h1>
      </div>

      {/* Main Interactive Invitation Card */}
      <div className="relative bg-white rounded-3xl p-7 border border-rose-100 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto animate-heart shadow-xs">
          💖
        </div>

        <div className="space-y-2">
          <p className="text-sm text-stone-500 font-medium">یه سوال مهم ازت دارم...</p>
          <h3 className="text-xl font-black text-stone-900 leading-snug">
            {message}
          </h3>
        </div>

        {/* Buttons */}
        <div className="relative min-h-[120px] flex flex-col items-center justify-center gap-3 pt-2">
          <button
            onClick={handleYesClick}
            className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-base shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
          >
            آره، بریم! 😍
          </button>

          {/* Elusive Playful No Button */}
          <button
            onMouseEnter={handleDodge}
            onClick={handleNoClick}
            style={{
              transform: `translate(${dodgeOffset.x}px, ${dodgeOffset.y}px)`,
              transition: 'transform 0.1s ease-out',
            }}
            className="px-8 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-semibold text-xs hover:bg-stone-200 transition-colors cursor-pointer select-none"
          >
            نه 😐
          </button>

          {dodgeHint && (
            <div className="text-[11px] text-rose-600 font-medium h-4 animate-fade-in">
              {dodgeHint}
            </div>
          )}
        </div>
      </div>

      <div className="text-[11px] text-stone-400">
        قدرت گرفته از <span className="font-bold text-stone-600">biaDate</span>
      </div>
    </section>
  );
};
