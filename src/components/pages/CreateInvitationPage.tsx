import React, { useState } from 'react';
import { PageId } from '../../types';

interface CreateInvitationPageProps {
  onNavigate: (page: PageId) => void;
  onCreateInvitation: (name: string, message: string) => void;
  onShowToast: (msg: string) => void;
}

export const CreateInvitationPage: React.FC<CreateInvitationPageProps> = ({
  onNavigate,
  onCreateInvitation,
  onShowToast,
}) => {
  const [recipientName, setRecipientName] = useState('سارا');
  const [message, setMessage] = useState('یه سوال مهم ازت دارم... حاضری با من یه قرار بریم؟ ❤️');
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const templates = [
    'یه سوال مهم ازت دارم... حاضری با من یه قرار بریم؟ ❤️',
    'فکر کنم وقتشه یه قهوه دونفره باهم بخوریم ☕',
    'فکر کنم وقتشه یه قرار بریم ❤️',
  ];

  const handleTemplateSelect = (idx: number) => {
    setSelectedTemplate(idx);
    setMessage(templates[idx]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      onShowToast('لطفاً اسم کسی که می‌خوای دعوتش کنی رو بنویس.');
      return;
    }
    onCreateInvitation(recipientName.trim(), message.trim());
    onShowToast('دعوت‌نامه با موفقیت ساخته شد!');
    onNavigate('invitation-created');
  };

  return (
    <section className="space-y-5 py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-stone-900">یک دعوت‌نامه بساز ❤️</h1>
        <p className="text-xs text-stone-600">فقط چند قدم تا دعوت کردنش فاصله داری.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-5">
        {/* Recipient name */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
            اسم کسی که می‌خوای دعوتش کنی چیه؟
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="مثلاً سارا"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
          />
        </div>

        {/* Template selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-stone-800">پیامت رو انتخاب کن</label>

          <div className="space-y-2">
            {templates.map((tpl, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedTemplate === idx
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="msg-template"
                  checked={selectedTemplate === idx}
                  onChange={() => handleTemplateSelect(idx)}
                  className="text-rose-500 focus:ring-rose-400 cursor-pointer"
                />
                <span className="text-xs font-medium text-stone-900">«{tpl}»</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom message textarea */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
            یا متن دلخواهت را بنویس:
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSelectedTemplate(-1);
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
          />
        </div>

        {/* Live Preview Card */}
        <div className="bg-[#faf8f5] p-4 rounded-2xl border border-stone-200 space-y-2 text-center">
          <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">
            پیش‌نمایش دعوت شما
          </div>
          <h4 className="text-base font-bold text-stone-900">
            {recipientName || 'سارا'}
          </h4>
          <p className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200/80 leading-relaxed shadow-xs">
            {message || 'یه سوال مهم ازت دارم... حاضری با من یه قرار بریم؟ ❤️'}
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 active:scale-98 transition-all cursor-pointer"
        >
          ساخت دعوت‌نامه
        </button>
      </form>
    </section>
  );
};
