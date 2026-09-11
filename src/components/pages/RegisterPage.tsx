import React, { useState } from 'react';
import { PageId } from '../../types';

interface RegisterPageProps {
  onNavigate: (page: PageId) => void;
  onRegisterSuccess: (name: string, email: string) => void;
  onShowToast: (msg: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  onRegisterSuccess,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('لطفاً نام و نام خانوادگی را وارد کنید.');
      return;
    }
    if (!email.trim()) {
      onShowToast('لطفاً ایمیل معتبر وارد کنید.');
      return;
    }
    if (!password) {
      onShowToast('لطفاً رمز عبور را وارد کنید.');
      return;
    }
    if (password !== repassword) {
      onShowToast('تکرار رمز عبور مطابقت ندارد.');
      return;
    }

    onRegisterSuccess(name, email);
    onShowToast('حساب کاربری شما با موفقیت ساخته شد 🎉');
    onNavigate('dashboard');
  };

  return (
    <section className="space-y-6 py-6 max-w-sm mx-auto">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center text-xl mx-auto mb-2">
          ✨
        </div>
        <h1 className="text-2xl font-black text-stone-900">به biaDate خوش اومدی ❤️</h1>
        <p className="text-xs text-stone-600">برای ساخت اولین دعوت‌نامه‌ات ثبت‌نام کن.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">نام و نام‌خانوادگی</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً سپهر راد"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all dir-ltr text-right"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="حداقل ۸ کاراکتر"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all dir-ltr text-right"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">تکرار رمز عبور</label>
          <input
            type="password"
            value={repassword}
            onChange={(e) => setRepassword(e.target.value)}
            placeholder="تکرار رمز عبور"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all dir-ltr text-right"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/15 active:scale-98 transition-all cursor-pointer"
        >
          ساخت حساب
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-xs text-stone-700 hover:text-rose-500 cursor-pointer"
          >
            قبلاً حساب ساخته‌ام؛ <span className="font-bold text-rose-500">ورود</span>
          </button>
        </div>
      </form>
    </section>
  );
};
