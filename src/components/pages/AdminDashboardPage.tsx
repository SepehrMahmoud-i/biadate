import React, { useState, useEffect, useMemo } from 'react';
import { PageId, Invitation, AdminStatsData, AdminUserItem } from '../../types';
import {
  fetchAdminStatsApi,
  fetchAdminInvitationsApi,
  fetchAdminUsersApi,
  adminLogoutApi,
  verifyAdminSessionApi,
} from '../../services/api';
import {
  BarChart3,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Database,
  ArrowUpDown,
  LogOut,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Phone,
  X,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: PageId) => void;
  onSelectInvitation: (invitation: Invitation) => void;
  onShowToast: (msg: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onSelectInvitation,
  onShowToast,
}) => {
  const [statsData, setStatsData] = useState<AdminStatsData | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'week'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'pending' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // User Management & Search state
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [hasSearchedUser, setHasSearchedUser] = useState(false);
  const [lastSearchedTerm, setLastSearchedTerm] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const loadAdminUsers = async (search?: string) => {
    setIsSearchingUsers(true);
    try {
      const list = await fetchAdminUsersApi(search);
      setAdminUsers(list || []);
      const isSearched = Boolean(search && search.trim().length > 0);
      setHasSearchedUser(isSearched);
      if (isSearched) {
        setLastSearchedTerm(search!.trim());
      }
    } catch (err: any) {
      console.error('Error loading admin users:', err);
      if (err.message === 'UNAUTHORIZED') {
        onShowToast('نشست مدیریتی نامعتبر یا منقضی شده است. لطفاً مجدداً وارد شوید.');
        onNavigate('admin-login');
      }
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const [stats, invs] = await Promise.all([
        fetchAdminStatsApi({
          startDate: dateFilterMode === 'custom' ? customStartDate : undefined,
          endDate: dateFilterMode === 'custom' ? customEndDate : undefined,
        }),
        fetchAdminInvitationsApi({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          dateFilter: dateFilterMode !== 'custom' ? dateFilterMode : undefined,
          startDate: dateFilterMode === 'custom' ? customStartDate : undefined,
          endDate: dateFilterMode === 'custom' ? customEndDate : undefined,
          search: searchQuery.trim() || undefined,
        }),
      ]);

      if (stats) setStatsData(stats);
      if (invs) setInvitations(invs);
      await loadAdminUsers(userSearchTerm);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      if (err.message === 'UNAUTHORIZED') {
        onShowToast('نشست مدیریتی نامعتبر یا منقضی شده است. لطفاً مجدداً وارد شوید.');
        onNavigate('admin-login');
        return;
      }
      onShowToast('خطا در بارگذاری اطلاعات از پایگاه داده');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if current user is an authenticated admin
    verifyAdminSessionApi().then((isValid) => {
      if (!isValid) {
        onShowToast('برای دسترسی به این بخش، ورود به عنوان مدیر سیستم الزامی است.');
        onNavigate('admin-login');
      } else {
        loadData();
      }
    });
  }, [dateFilterMode, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(false);
  };

  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAdminUsers(userSearchTerm);
  };

  const handleClearUserSearch = () => {
    setUserSearchTerm('');
    setHasSearchedUser(false);
    setLastSearchedTerm('');
    loadAdminUsers('');
  };

  const handleCopyPhone = (phone: string, userId: number) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(String(userId));
    onShowToast('شماره تماس کپی شد');
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleCopy = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    onShowToast('توکن در حافظه کپی شد');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleViewRecipientPage = (inv: Invitation) => {
    onSelectInvitation(inv);
    onNavigate('public-invitation');
  };

  const handleViewDetails = (inv: Invitation) => {
    onSelectInvitation(inv);
    onNavigate('invitation-details');
  };

  // Filtered invitations according to tab
  const displayedInvitations = useMemo(() => {
    if (activeTab === 'today') {
      return statsData?.todayInvitations || invitations.filter((i) => i.createdAt.includes('امروز') || i.createdAt.includes('چند لحظه'));
    }
    if (activeTab === 'week') {
      return statsData?.weekInvitations || invitations;
    }
    return invitations;
  }, [activeTab, invitations, statsData]);

  return (
    <section className="space-y-5 py-2">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-rose-950 text-white p-5 rounded-3xl shadow-md space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                نشست امن مدیر سیستم • PostgreSQL
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              داشبورد مدیریتی biaDate
            </h1>
            <p className="text-xs text-stone-300">
              کنترل آمار لحظه‌ای دعوت‌ها، توکن‌های یکتا و گزارش تاریخ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
              title="به‌روزرسانی داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={async () => {
                await adminLogoutApi();
                onShowToast('با موفقیت از بخش مدیریت خارج شدید.');
                onNavigate('landing');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-500/25 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/40 transition-all text-xs font-bold cursor-pointer"
              title="خروج امن از پنل مدیریت"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج امن</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[11px] text-stone-300">کل دعوت‌ها</div>
            <div className="text-xl font-black text-white mt-0.5">
              {statsData ? statsData.summary.total.toLocaleString('fa-IR') : '—'}
            </div>
            <div className="text-[10px] text-rose-300 mt-1 flex items-center gap-1">
              <span>{statsData ? `${statsData.summary.acceptanceRate}% قبولی` : ''}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[11px] text-stone-300">دعوت‌های امروز</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {statsData ? statsData.summary.todayCount.toLocaleString('fa-IR') : '—'}
            </div>
            <div className="text-[10px] text-stone-300 mt-1">امروز ثبت‌شده</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[11px] text-stone-300">دعوت‌های این هفته</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">
              {statsData ? statsData.summary.weekCount.toLocaleString('fa-IR') : '—'}
            </div>
            <div className="text-[10px] text-stone-300 mt-1">۷ روز گذشته</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[11px] text-stone-300">پذیرفته‌شده</div>
            <div className="text-xl font-black text-rose-400 mt-0.5">
              {statsData ? statsData.summary.accepted.toLocaleString('fa-IR') : '—'}
            </div>
            <div className="text-[10px] text-stone-300 mt-1">
              {statsData ? `${statsData.summary.pending} در انتظار` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Invitations Summary Statistics Card */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">آمار خلاصه دعوت‌ها</h2>
              <p className="text-[11px] text-stone-500">تفکیک وضعیت و بازه‌های زمانی دعوت‌نامه‌ها</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            {statsData ? `${statsData.summary.acceptanceRate}% نرخ پذیرش` : 'آمار سرور'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[11px] text-stone-500 block">کل دعوت‌ها</span>
            <span className="text-xl font-black text-stone-900 mt-1 block">
              {statsData ? statsData.summary.total.toLocaleString('fa-IR') : '۰'}
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              {statsData ? `${statsData.summary.accepted} قبول / ${statsData.summary.rejected} رد` : 'ثبت شده'}
            </span>
          </div>

          <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
            <span className="text-[11px] text-emerald-700 block">دعوت‌های امروز</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">
              {statsData ? statsData.summary.todayCount.toLocaleString('fa-IR') : '۰'}
            </span>
            <span className="text-[10px] text-emerald-600/70 mt-0.5 block">امروز ثبت شدند</span>
          </div>

          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-[11px] text-amber-700 block">دعوت‌های این هفته</span>
            <span className="text-xl font-black text-amber-600 mt-1 block">
              {statsData ? statsData.summary.weekCount.toLocaleString('fa-IR') : '۰'}
            </span>
            <span className="text-[10px] text-amber-600/70 mt-0.5 block">۷ روز اخیر</span>
          </div>

          <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
            <span className="text-[11px] text-rose-700 block">دعوت‌های این ماه</span>
            <span className="text-xl font-black text-rose-600 mt-1 block">
              {statsData ? statsData.summary.monthCount.toLocaleString('fa-IR') : '۰'}
            </span>
            <span className="text-[10px] text-rose-600/70 mt-0.5 block">۳۰ روز اخیر</span>
          </div>
        </div>
      </div>

      {/* User Statistics Card */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">آمار کاربران سامانه</h2>
              <p className="text-[11px] text-stone-500">تفکیک ثبت‌نام و فعالیت کاربران</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            کاربران ثبت‌نام شده
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[11px] text-stone-500 block">کل کاربرها</span>
            <span className="text-xl font-black text-stone-900 mt-1 block">
              {statsData?.userStats ? statsData.userStats.total.toLocaleString('fa-IR') : '۰'}
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">عضویت ثبت شده</span>
          </div>

          <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
            <span className="text-[11px] text-emerald-700 block">کاربرهای امروز</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">
              {statsData?.userStats ? statsData.userStats.todayCount.toLocaleString('fa-IR') : '۰'}
            </span>
            <span className="text-[10px] text-emerald-600/70 mt-0.5 block">امروز ثبت‌نام کردند</span>
          </div>

          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-[11px] text-amber-700 block">کاربرهای این هفته</span>
            <span className="text-xl font-black text-amber-600 mt-1 block">
              {statsData?.userStats ? statsData.userStats.weekCount.toLocaleString('fa-IR') : '۰'}
            </span>
            <span className="text-[10px] text-amber-600/70 mt-0.5 block">۷ روز اخیر</span>
          </div>

          <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100">
            <span className="text-[11px] text-indigo-700 block">کاربرهای این ماه</span>
            <span className="text-xl font-black text-indigo-600 mt-1 block">
              {statsData?.userStats ? statsData.userStats.monthCount.toLocaleString('fa-IR') : '۰'}
            </span>
            <span className="text-[10px] text-indigo-600/70 mt-0.5 block">۳۰ روز اخیر</span>
          </div>
        </div>
      </div>

      {/* User Management & Membership Search Section */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">مدیریت و بررسی عضویت کاربران</h2>
              <p className="text-[11px] text-stone-500">
                {hasSearchedUser
                  ? `نتیجه بررسی برای «${lastSearchedTerm}»`
                  : '۱۰ کاربر اخیراً ثبت‌نام شده در سامانه'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasSearchedUser ? (
              adminUsers.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>عضویت تأیید شد ({adminUsers.length.toLocaleString('fa-IR')} کاربر)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <UserX className="w-3.5 h-3.5 text-rose-600" />
                  <span>کاربر عضو سایت نیست</span>
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                ۱۰ کاربر جدید اخیر
              </span>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleUserSearchSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="جستجوی نام یا شماره تماس کاربر (مثال: 0912 یا علی)..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-2.5 pr-10 pl-9 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-right"
                dir="rtl"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              {userSearchTerm && (
                <button
                  type="button"
                  onClick={handleClearUserSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                  title="پاک کردن جستجو"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearchingUsers}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isSearchingUsers ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>بررسی عضویت</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-600">
            💡 با جستجوی شماره همراه یا نام، می‌توانید بفهمید آیا شخص مورد نظر در سایت عضو شده است یا خیر.
          </p>
        </form>

        {/* Search Status Announcement */}
        {hasSearchedUser && (
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
              adminUsers.length > 0
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {adminUsers.length > 0 ? (
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <UserX className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">
                {adminUsers.length > 0
                  ? `کاربر با مشخصات «${lastSearchedTerm}» در سامانه عضو است (${adminUsers.length.toLocaleString('fa-IR')} کاربر یافت شد).`
                  : `کاربر با مشخصات «${lastSearchedTerm}» در سامانه عضو نشده است.`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearUserSearch}
              className="text-[11px] underline font-bold cursor-pointer shrink-0 mr-2"
            >
              بازگشت به ۱۰ کاربر اخیر
            </button>
          </div>
        )}

        {/* Users List Table */}
        {isSearchingUsers ? (
          <div className="py-8 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
            <span>در حال بررسی کاربران...</span>
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="py-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-500 text-xs">
            {hasSearchedUser
              ? `هیچ کاربری با مشخصات «${lastSearchedTerm}» در سایت عضو نیست.`
              : 'هنوز کاربری در سامانه ثبت نشده است.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-stone-700">
              <thead>
                <tr className="border-b border-stone-100 text-stone-600 text-[11px]">
                  <th className="pb-2.5 font-semibold">ردیف</th>
                  <th className="pb-2.5 font-semibold">نام کاربر</th>
                  <th className="pb-2.5 font-semibold">شماره تماس</th>
                  <th className="pb-2.5 font-semibold">وضعیت عضویت</th>
                  <th className="pb-2.5 font-semibold">تاریخ پیوستن</th>
                  <th className="pb-2.5 font-semibold">تعداد دعوت‌ها</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100/70">
                {adminUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 font-mono text-[11px] text-stone-600">
                      {(idx + 1).toLocaleString('fa-IR')}
                    </td>
                    <td className="py-3 font-bold text-stone-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-[11px]">
                          {u.name ? u.name.charAt(0) : '؟'}
                        </div>
                        <span>{u.name || 'بدون نام'}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-stone-800 text-[11px]">
                      <div className="flex items-center gap-1.5" dir="ltr">
                        <span className="font-bold">{u.phone}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(u.phone, u.id)}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="کپی شماره"
                        >
                          {copiedPhone === String(u.id) ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <UserCheck className="w-3 h-3" />
                        عضو سایت
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-stone-500">
                      {u.createdAt}
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {(u.invitationsCount || 0).toLocaleString('fa-IR')} دعوت
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Weekly Activity Trend Chart */}
      {statsData && statsData.dailyStats && statsData.dailyStats.length > 0 && (
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <h2 className="text-xs font-bold text-stone-900">روند دعوت‌ها در ۷ روز اخیر</h2>
            </div>
            <span className="text-[11px] text-stone-600 font-medium">به تفکیک روز</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-2 border-b border-stone-100">
            {statsData.dailyStats.map((item, idx) => {
              const maxVal = Math.max(...statsData.dailyStats.map((d) => d.total), 1);
              const heightPercent = Math.max((item.total / maxVal) * 100, 12);
              const isToday = idx === statsData.dailyStats.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="text-[10px] font-bold text-stone-600">
                    {item.total > 0 ? item.total.toLocaleString('fa-IR') : '۰'}
                  </div>
                  <div className="w-full max-w-[28px] flex flex-col justify-end rounded-t-lg overflow-hidden bg-stone-100 h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isToday ? 'bg-rose-500' : 'bg-stone-700'
                      }`}
                      title={`${item.label}: ${item.total} دعوت (${item.accepted} پذیرفته)`}
                    />
                  </div>
                  <div className={`text-[10px] truncate ${isToday ? 'font-black text-rose-600' : 'text-stone-600'}`}>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-stone-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>امروز</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-700" />
              <span>روزهای قبل</span>
            </div>
          </div>
        </div>
      )}

      {/* Date & Period Filtering Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
            <Calendar className="w-4 h-4 text-stone-600" />
            <span>فیلتر تاریخ و بازه زمانی:</span>
          </div>

          {/* Quick Period Buttons */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
            <button
              onClick={() => setDateFilterMode('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                dateFilterMode === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              همه
            </button>
            <button
              onClick={() => setDateFilterMode('today')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                dateFilterMode === 'today'
                  ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              امروز
            </button>
            <button
              onClick={() => setDateFilterMode('week')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                dateFilterMode === 'week'
                  ? 'bg-white text-rose-600 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              این هفته
            </button>
            <button
              onClick={() => setDateFilterMode('month')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                dateFilterMode === 'month'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              این ماه
            </button>
            <button
              onClick={() => setDateFilterMode('custom')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                dateFilterMode === 'custom'
                  ? 'bg-white text-rose-600 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              بازه دلخواه
            </button>
          </div>
        </div>

        {/* Custom Date Inputs if selected */}
        {dateFilterMode === 'custom' && (
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-stone-600">از تاریخ:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-stone-600">تا تاریخ:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800"
              />
            </div>
            <button
              onClick={() => loadData(false)}
              className="mt-4 px-3 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-800"
            >
              اعمال
            </button>
          </div>
        )}

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2 pt-1">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="جستجو با نام مخاطب، فرستنده یا توکن..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-stone-200 bg-stone-50 focus:bg-white focus:border-rose-400 outline-none text-stone-800 transition-all placeholder:text-stone-600"
            />
            <button
              type="submit"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-600 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Status select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 outline-none cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="accepted">پذیرفته‌شده</option>
            <option value="pending">در انتظار</option>
            <option value="rejected">رد شده</option>
          </select>
        </div>
      </div>

      {/* Main Tabs (All / Today / This Week) */}
      <div className="flex items-center gap-2 border-b border-stone-200/80 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200/60'
          }`}
        >
          <span>همه دعوت‌ها</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
            {invitations.length.toLocaleString('fa-IR')}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200/60'
          }`}
        >
          <span>دعوت‌های امروز</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
            {statsData ? statsData.summary.todayCount.toLocaleString('fa-IR') : '۰'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('week')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'week'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200/60'
          }`}
        >
          <span>دعوت‌های این هفته</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black">
            {statsData ? statsData.summary.weekCount.toLocaleString('fa-IR') : '۰'}
          </span>
        </button>
      </div>

      {/* Invitations List Table/Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto" />
            <div className="text-xs font-bold text-stone-700">در حال دریافت اطلاعات از PostgreSQL...</div>
          </div>
        ) : displayedInvitations.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 text-center space-y-2">
            <div className="text-2xl">🔍</div>
            <div className="text-xs font-bold text-stone-800">هیچ دعوتی با این مشخصات یافت نشد</div>
            <p className="text-[11px] text-stone-600">فیلترهای جستجو یا تاریخ را تغییر دهید.</p>
          </div>
        ) : (
          displayedInvitations.map((inv) => {
            const isExpanded = expandedToken === inv.token;

            return (
              <div
                key={inv.token || String(inv.id)}
                className="bg-white rounded-3xl border border-stone-200/80 p-4 shadow-2xs hover:border-rose-200 transition-all space-y-3"
              >
                {/* Primary Card Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-900">
                        {inv.recipientName}
                      </span>
                      {inv.senderName && (
                        <span className="text-[10px] text-stone-600">
                          از طرف: {inv.senderName}
                        </span>
                      )}
                    </div>

                    {/* Token Badge and Metadata */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/60 flex items-center gap-1">
                        <span>توکن: {inv.token}</span>
                        <button
                          onClick={() => handleCopy(inv.token, inv.token)}
                          className="text-stone-600 hover:text-stone-900 cursor-pointer ml-1"
                          title="کپی توکن"
                        >
                          {copiedToken === inv.token ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>

                      {inv.senderPhone && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1" dir="ltr">
                          📞 {inv.senderPhone}
                        </span>
                      )}

                      {inv.senderAccountName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-50 text-stone-600 border border-stone-200/60">
                          اکانت: {inv.senderAccountName}
                        </span>
                      )}

                      <span className="text-[10px] text-stone-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-600" />
                        {inv.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {inv.status === 'accepted' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        پذیرفته‌شده
                      </span>
                    ) : inv.status === 'pending' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        در انتظار پاسخ
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[11px] font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-stone-600" />
                        رد شده
                      </span>
                    )}
                  </div>
                </div>

                {/* Message snippet */}
                <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-2xl leading-relaxed border border-stone-100">
                  {inv.message}
                </p>

                {/* Preferences Preview if Accepted */}
                {inv.preferences && (
                  <div className="bg-rose-50/70 border border-rose-100 p-2.5 rounded-2xl text-[11px] text-rose-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      <span>ترجیحات انتخاب شده:</span>
                    </div>
                    <div className="text-stone-700">
                      فعالیت‌ها:{' '}
                      <span className="font-medium text-stone-900">
                        {inv.preferences.activities.join('، ') || '—'}
                      </span>
                    </div>
                    <div className="text-stone-700">
                      روزها و زمان:{' '}
                      <span className="font-medium text-stone-900">
                        {inv.preferences.days.join('، ')} ({inv.preferences.timeSlot})
                      </span>
                    </div>
                    {inv.preferences.notes && (
                      <div className="text-stone-700">
                        یادداشت مخاطب:{' '}
                        <span className="font-medium text-stone-900">{inv.preferences.notes}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewRecipientPage(inv)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>صفحه مخاطب</span>
                    </button>

                    <button
                      onClick={() => handleViewDetails(inv)}
                      className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      جزئیات و هماهنگی
                    </button>
                  </div>

                  <button
                    onClick={() => setExpandedToken(isExpanded ? null : inv.token)}
                    className="text-[10px] text-stone-600 hover:text-stone-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{isExpanded ? 'بستن' : 'اطلاعات فنی'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Technical Token Details Dropdown */}
                {isExpanded && (
                  <div className="bg-stone-900 text-stone-200 p-3 rounded-2xl text-[10px] font-mono space-y-1.5 border border-stone-800">
                    <div className="flex justify-between">
                      <span className="text-stone-600">DATABASE ID:</span>
                      <span>{inv.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">UNIQUE TOKEN:</span>
                      <span className="text-emerald-400">{inv.token}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">SLUG:</span>
                      <span>{inv.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">PUBLIC URL:</span>
                      <span className="text-rose-400">/invite?token={inv.token}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Return to Landing / App Footer Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('landing')}
          className="px-5 py-2.5 rounded-2xl bg-stone-200 text-stone-800 hover:bg-stone-300 font-bold text-xs cursor-pointer active:scale-95 transition-all"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    </section>
  );
};
