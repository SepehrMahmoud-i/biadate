import React from 'react';
import { PageId } from '../../types';

interface NotFoundPageProps {
  onNavigate: (page: PageId) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <section className="space-y-6 py-10 text-center max-w-sm mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-stone-200/60 text-stone-700 flex items-center justify-center text-3xl mx-auto">
        😅
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-stone-900">این صفحه رو پیدا نکردیم 😅</h1>
        <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
          شاید این دعوت‌نامه منقضی شده یا لینکش تغییر کرده باشه.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onNavigate('landing')}
          className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-98 transition-all cursor-pointer"
        >
          بازگشت به biaDate
        </button>
      </div>
    </section>
  );
};
