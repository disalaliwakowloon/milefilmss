'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// ==================== TYPES ====================
interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  balance: number;
  role: string;
  status: string;
  withdrawPassword: string;
  inviteCode: string;
  createdAt: string;
}

interface Movie {
  id: number;
  title: string;
  genre: string;
  img: string;
  type: string;
  rating: string;
  link: string;
}

interface Promo {
  id: number;
  img: string;
  link: string;
}

interface EventItem {
  id: string;
  title: string;
  aktivasi: string;
  img: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

interface WithdrawAccount {
  id: string;
  userId: string;
  cardType: string;
  bankOwner: string;
  phone: string;
  bankName: string;
  accountNumber: string;
}

interface UpgradeRequest {
  id: string;
  userId: string;
  eventId: string;
  action: string;
  amount: number;
  status: string;
  createdAt: string;
  user?: User;
}

interface MemberUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  balance: number;
  role: string;
  status: string;
  withdrawPassword: string;
  inviteCode: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  withdrawAccounts: Array<{
    id: string;
    cardType: string;
    bankOwner: string;
    bankName: string;
    accountNumber: string;
    phone: string;
  }>;
}

interface MemberListData {
  users: MemberUser[];
  total: number;
  page: number;
  totalPages: number;
}

type Screen = 'auth' | 'dashboard' | 'promosi' | 'event' | 'event-detail' | 'upgrade' | 'upgrade-pending' | 'admin' | 'member-detail' | 'profile' | 'profile-detail' | 'withdraw-account' | 'add-withdraw' | 'asset' | 'deposit' | 'list' | 'withdraw-money' | 'history';

// ==================== CONSTANTS ====================
const CENSORED_NAMES = ['Ahmad Pratama', 'Muhammad Ramadhan', 'Dwi Nugroho', 'Budi Wijaya', 'Andi Hidayat', 'Rina Putri', 'Siti Rahma', 'Dewi Anggraini', 'Putri Maharani', 'Sri Kartika', 'Fajar Saputro', 'Yoga Wibowo', 'Aditya Firmansyah', 'Rizki Akbar', 'Indah Sari', 'Citra Dewanti', 'Anisa Putri', 'Bagus Setiawan', 'Reza Kurniawan', 'Farhan Putra', 'Intan Maharani', 'Vina Kusuma', 'Galih Saputra', 'Taufik Nugroho', 'Luthfi Syahputra', 'Nabila Aulia', 'Hana Putri', 'Hafiz Ghifari', 'Revan Prasetyo', 'Gilang Saputra', 'Fikri Hidayatullah', 'Zidan Nugroho', 'Alif Hakim', 'Kevin Prakoso', 'Arief Nugraha'];
const UNCENSORED_NAMES = ['Tengku fahmisyahputra', 'Abdullah alfandy', 'Rivaldi ardian', 'Isdanu Prayuda', 'Muhammad Aldi Widiansyah', 'Hena Enaw', 'Melvin Halim Purba', 'Bintang Ismail Ginting', 'Fadly Pasyah Ramadhan', 'Alif Maliki', 'Hendi Dermawan', 'Sapto Hadi Lubis', 'Anto Bonsai'];
const ALL_NAMES = [...CENSORED_NAMES, ...UNCENSORED_NAMES];
const SOURCE_LIST = ['MAX RIDE', 'SCREEN APP', 'HEMAT BACK', 'TEMEN BARUNEMA', 'CINEMA XXI', 'LATER CASHBACK', 'LALIWA STUDIO', 'MADJOE BERSAMA', 'ACEX GROUP', 'GOTO COMPAN', 'BINTANG GROUP', 'SASA CINEMA', 'MARLON TV', 'LITERASI TV', 'KAMI PRODUKSI'];

// ==================== HELPERS ====================
function censorName(name: string): string {
  const chars = name.split('');
  const letterIndices: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== ' ') letterIndices.push(i);
  }
  const numAsterisks = Math.random() < 0.5 ? 4 : 5;
  if (letterIndices.length <= numAsterisks) return name;
  // Shuffle
  for (let i = letterIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letterIndices[i], letterIndices[j]] = [letterIndices[j], letterIndices[i]];
  }
  const selected = letterIndices.slice(0, numAsterisks);
  for (const idx of selected) chars[idx] = '*';
  return chars.join('');
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName(): string {
  const name = getRandomItem(ALL_NAMES);
  if (CENSORED_NAMES.includes(name)) return censorName(name);
  return name;
}

function getRandomAmount(): string {
  const num = Math.floor(Math.random() * (900000000 - 100000 + 1)) + 100000;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function formatBalance(n: number): string {
  return n.toLocaleString('id-ID');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const lastActive = new Date(dateStr);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  return `${diffDays} hari yang lalu`;
}

function isOnline(dateStr: string): boolean {
  const now = new Date();
  const lastActive = new Date(dateStr);
  const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
  return diffMinutes < 5;
}

// ==================== MAIN COMPONENT ====================
export default function MilesApp() {
  const { toast } = useToast();
  
  // Auth state - initialize from localStorage if available
  const [token, setTokenState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Screen state
  const [screen, setScreen] = useState<Screen>('auth');
  const [prevScreen, setPrevScreen] = useState<Screen>('auth');

  // Set token and persist to localStorage
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      try { localStorage.setItem('milesapp_token', newToken); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem('milesapp_token'); } catch { /* ignore */ }
    }
  };

  // Restore token from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('milesapp_token');
      if (savedToken) {
        setTokenState(savedToken);
        // Verify token and fetch user profile
        try {
          const decoded = JSON.parse(atob(savedToken));
          fetch(`/api/profile?userId=${decoded.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                setCurrentUser(data.user);
                setScreen('dashboard');
              } else {
                // Token invalid, clear it
                localStorage.removeItem('milesapp_token');
                setTokenState(null);
              }
            })
            .catch(() => {
              localStorage.removeItem('milesapp_token');
              setTokenState(null);
            });
        } catch {
          localStorage.removeItem('milesapp_token');
          setTokenState(null);
        }
      }
    } catch { /* ignore */ }
  }, []);
  
  // Auth form state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState<string | null>(null);
  
  // Auth form refs (uncontrolled inputs for maximum compatibility)
  const loginUsernameRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const regInviteRef = useRef<HTMLInputElement>(null);
  const regUsernameRef = useRef<HTMLInputElement>(null);
  const regEmailRef = useRef<HTMLInputElement>(null);
  const regPhoneRef = useRef<HTMLInputElement>(null);
  const regPasswordRef = useRef<HTMLInputElement>(null);
  const regConfirmRef = useRef<HTMLInputElement>(null);
  const regWithdrawRef = useRef<HTMLInputElement>(null);

  // Invite code state (synced with admin Kode button)
  const [regInviteCode, setRegInviteCode] = useState('');
  
  // Data state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawAccounts, setWithdrawAccounts] = useState<WithdrawAccount[]>([]);
  const [adminUsers, setAdminUsers] = useState<MemberUser[]>([]);
  const [pendingUpgrades, setPendingUpgrades] = useState<UpgradeRequest[]>([]);
  
  // Member list state
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchTrigger, setMemberSearchTrigger] = useState(0);
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [memberTotal, setMemberTotal] = useState(0);
  const [selectedMember, setSelectedMember] = useState<MemberUser | null>(null);
  const [editForm, setEditForm] = useState({ username: '', password: '', email: '', phone: '', bankOwner: '', accountNumber: '', cardType: '' });
  
  // Admin registration form (inline)
  const [showRegForm, setShowRegForm] = useState(false);
  const [regForm, setRegForm] = useState({ username: '', email: '', phone: '', password: '' });
  const [loadingReg, setLoadingReg] = useState(false);
  
  // Admin kode input (manual)
  const [showKodeInput, setShowKodeInput] = useState(false);
  
  // Active invite code from DB
  const [activeInviteCode, setActiveInviteCode] = useState('');
  const [isInviteCodeActive, setIsInviteCodeActive] = useState(false);
  const [loadingKode, setLoadingKode] = useState(false);
  
  // Deposit/Withdraw modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [dwForm, setDwForm] = useState({ username: '', rekeningName: '', rekeningNumber: '', amount: '' });
  
  // Admin invite code state (local input, synced to DB on save)
  const [adminInviteCode, setAdminInviteCode] = useState('');

  // Event detail state
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [shadowCoinInput, setShadowCoinInput] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [upgradeRequestId, setUpgradeRequestId] = useState<string | null>(null);
  const [rewardList, setRewardList] = useState<Array<{ name: string; source: string; amount: string }>>([]);
  
  // Profile detail
  const [profileDetailTitle, setProfileDetailTitle] = useState('');
  
  // Add withdraw form
  const [addWithdrawForm, setAddWithdrawForm] = useState({
    cardType: 'WISE', bankOwner: '', phone: '', bankName: '', accountNumber: ''
  });
  
  // Withdraw money
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Deposit form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('bank');
  const [showBankDest, setShowBankDest] = useState(false);
  
  // Bank destination (admin-managed)
  const [showRekeningForm, setShowRekeningForm] = useState(false);
  const [bankDestList, setBankDestList] = useState<Array<{ id: string; bankName: string; accountNumber: string; bankType: string }>>([]);
  const [rekeningForm, setRekeningForm] = useState({ bankName: '', accountNumber: '', bankType: 'BCA' });
  const [loadingRekening, setLoadingRekening] = useState(false);
  
  // Beranda settings (trailer video URL + link + title + image + logo)
  const [trailerVideoUrl, setTrailerVideoUrl] = useState('');
  const [trailerLink, setTrailerLink] = useState('');
  const [trailerTitle, setTrailerTitle] = useState('');
  const [trailerImage, setTrailerImage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Wallpaper
  const [wallpaperUrl, setWallpaperUrl] = useState('');
  const [showWallpaperForm, setShowWallpaperForm] = useState(false);
  const [wallpaperInput, setWallpaperInput] = useState('');
  const [loadingWallpaper, setLoadingWallpaper] = useState(false);

  // Customer service
  const [csLink, setCsLink] = useState('');
  const [csLinkInput, setCsLinkInput] = useState('');
  const [loadingCs, setLoadingCs] = useState(false);

  // Admin messages
  const [adminMessages, setAdminMessages] = useState<Array<{ id: number; text: string; createdAt: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Event banner settings
  const [eventSettings, setEventSettings] = useState<Record<string, { img?: string; aktivasi?: string }>>({});
  const [showEventManager, setShowEventManager] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Role management
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [regRole, setRegRole] = useState<'user' | 'admin'>('user');

  // Password change
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Upgrade success
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  // Promosi management
  const [showPromoManager, setShowPromoManager] = useState(false);
  const [promoForm, setPromoForm] = useState({ img: '', link: '' });
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);

  // Admin movie management
  const [showMovieManager, setShowMovieManager] = useState(false);
  const [movieForm, setMovieForm] = useState({ title: '', genre: '', rating: '9.0', link: '', img: '' });
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<number | null>(null);

  // Full profile (Akun Saya) - includes password for complete display
  const [fullProfile, setFullProfile] = useState<{ username: string; email: string; phone: string; password: string; balance: number; role: string; status: string; inviteCode: string; createdAt: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Refs
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const rewardListRef = useRef<NodeJS.Timeout | null>(null);
  const memberSearchRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== API HELPERS ====================
  const apiCall = useCallback(async (url: string, options?: RequestInit) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers: { ...headers, ...options?.headers } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
    return data;
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(token));
      const data = await apiCall(`/api/profile?userId=${decoded.id}`);
      setCurrentUser(data.user);
    } catch {
      // ignore
    }
  }, [token, apiCall]);

  // Load full profile (includes password) for "Akun Saya" detail view
  const loadFullProfile = useCallback(async () => {
    if (!token || !currentUser) return;
    setLoadingProfile(true);
    try {
      const data = await apiCall(`/api/profile/full?userId=${currentUser.id}`);
      setFullProfile(data.user);
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingProfile(false);
    }
  }, [token, currentUser, apiCall, toast]);

  // ==================== SCREEN NAVIGATION ====================
  const navigate = useCallback((newScreen: Screen) => {
    setPrevScreen(screen);
    setScreen(newScreen);
  }, [screen]);

  // ==================== AUTH HANDLERS ====================
  const handleLogin = async () => {
    const username = loginUsernameRef.current?.value?.trim() || '';
    const password = loginPasswordRef.current?.value || '';
    if (!username || !password) {
      toast({ title: 'Error', description: 'Harap isi semua data!', variant: 'destructive' });
      return;
    }
    setLoading('login');
    try {
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setToken(data.token);
      setCurrentUser(data.user);
      toast({ title: 'Berhasil', description: 'Login berhasil!' });
      navigate('dashboard');
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleRegister = async () => {
    const d = {
      inviteCode: regInviteCode,
      username: regUsernameRef.current?.value?.trim() || '',
      email: regEmailRef.current?.value?.trim() || '',
      phone: regPhoneRef.current?.value?.trim() || '',
      password: regPasswordRef.current?.value || '',
      confirmPassword: regConfirmRef.current?.value || ''
    };
    if (!d.username || !d.password || !d.email) {
      toast({ title: 'Error', description: 'Data wajib tidak lengkap!', variant: 'destructive' });
      return;
    }
    if (!d.inviteCode || d.inviteCode.trim() === '') {
      toast({ title: 'Error', description: 'Kode undangan wajib diisi!', variant: 'destructive' });
      return;
    }
    if (d.password !== d.confirmPassword) {
      toast({ title: 'Error', description: 'Kata sandi tidak cocok!', variant: 'destructive' });
      return;
    }
    if (d.password.length < 6) {
      toast({ title: 'Error', description: 'Kata sandi minimal 6 karakter!', variant: 'destructive' });
      return;
    }
    setLoading('register');
    try {
      await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(d)
      });
      toast({ title: 'Berhasil', description: 'Pendaftaran berhasil! Silakan masuk.' });
      setAuthTab('login');
      // Pre-fill the login username
      if (loginUsernameRef.current) loginUsernameRef.current.value = d.username;
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    navigate('auth');
    toast({ title: 'Info', description: 'Berhasil logout' });
  };

  // ==================== DATA LOADERS ====================
  const loadMovies = async () => {
    try {
      const data = await apiCall('/api/movies');
      setMovies(data.movies || []);
    } catch { /* ignore */ }
  };

  const loadPromos = async () => {
    try {
      const data = await apiCall('/api/promos');
      setPromos(data.promos || []);
    } catch { /* ignore */ }
  };

  const loadEvents = async () => {
    try {
      const data = await apiCall('/api/events');
      setEvents(data.events || []);
    } catch { /* ignore */ }
  };

  const loadTransactions = async () => {
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(token));
      const data = await apiCall(`/api/transactions?userId=${decoded.id}`);
      setTransactions(data.transactions || []);
    } catch { /* ignore */ }
  };

  const loadWithdrawAccounts = async () => {
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(token));
      const data = await apiCall(`/api/withdraw-accounts?userId=${decoded.id}`);
      setWithdrawAccounts(data.accounts || []);
    } catch { /* ignore */ }
  };

  const loadAdminUsers = useCallback(async (search?: string, page?: number) => {
    try {
      const s = search !== undefined ? search : memberSearch;
      const p = page !== undefined ? page : memberPage;
      const data = await apiCall(`/api/users?search=${encodeURIComponent(s)}&page=${p}&limit=10`);
      setAdminUsers(data.users || []);
      setMemberTotalPages(data.totalPages || 1);
      setMemberTotal(data.total || 0);
    } catch { /* ignore */ }
  }, [memberSearch, memberPage, apiCall]);

  const loadPendingUpgrades = async () => {
    try {
      const data = await apiCall('/api/upgrade');
      setPendingUpgrades(data.requests || []);
    } catch { /* ignore */ }
  };

  // Load active invite code from DB
  const loadActiveInviteCode = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/invite-code');
      const data = await res.json();
      setActiveInviteCode(data.code || '');
      setIsInviteCodeActive(data.isActive || false);
      setAdminInviteCode(data.code || '');
    } catch { /* ignore */ }
  }, []);

  // Save invite code to DB
  const handleSaveInviteCode = useCallback(async () => {
    setLoadingKode(true);
    try {
      const code = adminInviteCode.trim();
      if (!code) {
        toast({ title: 'Error', description: 'Masukkan kode undangan terlebih dahulu!', variant: 'destructive' });
        setLoadingKode(false);
        return;
      }
      await apiCall('/api/settings/invite-code', {
        method: 'PUT',
        body: JSON.stringify({ code, isActive: true })
      });
      setActiveInviteCode(code);
      setIsInviteCodeActive(true);
      toast({ title: 'Berhasil', description: `Kode undangan "${code}" diaktifkan!` });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingKode(false);
    }
  }, [adminInviteCode, apiCall, toast]);

  // Deactivate invite code
  const handleDeactivateInviteCode = useCallback(async () => {
    setLoadingKode(true);
    try {
      const code = adminInviteCode.trim();
      await apiCall('/api/settings/invite-code', {
        method: 'PUT',
        body: JSON.stringify({ code, isActive: false })
      });
      setIsInviteCodeActive(false);
      toast({ title: 'Info', description: 'Kode undangan dinonaktifkan' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingKode(false);
    }
  }, [adminInviteCode, apiCall, toast]);

  // Load bank destination list from DB (public)
  const loadBankDestinations = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/bank-destination');
      const data = await res.json();
      setBankDestList(data.banks || []);
    } catch { /* ignore */ }
  }, []);

  // Save bank destination (admin)
  const handleSaveRekening = useCallback(async () => {
    const { bankName, accountNumber, bankType } = rekeningForm;
    if (!bankName || !accountNumber || !bankType) {
      toast({ title: 'Error', description: 'Harap isi semua data!', variant: 'destructive' });
      return;
    }
    setLoadingRekening(true);
    try {
      await apiCall('/api/settings/bank-destination', {
        method: 'PUT',
        body: JSON.stringify({ bankName, accountNumber, bankType })
      });
      toast({ title: 'Berhasil', description: 'Bank tujuan berhasil disimpan!' });
      setRekeningForm({ bankName: '', accountNumber: '', bankType: 'BCA' });
      loadBankDestinations();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingRekening(false);
    }
  }, [rekeningForm, apiCall, toast, loadBankDestinations]);

  // Delete bank destination (admin)
  const handleDeleteRekening = useCallback(async (id: string) => {
    try {
      await apiCall(`/api/settings/bank-destination?id=${id}`, {
        method: 'DELETE'
      });
      toast({ title: 'Berhasil', description: 'Bank tujuan berhasil dihapus!' });
      loadBankDestinations();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  }, [apiCall, toast, loadBankDestinations]);

  // Load beranda settings (trailer video URL + link + title + image + logo)
  const loadBerandaSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/beranda');
      const data = await res.json();
      setTrailerVideoUrl(data.trailerVideoUrl || '');
      setTrailerLink(data.trailerLink || '');
      setTrailerTitle(data.trailerTitle || '');
      setTrailerImage(data.trailerImage || '');
      setLogoUrl(data.logoUrl || '');
    } catch { /* ignore */ }
  }, []);

  // Load wallpaper URL
  const loadWallpaper = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/wallpaper');
      const data = await res.json();
      const url = data.wallpaperUrl || '';
      setWallpaperUrl(url);
      setWallpaperInput(url);
    } catch { /* ignore */ }
  }, []);

  // Save wallpaper URL (admin)
  const handleSaveWallpaper = useCallback(async () => {
    setLoadingWallpaper(true);
    try {
      await apiCall('/api/settings/wallpaper', {
        method: 'PUT',
        body: JSON.stringify({ wallpaperUrl: wallpaperInput })
      });
      setWallpaperUrl(wallpaperInput);
      toast({ title: 'Berhasil', description: 'Wallpaper berhasil disimpan!' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingWallpaper(false);
    }
  }, [wallpaperInput, apiCall, toast]);

  // Delete wallpaper (admin)
  const handleDeleteWallpaper = useCallback(async () => {
    setLoadingWallpaper(true);
    try {
      await apiCall('/api/settings/wallpaper', { method: 'DELETE' });
      setWallpaperUrl('');
      setWallpaperInput('');
      toast({ title: 'Berhasil', description: 'Wallpaper berhasil dihapus!' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingWallpaper(false);
    }
  }, [apiCall, toast]);

  // Load customer service link
  const loadCsLink = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/customer-service');
      const data = await res.json();
      const link = data.link || '';
      setCsLink(link);
      setCsLinkInput(link);
    } catch { /* ignore */ }
  }, []);

  // Save customer service link (admin)
  const handleSaveCsLink = useCallback(async () => {
    setLoadingCs(true);
    try {
      await apiCall('/api/settings/customer-service', {
        method: 'PUT',
        body: JSON.stringify({ link: csLinkInput })
      });
      setCsLink(csLinkInput);
      toast({ title: 'Berhasil', description: 'Link customer service berhasil disimpan!' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingCs(false);
    }
  }, [csLinkInput, apiCall, toast]);

  // Load admin messages
  const loadAdminMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/messages');
      const data = await res.json();
      setAdminMessages(data.messages || []);
    } catch { /* ignore */ }
  }, []);

  // Add new admin message (admin)
  const handleAddMessage = useCallback(async () => {
    const text = newMessage.trim();
    if (!text) {
      toast({ title: 'Error', description: 'Pesan tidak boleh kosong!', variant: 'destructive' });
      return;
    }
    setLoadingMessages(true);
    try {
      const newMsg = { id: Date.now(), text, createdAt: new Date().toISOString() };
      const updated = [...adminMessages, newMsg];
      await apiCall('/api/settings/messages', {
        method: 'PUT',
        body: JSON.stringify({ messages: updated })
      });
      setAdminMessages(updated);
      setNewMessage('');
      toast({ title: 'Berhasil', description: 'Pesan berhasil ditambahkan!' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingMessages(false);
    }
  }, [newMessage, adminMessages, apiCall, toast]);

  // Delete admin message (admin)
  const handleDeleteMessage = useCallback(async (id: number) => {
    setLoadingMessages(true);
    try {
      const updated = adminMessages.filter(m => m.id !== id);
      await apiCall('/api/settings/messages', {
        method: 'PUT',
        body: JSON.stringify({ messages: updated })
      });
      setAdminMessages(updated);
      toast({ title: 'Berhasil', description: 'Pesan berhasil dihapus!' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingMessages(false);
    }
  }, [adminMessages, apiCall, toast]);

  // Load event banner settings
  const loadEventSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/events');
      const data = await res.json();
      setEventSettings(data.eventSettings || {});
    } catch { /* ignore */ }
  }, []);

  // Save event banner settings (admin)
  const handleSaveEvent = useCallback(async (eventId: string, data: { img?: string; aktivasi?: string }) => {
    setLoadingEvent(true);
    try {
      await apiCall('/api/settings/events', {
        method: 'PUT',
        body: JSON.stringify({ eventId, ...data })
      });
      setEventSettings(prev => ({ ...prev, [eventId]: { ...prev[eventId], ...data } }));
      setEditingEventId(null);
      toast({ title: 'Berhasil', description: 'Pengaturan event berhasil disimpan!' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingEvent(false);
    }
  }, [apiCall, toast]);

  // Change user role (admin)
  const handleChangeRole = useCallback(async (userId: string, role: 'admin' | 'user') => {
    setLoadingRole(true);
    try {
      await apiCall(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      toast({ title: 'Berhasil', description: `Role berhasil diubah menjadi ${role === 'admin' ? 'Admin' : 'User'}!` });
      loadAdminUsers();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingRole(false);
    }
  }, [apiCall, toast, loadAdminUsers]);

  // Change own password
  const handleChangePassword = useCallback(async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'Semua field harus diisi!', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Konfirmasi kata sandi tidak cocok!', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Kata sandi baru minimal 6 karakter!', variant: 'destructive' });
      return;
    }
    setLoadingPassword(true);
    try {
      await apiCall('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      toast({ title: 'Berhasil', description: 'Kata sandi berhasil diubah!' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingPassword(false);
    }
  }, [passwordForm, apiCall, toast]);

  // Add new promo (admin)
  const handleAddPromo = useCallback(async () => {
    const { img, link } = promoForm;
    if (!img.trim()) {
      toast({ title: 'Error', description: 'URL gambar wajib diisi!', variant: 'destructive' });
      return;
    }
    setLoadingPromo(true);
    try {
      await apiCall('/api/admin/promos', {
        method: 'POST',
        body: JSON.stringify({ img: img.trim(), link: link.trim() || '#' })
      });
      toast({ title: 'Berhasil', description: 'Promo berhasil ditambahkan!' });
      setPromoForm({ img: '', link: '' });
      loadPromos();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingPromo(false);
    }
  }, [promoForm, apiCall, toast, loadPromos]);

  // Save promo edit (admin)
  const handleSavePromoEdit = useCallback(async (id: number, data: { img?: string; link?: string }) => {
    setLoadingPromo(true);
    try {
      await apiCall('/api/admin/promos', {
        method: 'PUT',
        body: JSON.stringify({ id, ...data })
      });
      toast({ title: 'Berhasil', description: 'Promo berhasil diperbarui!' });
      setEditingPromoId(null);
      loadPromos();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingPromo(false);
    }
  }, [apiCall, toast, loadPromos]);

  // Delete promo (admin)
  const handleDeletePromo = useCallback(async (id: number) => {
    if (!confirm('Hapus promo ini?')) return;
    try {
      await apiCall(`/api/admin/promos?id=${id}`, { method: 'DELETE' });
      toast({ title: 'Berhasil', description: 'Promo berhasil dihapus!' });
      loadPromos();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  }, [apiCall, toast, loadPromos]);

  // Background style helper - uses wallpaper if set
  const getBackgroundStyle = useCallback((variant: 'main' | 'alt' = 'main') => {
    if (wallpaperUrl && wallpaperUrl.startsWith('http')) {
      return {
        backgroundImage: `linear-gradient(rgba(5,8,20,0.62), rgba(5,8,20,0.68)), url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } as React.CSSProperties;
    }
    return {
      background: variant === 'main'
        ? 'radial-gradient(circle at 50% 0%, #1a1f40 0%, #050814 60%)'
        : 'linear-gradient(to bottom, #0f172a, #1e1b4b)'
    } as React.CSSProperties;
  }, [wallpaperUrl]);

  // Save trailer settings (admin) - saves video URL, link, title, image, and logo
  const handleSaveTrailerUrl = useCallback(async () => {
    setLoadingMovie(true);
    try {
      await apiCall('/api/settings/beranda', {
        method: 'PUT',
        body: JSON.stringify({ trailerVideoUrl, trailerLink, trailerTitle, trailerImage, logoUrl })
      });
      toast({ title: 'Berhasil', description: 'Pengaturan trailer berhasil disimpan!' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingMovie(false);
    }
  }, [trailerVideoUrl, trailerLink, trailerTitle, trailerImage, logoUrl, apiCall, toast]);

  // Save movie link (admin)
  const handleSaveMovieEdit = useCallback(async (movieId: number, data: { title?: string; genre?: string; rating?: string; link?: string; img?: string }) => {
    setLoadingMovie(true);
    try {
      await apiCall('/api/admin/movies', {
        method: 'PUT',
        body: JSON.stringify({ id: movieId, ...data })
      });
      toast({ title: 'Berhasil', description: 'Film berhasil diperbarui!' });
      loadMovies();
      setEditingMovieId(null);
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingMovie(false);
    }
  }, [apiCall, toast, loadMovies]);

  // Add new movie (admin)
  const handleAddMovie = useCallback(async () => {
    const { title, genre, rating, link, img } = movieForm;
    if (!title || !genre) {
      toast({ title: 'Error', description: 'Title dan genre wajib diisi!', variant: 'destructive' });
      return;
    }
    setLoadingMovie(true);
    try {
      await apiCall('/api/admin/movies', {
        method: 'POST',
        body: JSON.stringify({ title, genre, rating, link, img: img && img.trim() !== '' ? img.trim() : `movie_${Date.now()}` })
      });
      toast({ title: 'Berhasil', description: 'Film berhasil ditambahkan!' });
      setMovieForm({ title: '', genre: '', rating: '9.0', link: '', img: '' });
      loadMovies();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingMovie(false);
    }
  }, [movieForm, apiCall, toast, loadMovies]);

  // Delete movie (admin)
  const handleDeleteMovie = useCallback(async (movieId: number) => {
    try {
      await apiCall(`/api/admin/movies?id=${movieId}`, {
        method: 'DELETE'
      });
      toast({ title: 'Berhasil', description: 'Film berhasil dihapus!' });
      loadMovies();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  }, [apiCall, toast, loadMovies]);

  // ==================== HEARTBEAT ====================
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        const decoded = JSON.parse(atob(token));
        await fetch('/api/auth/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ userId: decoded.id })
        });
      } catch { /* ignore */ }
    }, 120000); // every 2 minutes
    return () => clearInterval(interval);
  }, [token]);

  // ==================== EVENT ACTION HANDLERS ====================
  const handleEventAction = (actionName: string) => {
    setSelectedAction(actionName);
    setShadowCoinInput('');
    // Generate initial reward list
    const initial = [];
    for (let i = 0; i < 5; i++) {
      initial.push({ name: getRandomName(), source: getRandomItem(SOURCE_LIST), amount: getRandomAmount() });
    }
    setRewardList(initial);
  };

  // Start reward list animation
  useEffect(() => {
    if (screen === 'event-detail' && selectedAction) {
      if (rewardListRef.current) clearInterval(rewardListRef.current);
      rewardListRef.current = setInterval(() => {
        setRewardList(prev => {
          const newRow = { name: getRandomName(), source: getRandomItem(SOURCE_LIST), amount: getRandomAmount() };
          const updated = [...prev, newRow];
          if (updated.length > 6) return updated.slice(-6);
          return updated;
        });
      }, 3000);
    }
    return () => {
      if (rewardListRef.current) clearInterval(rewardListRef.current);
    };
  }, [screen, selectedAction]);

  // Countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Countdown finished - auto-complete the upgrade request
      setCountdown(null);
      if (upgradeRequestId) {
        (async () => {
          try {
            await apiCall('/api/upgrade/auto-complete', {
              method: 'POST',
              body: JSON.stringify({ requestId: upgradeRequestId })
            });
            setUpgradeSuccess(true);
            toast({ title: 'Berhasil!', description: 'Permintaan peningkatan otomatis disetujui! Saldo Anda bertambah.' });
            fetchProfile();
          } catch (err: unknown) {
            toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
          }
        })();
      }
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdown, upgradeRequestId, navigate, apiCall, toast, fetchProfile]);

  const handleUpgrade = async () => {
    const amount = parseFloat(shadowCoinInput);
    if (!amount || amount <= 0) {
      toast({ title: 'Error', description: 'Masukkan jumlah koin bayangan terlebih dahulu!', variant: 'destructive' });
      return;
    }
    if (countdown !== null) return; // already counting down
    setUpgradeSuccess(false);
    
    try {
      // Create upgrade request
      const data = await apiCall('/api/upgrade', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser?.id,
          eventId: selectedEvent?.id,
          action: selectedAction,
          amount
        })
      });
      setUpgradeRequestId(data.upgradeRequest.id);
      // Start 60 second countdown (changed from 30 to 60 as requested)
      setCountdown(60);
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await apiCall(`/api/users/${userId}/toggle-status`, {
        method: 'POST'
      });
      toast({ title: 'Berhasil', description: 'Status berhasil diubah' });
      loadAdminUsers();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleApproveUpgrade = async (id: string) => {
    try {
      await apiCall(`/api/upgrade/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ adminId: currentUser?.id })
      });
      toast({ title: 'Berhasil', description: 'Permintaan peningkatan disetujui!' });
      loadPendingUpgrades();
      loadAdminUsers();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleRejectUpgrade = async (id: string) => {
    try {
      await apiCall(`/api/upgrade/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ adminId: currentUser?.id })
      });
      toast({ title: 'Berhasil', description: 'Permintaan peningkatan ditolak!' });
      loadPendingUpgrades();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleAddWithdraw = async () => {
    const d = addWithdrawForm;
    if (!d.bankOwner || !d.phone || !d.bankName || !d.accountNumber) {
      toast({ title: 'Error', description: 'Harap isi semua data!', variant: 'destructive' });
      return;
    }
    setLoading('add-withdraw');
    try {
      await apiCall('/api/withdraw-accounts', {
        method: 'POST',
        body: JSON.stringify({ ...d, userId: currentUser?.id })
      });
      toast({ title: 'Berhasil', description: 'Berhasil menambahkan akun penarikan!' });
      setAddWithdrawForm({ cardType: 'WISE', bankOwner: '', phone: '', bankName: '', accountNumber: '' });
      navigate('withdraw-account');
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  // ==================== ADMIN REGISTER HANDLER ====================
  const handleAdminRegister = async () => {
    const { username, email, phone, password } = regForm;
    if (!username || !email || !phone || !password) {
      toast({ title: 'Error', description: 'Harap isi semua data!', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password minimal 6 karakter!', variant: 'destructive' });
      return;
    }
    setLoadingReg(true);
    try {
      await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...regForm, confirmPassword: password, inviteCode: adminInviteCode, role: regRole })
      });
      toast({ title: 'Berhasil', description: `Akun ${username} berhasil didaftarkan sebagai ${regRole === 'admin' ? 'Admin' : 'User'}!` });
      setRegForm({ username: '', email: '', phone: '', password: '' });
      setRegRole('user');
      setShowRegForm(false);
      loadAdminUsers();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoadingReg(false);
    }
  };

  const handleCopyUsername = (username: string) => {
    navigator.clipboard.writeText(username).then(() => {
      toast({ title: 'Tersalin', description: `Username "${username}" disalin!` });
    }).catch(() => {
      toast({ title: 'Info', description: username });
    });
  };

  const handleWithdrawMoney = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount) {
      toast({ title: 'Error', description: 'Harap isi jumlah penarikan!', variant: 'destructive' });
      return;
    }
    if (isNaN(amount) || amount < 10000) {
      toast({ title: 'Error', description: 'Minimal penarikan adalah Rp 10.000!', variant: 'destructive' });
      return;
    }
    setLoading('withdraw-money');
    try {
      await apiCall('/api/withdraw', {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser?.id, amount })
      });
      toast({ title: 'Berhasil', description: 'Permintaan penarikan berhasil diproses!' });
      setWithdrawAmount('');
      fetchProfile();
      navigate('asset');
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  // ==================== MEMBER LIST HANDLERS ====================
  const handleMemberSearch = useCallback((value: string) => {
    setMemberSearch(value);
  }, []);

  const handleSearchClick = useCallback(() => {
    setMemberPage(1);
    setMemberSearchTrigger(t => t + 1);
  }, []);

  const handleSelectMember = async (userId: string) => {
    try {
      const data = await apiCall(`/api/users/${userId}`);
      const member = data.user as MemberUser;
      setSelectedMember(member);
      setEditForm({
        username: member.username || '',
        password: '',
        email: member.email || '',
        phone: member.phone || '',
        bankOwner: member.withdrawAccounts?.[0]?.bankOwner || '',
        accountNumber: member.withdrawAccounts?.[0]?.accountNumber || '',
        cardType: member.withdrawAccounts?.[0]?.cardType || '',
      });
      navigate('member-detail');
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;
    setLoading('update-member');
    try {
      const updateData: Record<string, string> = {};
      if (editForm.username) updateData.username = editForm.username;
      if (editForm.email) updateData.email = editForm.email;
      if (editForm.phone) updateData.phone = editForm.phone;
      if (editForm.password) updateData.password = editForm.password;

      await apiCall(`/api/users/${selectedMember.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      // Update withdraw account if exists
      if (selectedMember.withdrawAccounts?.[0]?.id) {
        const waId = selectedMember.withdrawAccounts[0].id;
        const waData: Record<string, string> = {};
        if (editForm.bankOwner) waData.bankOwner = editForm.bankOwner;
        if (editForm.accountNumber) waData.accountNumber = editForm.accountNumber;
        if (editForm.cardType) waData.cardType = editForm.cardType;
        if (Object.keys(waData).length > 0) {
          await apiCall(`/api/withdraw-accounts/${waId}`, {
            method: 'PUT',
            body: JSON.stringify(waData)
          });
        }
      }

      toast({ title: 'Berhasil', description: 'Data member berhasil diperbarui!' });
      navigate('admin');
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setLoading('delete-member');
    try {
      await apiCall(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      toast({ title: 'Berhasil', description: 'Akun berhasil dihapus!' });
      navigate('admin');
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  // ==================== ADMIN DEPOSIT/WITHDRAW HANDLERS ====================
  const handleAdminDeposit = async () => {
    if (!dwForm.username || !dwForm.amount) {
      toast({ title: 'Error', description: 'Harap isi username dan nominal saldo!', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(dwForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Error', description: 'Nominal saldo harus berupa angka positif!', variant: 'destructive' });
      return;
    }
    setLoading('admin-deposit');
    try {
      const data = await apiCall('/api/admin/deposit', {
        method: 'POST',
        body: JSON.stringify({ username: dwForm.username, amount })
      });
      toast({ title: 'Berhasil', description: data.message });
      setShowDepositModal(false);
      setDwForm({ username: '', rekeningName: '', rekeningNumber: '', amount: '' });
      loadAdminUsers();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleAdminWithdraw = async () => {
    if (!dwForm.username || !dwForm.amount) {
      toast({ title: 'Error', description: 'Harap isi username dan nominal saldo!', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(dwForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Error', description: 'Nominal saldo harus berupa angka positif!', variant: 'destructive' });
      return;
    }
    setLoading('admin-withdraw');
    try {
      const data = await apiCall('/api/admin/withdraw', {
        method: 'POST',
        body: JSON.stringify({ username: dwForm.username, amount })
      });
      toast({ title: 'Berhasil', description: data.message });
      setShowWithdrawModal(false);
      setDwForm({ username: '', rekeningName: '', rekeningNumber: '', amount: '' });
      loadAdminUsers();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  // Load data on screen change
  useEffect(() => {
    if (!token && screen !== 'auth') {
      setScreen('auth');
      return;
    }
    // Load wallpaper + beranda settings on every screen change (so background updates everywhere)
    loadWallpaper();
    loadBerandaSettings();
    switch (screen) {
      case 'dashboard':
        loadMovies();
        fetchProfile();
        loadBerandaSettings();
        break;
      case 'promosi':
        loadPromos();
        break;
      case 'event':
        loadEvents();
        loadEventSettings();
        if (countdownRef.current) clearTimeout(countdownRef.current);
        if (rewardListRef.current) clearInterval(rewardListRef.current);
        setCountdown(null);
        setSelectedAction('');
        setUpgradeSuccess(false);
        break;
      case 'admin':
        loadAdminUsers();
        loadPendingUpgrades();
        loadActiveInviteCode();
        loadBankDestinations();
        loadBerandaSettings();
        loadCsLink();
        break;
      case 'profile':
        fetchProfile();
        loadCsLink();
        break;
      case 'withdraw-account':
        loadWithdrawAccounts();
        break;
      case 'asset':
        fetchProfile();
        break;
      case 'history':
        loadTransactions();
        break;
      case 'list':
        loadPendingUpgrades();
        fetchProfile();
        break;
      case 'deposit':
        loadBankDestinations();
        break;
    }
  }, [screen, token]);

  // Reload admin users when page changes or search is triggered explicitly
  useEffect(() => {
    if (screen === 'admin' && token) {
      loadAdminUsers();
    }
  }, [memberPage, memberSearchTrigger, screen, token, loadAdminUsers]);

  // Auto-refresh profile periodically when on dashboard
  useEffect(() => {
    if (screen === 'dashboard' && token) {
      const interval = setInterval(fetchProfile, 10000);
      return () => clearInterval(interval);
    }
  }, [screen, token, fetchProfile]);

  // Format countdown display
  const formatCountdown = (seconds: number | null) => {
    if (seconds === null) return '01:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==================== BOTTOM NAV ====================
  const BottomNav = ({ active }: { active: string }) => {
    if (!currentUser) return null;
    const items = [
      { key: 'dashboard', label: 'Beranda', icon: '🏠', screen: 'dashboard' as Screen },
      { key: 'promosi', label: 'Promosi', icon: '🏷️', screen: 'promosi' as Screen },
      { key: 'event', label: 'Event', icon: '📅', screen: 'event' as Screen },
      ...(currentUser.role === 'admin' ? [{ key: 'admin', label: 'Admin', icon: '👥', screen: 'admin' as Screen }] : []),
      { key: 'profile', label: 'Saya', icon: '👤', screen: 'profile' as Screen },
    ];
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#050814]/90 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around py-3 max-w-md mx-auto">
        {items.map(item => (
          <button key={item.key} onClick={() => navigate(item.screen)}
            className={`flex flex-col items-center text-[10px] font-medium transition-colors ${active === item.key ? 'text-orange-500 font-bold' : 'text-gray-500'}`}>
            <span className="text-lg mb-0.5">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  // ==================== SCREEN: AUTH ====================
  const AuthScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={getBackgroundStyle('main')}>
      {/* Logo (custom image or default MILES planet) */}
      {logoUrl && logoUrl.startsWith('http') ? (
        <div className="mb-8 flex flex-col items-center">
          <img src={logoUrl} alt="Logo" className="w-24 h-24 rounded-full object-cover mb-2" style={{ boxShadow: '0 0 30px rgba(255,107,53,0.4)' }} />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-xs relative mb-8"
          style={{ background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)', boxShadow: '0 0 30px rgba(255,107,53,0.4)' }}>
          MILES
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-20deg] w-[120px] h-5 rounded-full border-[3px] border-white/30" />
        </div>
      )}
      
      <div className="bg-[#10141f] border border-gray-700 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button onClick={() => setAuthTab('login')}
            className={`flex-1 py-3 text-center font-bold text-sm border-b-2 transition-colors ${authTab === 'login' ? 'text-orange-500 border-orange-500' : 'text-gray-500 border-transparent'}`}>
            MASUK
          </button>
          <button onClick={() => setAuthTab('register')}
            className={`flex-1 py-3 text-center font-bold text-sm border-b-2 transition-colors ${authTab === 'register' ? 'text-orange-500 border-orange-500' : 'text-gray-500 border-transparent'}`}>
            DAFTAR
          </button>
        </div>

        {/* Login Form */}
        {authTab === 'login' && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nama Pengguna</label>
              <input ref={loginUsernameRef} type="text" defaultValue=""
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Masukkan username" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Kata Sandi</label>
              <input ref={loginPasswordRef} type="password" defaultValue=""
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Masukkan kata sandi" />
            </div>
            <button onClick={handleLogin} disabled={loading === 'login'}
              className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors disabled:opacity-50 mt-2">
              {loading === 'login' ? '⏳ Memproses...' : 'Masuk'}
            </button>
            {/* Admin hint */}
            <div className="text-center text-xs text-gray-500 mt-2 p-3 bg-[#0a0e18] rounded-lg border border-gray-700/50">
              <p className="font-semibold text-gray-400">PT Mira Lesmana Production Services</p>
            </div>
          </div>
        )}

        {/* Register Form */}
        {authTab === 'register' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Kode Undangan <span className="text-red-400">*</span></label>
              <input type="text" value={regInviteCode} onChange={e => setRegInviteCode(e.target.value)}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Wajib diisi" />
              <p className="text-[10px] text-gray-600 mt-0.5">Masukkan kode undangan dari admin</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nama Pengguna</label>
              <input ref={regUsernameRef} type="text" defaultValue=""
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Masukkan nama pengguna" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Email</label>
              <input ref={regEmailRef} type="email" defaultValue=""
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="email@domain.com" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nomor HP</label>
              <input ref={regPhoneRef} type="tel" defaultValue=""
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Kata Sandi</label>
              <input ref={regPasswordRef} type="password" defaultValue=""
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Minimal 6 karakter" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Konfirmasi Sandi</label>
              <input ref={regConfirmRef} type="password" defaultValue=""
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Ulangi kata sandi" />
            </div>

            <button onClick={handleRegister} disabled={loading === 'register'}
              className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors disabled:opacity-50 mt-2">
              {loading === 'register' ? '⏳ Memproses...' : 'Daftar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ==================== HEADER COMPONENT ====================
  const Header = ({ title, showBack, backScreen }: { title: string; showBack?: boolean; backScreen?: Screen }) => (
    <header className="flex items-center justify-between p-5 sticky top-0 bg-[#050814]/90 backdrop-blur-xl z-20 border-b border-white/10">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => backScreen && navigate(backScreen)} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
        )}
        {logoUrl && logoUrl.startsWith('http') ? (
          <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-orange-500/30">M</div>
        )}
        <div>
          {title === 'dashboard' ? (
            <>
              <p className="text-xs text-gray-400 m-0">Selamat datang!</p>
              <h2 className="text-base font-bold m-0 text-white">{currentUser?.username || 'User'}</h2>
            </>
          ) : (
            <h2 className="text-base font-bold m-0 text-white">{title}</h2>
          )}
        </div>
      </div>
    </header>
  );

  // ==================== SCREEN: DASHBOARD ====================
  const DashboardScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
      {Header({ title: 'dashboard' })}
      <main className="mt-4 flex flex-col gap-8">
        {/* Trailer / Video Section */}
        <section className="px-5">
          <div
            onClick={() => { if (trailerLink) window.open(trailerLink, '_blank'); }}
            className={`relative rounded-2xl overflow-hidden aspect-video bg-gray-800 ${trailerLink ? 'cursor-pointer' : ''}`}
          >
            {trailerVideoUrl ? (
              <video
                src={trailerVideoUrl}
                controls
                autoPlay={false}
                playsInline
                className="w-full h-full object-cover"
                poster={trailerImage && trailerImage.startsWith('http') ? trailerImage : "https://picsum.photos/seed/tungguaku/800/450"}
              />
            ) : (
              <img src={trailerImage && trailerImage.startsWith('http') ? trailerImage : "https://picsum.photos/seed/tungguaku/800/450"} alt="Trailer" className="w-full h-full object-cover opacity-70" />
            )}
            {/* Play/Link overlay icon when trailerLink exists */}
            {trailerLink && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
              <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold">OFFICIAL TRAILER</span>
              <h3 className="text-xl font-bold mt-2 text-white">{trailerTitle || 'Tunggu Aku Sukses Nanti'}</h3>
            </div>
          </div>
        </section>
        
        {/* Popular Films */}
        <section>
          <div className="flex justify-between items-center px-5 mb-4">
            <h3 className="font-bold text-lg text-white">FILM PALING POPULER</h3>
          </div>
          <div className="flex flex-col gap-4 px-5">
            {movies.map(m => (
              <div
                key={m.id}
                onClick={() => { if (m.link) window.open(m.link, '_blank'); }}
                className={`flex gap-4 items-center bg-[#10141f] p-3 rounded-xl border ${m.link ? 'border-gray-700 cursor-pointer hover:border-orange-500/50 hover:bg-[#131828] transition-all' : 'border-gray-700'}`}
              >
                <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 relative">
                  <img src={m.img && m.img.startsWith('http') ? m.img : `https://picsum.photos/seed/${m.img}/200/300`} alt={m.title} className="w-full h-full object-cover" />
                  {m.link && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded">⭐ {m.rating}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{m.genre}</p>
                  {m.link && (
                    <p className="text-[10px] text-orange-400 mt-1.5 flex items-center gap-1">
                      🔗 Klik untuk menonton
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      {BottomNav({ active: 'dashboard' })}
    </div>
  );

  // ==================== SCREEN: PROMOSI ====================
  const PromosiScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
      {Header({ title: 'Promosi' })}
      <main className="mt-6">
        <div className="grid grid-cols-3 gap-2.5 px-5 md:grid-cols-4 md:gap-4">
          {promos.map((p, i) => (
            <a key={p.id} href={p.link} target="_blank"
              className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 border border-white/5 transition-all hover:scale-105 hover:shadow-xl hover:border-orange-500 z-10 cursor-pointer block">
              <img src={`https://picsum.photos/seed/${p.img}/300/450`} alt={`Promo ${i+1}`} className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
      </main>
      {BottomNav({ active: 'promosi' })}
    </div>
  );

  // ==================== SCREEN: EVENT ====================
  const EventScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
      {Header({ title: 'Event' })}
      <main className="mt-6 flex flex-col gap-4 px-5">
        {events.map(ev => {
          const evSetting = eventSettings[ev.id] || {};
          const customImg = evSetting.img && evSetting.img.startsWith('http') ? evSetting.img : null;
          const customAktivasi = evSetting.aktivasi || ev.aktivasi;
          return (
            <div key={ev.id} onClick={() => { setSelectedEvent(ev); navigate('event-detail'); }}
              className="relative rounded-2xl overflow-hidden aspect-video bg-gray-800 border border-white/10 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:border-orange-500">
              <img src={customImg || `https://picsum.photos/seed/${ev.img}/800/450`} alt={ev.title} className="w-full h-full object-cover opacity-50 hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end h-full">
                <span className="text-orange-500 font-extrabold text-xs uppercase mb-1">{customAktivasi}</span>
                <h3 className="text-white font-bold text-lg">{ev.title}</h3>
              </div>
            </div>
          );
        })}
      </main>
      {BottomNav({ active: 'event' })}
    </div>
  );

  // ==================== SCREEN: EVENT DETAIL ====================
  const EventDetailScreen = () => {
    if (!selectedEvent) return null;
    const actions = ['Production', 'Director', 'Producer', 'Screenplay'];
    const actionIcons: Record<string, string> = { Production: '🎬', Director: '📣', Producer: '💰', Screenplay: '✏️' };
    const evSetting = eventSettings[selectedEvent.id] || {};
    const customAktivasi = evSetting.aktivasi || selectedEvent.aktivasi;
    const isBusy = countdown !== null || upgradeSuccess;

    return (
      <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
        <header className="flex items-center justify-between p-5 sticky top-0 bg-[#050814]/90 backdrop-blur-xl z-20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('event')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
            <h2 className="text-base font-bold text-white max-w-[250px] truncate">{selectedEvent.title}</h2>
          </div>
        </header>
        <main className="p-5">
          <div className="bg-[#10141f] p-6 rounded-2xl border border-gray-700">
            <h2 className="text-center text-white text-2xl font-extrabold mb-2">MilesFilm</h2>
            <p className="text-center text-gray-400 text-sm mb-6">{customAktivasi}</p>

            {/* Success Banner */}
            {upgradeSuccess && (
              <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-4 mb-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="text-green-400 font-bold text-base mb-1">Upgrade Berhasil!</h3>
                <p className="text-gray-300 text-xs">Permintaan peningkatan telah disetujui otomatis dan saldo Anda telah bertambah.</p>
              </div>
            )}
            
            {/* Timer */}
            <div className="bg-[#0a0e18] p-4 rounded-xl border border-gray-700 text-center mb-6">
              <span className="text-orange-500 font-bold text-xl">{formatCountdown(countdown)}</span>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {actions.map(action => (
                <button key={action} onClick={() => !isBusy && handleEventAction(action)} disabled={isBusy}
                  className={`bg-gray-800 text-white font-semibold p-3.5 rounded-xl border text-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${selectedAction === action ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/30' : 'border-gray-600 hover:bg-gray-700 hover:border-orange-500 hover:text-orange-500'}`}>
                  {actionIcons[action]} {action}
                </button>
              ))}
            </div>

            {/* Shadow Coin Section */}
            {selectedAction && (
              <div className="mt-6 bg-[#0a0e18] p-5 rounded-xl border border-gray-700">
                <h3 className="text-white text-base font-bold mb-4">Kolom Koin Bayangan</h3>
                
                {/* Reward List Header */}
                <div className="flex gap-2 items-center pb-2 border-b border-gray-700 mb-1">
                  <span className="w-[30%] text-[11px] text-gray-500 font-bold uppercase">Account</span>
                  <span className="flex-1 text-[11px] text-gray-500 font-bold uppercase">Detail</span>
                  <span className="w-[25%] text-[11px] text-gray-500 font-bold uppercase text-right">Amount</span>
                </div>
                
                {/* Reward List */}
                <div className="h-[250px] overflow-hidden border border-red-500/20 rounded-lg p-2.5 mb-4 bg-red-500/[0.03]">
                  {rewardList.map((row, i) => (
                    <div key={i} className="flex gap-2 items-center py-2.5 border-b border-gray-700/30">
                      <div className="w-[30%] text-xs font-semibold text-gray-300 truncate">{row.name}</div>
                      <div className="flex-1 text-[11px] text-gray-400 leading-tight">
                        Telah menyelesaikan tugas dari <span className="text-orange-400 font-bold">{row.source}</span>
                      </div>
                      <div className="w-[25%] text-xs font-semibold text-green-400 text-right">Rp {row.amount}</div>
                    </div>
                  ))}
                </div>

                {/* Coin Input Footer */}
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Setiap koin bayangan</label>
                    <input type="number" value={shadowCoinInput} onChange={e => setShadowCoinInput(e.target.value)} disabled={isBusy}
                      placeholder="0" className="bg-gray-800 border border-gray-600 text-white p-2 px-3 rounded-lg w-[120px] text-right font-semibold text-sm outline-none focus:border-orange-500 transition-colors disabled:opacity-60" />
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-700">
                    <span className="text-xs text-gray-400">Total 1 item</span>
                    <span className="text-xs text-orange-500 font-semibold">Total: Rp {formatBalance(parseFloat(shadowCoinInput) || 0)}</span>
                  </div>
                  <div className="flex gap-2.5 mt-3">
                    <button onClick={() => setShadowCoinInput('')} disabled={isBusy}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 p-2.5 rounded-lg cursor-pointer font-semibold text-sm flex-1 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      🗑️ Hapus
                    </button>
                    <button onClick={handleUpgrade} disabled={isBusy}
                      className="bg-orange-500 text-white border-none p-2.5 rounded-lg cursor-pointer font-bold text-sm shadow-lg shadow-orange-500/30 flex-[2] hover:bg-orange-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none">
                      {upgradeSuccess ? '✅ Berhasil' : countdown !== null ? `Menunggu... ${formatCountdown(countdown)}` : 'Tingkatkan segera'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        {BottomNav({ active: 'event' })}
      </div>
    );
  };

  // ==================== SCREEN: UPGRADE (Pending Confirmation) ====================
  const UpgradeScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
      <header className="flex items-center justify-between p-5 sticky top-0 bg-[#050814]/90 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('event-detail')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
          <h2 className="text-base font-bold text-white">Tingkatkan</h2>
        </div>
      </header>
      <main className="p-5">
        <div className="bg-[#10141f] p-8 rounded-3xl text-center border border-green-500 shadow-2xl shadow-green-500/20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500">
            <span className="text-4xl">✅</span>
          </div>
          <h3 className="text-xl font-extrabold text-white mb-2">Permintaan Terkirim!</h3>
          <p className="text-gray-400 text-sm mb-2">Level <span className="text-orange-500 font-bold">{selectedAction}</span> Anda sedang menunggu persetujuan admin.</p>
          <p className="text-orange-500 text-lg font-bold mb-6">Koin: Rp {formatBalance(parseFloat(shadowCoinInput) || 0)}</p>
          <p className="text-gray-500 text-xs mb-6">Saldo akan bertambah setelah admin menyetujui permintaan Anda.</p>
          <button onClick={() => navigate('event')}
            className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors">
            Kembali ke Event
          </button>
        </div>
      </main>
      {BottomNav({ active: 'event' })}
    </div>
  );

  // ==================== SCREEN: ADMIN ====================
  const AdminScreen = () => {
    if (currentUser?.role !== 'admin') return null;
    return (
      <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
        <header className="flex items-center justify-between p-5 sticky top-0 bg-[#050814]/90 border-b border-white/10 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">🛡️</div>
            <div>
              <p className="text-xs text-gray-400 m-0">Control Panel</p>
              <h2 className="text-base font-bold text-white m-0">Member List</h2>
            </div>
          </div>
          <button onClick={() => navigate('dashboard')} className="text-gray-400 text-sm font-semibold bg-transparent border-none cursor-pointer">
            ← Kembali
          </button>
        </header>
        <main className="mt-4 px-4">
          {/* Search Bar + Action Buttons */}
          <div className="mb-4 flex items-center justify-between gap-2">
            {/* Left: Action Buttons + Active Code Badge */}
            <div className="flex gap-2 flex-wrap items-center">
              <button onClick={() => setShowRegForm(!showRegForm)}
                className="bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20">
                Registrasi
              </button>
              <button onClick={() => setShowKodeInput(!showKodeInput)}
                className="bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors shadow-md shadow-purple-500/20">
                Kode
              </button>
              <button onClick={() => { setShowDepositModal(true); setDwForm({ username: '', rekeningName: '', rekeningNumber: '', amount: '' }); }}
                className="bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors shadow-md shadow-green-500/20">
                Deposit
              </button>
              <button onClick={() => { setShowWithdrawModal(true); setDwForm({ username: '', rekeningName: '', rekeningNumber: '', amount: '' }); }}
                className="bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors shadow-md shadow-green-500/20">
                Withdraw
              </button>
              <button onClick={() => { setShowRekeningForm(!showRekeningForm); if (!showRekeningForm) loadBankDestinations(); }}
                className="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20">
                Rekening
              </button>
              <button onClick={() => { setShowMovieManager(!showMovieManager); if (!showMovieManager) loadMovies(); }}
                className="bg-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-cyan-600 transition-colors shadow-md shadow-cyan-500/20">
                Film
              </button>
              <button onClick={() => { setShowWallpaperForm(!showWallpaperForm); if (!showWallpaperForm) { loadWallpaper(); loadCsLink(); loadBerandaSettings(); } }}
                className="bg-pink-500/85 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-pink-600 transition-colors shadow-md shadow-pink-500/20">
                Wallpaper
              </button>
              <button onClick={() => { setShowPromoManager(!showPromoManager); if (!showPromoManager) loadPromos(); }}
                className="bg-purple-500/85 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors shadow-md shadow-purple-500/20">
                Promosi
              </button>
              <button onClick={() => { setShowEventManager(!showEventManager); if (!showEventManager) { loadEvents(); loadEventSettings(); } }}
                className="bg-teal-500/85 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-teal-600 transition-colors shadow-md shadow-teal-500/20">
                Event
              </button>
              <button onClick={() => { setShowRoleManager(!showRoleManager); if (!showRoleManager) loadAdminUsers(); }}
                className="bg-amber-500/85 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20">
                Role
              </button>
              {/* Active Invite Code Badge - next to Withdraw */}
              {isInviteCodeActive && activeInviteCode && (
                <div className="bg-[#10141f] border border-green-500/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 animate-pulse"></span>
                  <span className="text-[10px] text-green-400 font-bold">Kode: <span className="text-white">{activeInviteCode}</span></span>
                </div>
              )}
            </div>

            {/* Right: Search Input + Search Button */}
            <div className="flex items-center gap-1.5" style={{ width: '25%', minWidth: '130px' }}>
              <input
                type="text"
                value={memberSearch}
                onChange={e => handleMemberSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearchClick(); }}
                placeholder="Cari username"
                className="flex-1 min-w-0 bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-[11px] outline-none focus:border-orange-500 transition-colors"
              />
              <button
                onClick={handleSearchClick}
                className="bg-[#0a0e18] border border-gray-600 text-gray-400 p-2 rounded-lg cursor-pointer hover:border-orange-500 hover:text-orange-400 transition-colors flex items-center justify-center flex-shrink-0"
              >
                🔍
              </button>
            </div>
          </div>

          {/* Inline Registration Form */}
          {showRegForm && (
            <div className="bg-[#10141f] border border-blue-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-blue-400 font-bold text-sm">📝 Registrasi Akun Baru</h4>
                <button onClick={() => setShowRegForm(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Username</label>
                  <input type="text" value={regForm.username} onChange={e => setRegForm(p => ({...p, username: e.target.value}))}
                    className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-blue-500 transition-colors"
                    placeholder="Username" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Email</label>
                  <input type="email" value={regForm.email} onChange={e => setRegForm(p => ({...p, email: e.target.value}))}
                    className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-blue-500 transition-colors"
                    placeholder="email@domain.com" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">No HP</label>
                  <input type="tel" value={regForm.phone} onChange={e => setRegForm(p => ({...p, phone: e.target.value}))}
                    className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-blue-500 transition-colors"
                    placeholder="08xxxxxxxxxx" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Password</label>
                  <input type="password" value={regForm.password} onChange={e => setRegForm(p => ({...p, password: e.target.value}))}
                    className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-blue-500 transition-colors"
                    placeholder="Minimal 6 karakter" />
                </div>
              </div>
              {/* Role Selector */}
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Role Akun</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRegRole('user')}
                    className={`flex-1 p-2 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${regRole === 'user' ? 'bg-blue-500 text-white border-blue-500' : 'bg-[#0a0e18] text-gray-400 border-gray-600 hover:border-blue-500'}`}>
                    👤 User
                  </button>
                  <button type="button" onClick={() => setRegRole('admin')}
                    className={`flex-1 p-2 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${regRole === 'admin' ? 'bg-red-500 text-white border-red-500' : 'bg-[#0a0e18] text-gray-400 border-gray-600 hover:border-red-500'}`}>
                    🛡️ Admin
                  </button>
                </div>
              </div>
              <button onClick={handleAdminRegister} disabled={loadingReg}
                className="bg-blue-500 text-white font-bold p-2.5 rounded-lg w-full text-xs cursor-pointer shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors disabled:opacity-50">
                {loadingReg ? '⏳ Mendaftarkan...' : '✅ Daftarkan Akun'}
              </button>
            </div>
          )}

          {/* Inline Kode Input */}
          {showKodeInput && (
            <div className="bg-[#10141f] border border-purple-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-purple-400 font-bold text-sm">🔑 Kode Undangan</h4>
                <button onClick={() => setShowKodeInput(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>
              <div className="flex gap-2">
                <input type="text" value={adminInviteCode} onChange={e => setAdminInviteCode(e.target.value)}
                  className="flex-1 bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors"
                  placeholder="Masukkan kode undangan" />
              </div>
              {/* Active/Inactive Status */}
              <div className="flex items-center justify-between bg-[#0a0e18] border border-gray-700 rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isInviteCodeActive ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                  <span className={`text-[11px] font-bold ${isInviteCodeActive ? 'text-green-400' : 'text-gray-500'}`}>
                    {isInviteCodeActive ? 'AKTIF' : 'TIDAK AKTIF'}
                  </span>
                  {isInviteCodeActive && activeInviteCode && (
                    <span className="text-[10px] text-gray-400 ml-1">({activeInviteCode})</span>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button onClick={handleSaveInviteCode} disabled={loadingKode || !adminInviteCode.trim()}
                  className="flex-1 bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {loadingKode ? '⏳...' : '✅ Aktifkan'}
                </button>
                <button onClick={handleDeactivateInviteCode} disabled={loadingKode || !isInviteCodeActive}
                  className="flex-1 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-red-500/30 transition-colors border border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed">
                  ❌ Nonaktifkan
                </button>
              </div>
            </div>
          )}

          {/* Inline Rekening Form */}
          {showRekeningForm && (
            <div className="bg-[#10141f] border border-orange-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-orange-400 font-bold text-sm">🏦 Bank Tujuan</h4>
                <button onClick={() => setShowRekeningForm(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Nama Rekening</label>
                  <input type="text" value={rekeningForm.bankName} onChange={e => setRekeningForm(p => ({...p, bankName: e.target.value}))}
                    className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-orange-500 transition-colors"
                    placeholder="Nama pemilik rekening" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Nomor Rekening</label>
                  <input type="text" value={rekeningForm.accountNumber} onChange={e => setRekeningForm(p => ({...p, accountNumber: e.target.value}))}
                    className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-orange-500 transition-colors"
                    placeholder="Nomor rekening" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Jenis Bank</label>
                <select value={rekeningForm.bankType} onChange={e => setRekeningForm(p => ({...p, bankType: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none cursor-pointer appearance-none">
                  <optgroup label="Bank" className="bg-[#0a0e18] text-orange-500">
                    {['BCA','BRI','BNI','Mandiri','Bank BTN','Bank Danamon','BSI','CIMB Niaga','SeaBank','Bank Jago','Bank Mega','Bank Panin','BTPN Syariah','Bank Muamalat','blu by BCA Digital','Allo Bank','Superbank'].map(v => <option key={v} value={v}>{v}</option>)}
                  </optgroup>
                  <optgroup label="E-Wallet" className="bg-[#0a0e18] text-orange-500">
                    {['WISE','OVO','GOPAY','DANA','SHOPEEPAY'].map(v => <option key={v} value={v}>{v}</option>)}
                  </optgroup>
                </select>
              </div>
              <button onClick={handleSaveRekening} disabled={loadingRekening}
                className="bg-orange-500 text-white font-bold p-2.5 rounded-lg w-full text-xs cursor-pointer shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors disabled:opacity-50">
                {loadingRekening ? '⏳ Menyimpan...' : '✅ Simpan Bank Tujuan'}
              </button>
              {/* List of existing bank destinations */}
              {bankDestList.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">Bank Tujuan Terdaftar</p>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                    {bankDestList.map(bank => (
                      <div key={bank.id} className="flex items-center justify-between bg-[#0a0e18] border border-gray-700 rounded-lg px-2.5 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-orange-400 font-bold">{bank.bankType}</span>
                            <span className="text-[10px] text-gray-300 truncate">{bank.bankName}</span>
                          </div>
                          <p className="text-[9px] text-gray-500 truncate">{bank.accountNumber}</p>
                        </div>
                        <button onClick={() => handleDeleteRekening(bank.id)}
                          className="text-red-400 text-[10px] cursor-pointer bg-transparent border-none hover:text-red-300 ml-2 flex-shrink-0">
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inline Film Manager */}
          {showMovieManager && (
            <div className="bg-[#10141f] border border-cyan-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-cyan-400 font-bold text-sm">🎬 Kelola Film & Trailer</h4>
                <button onClick={() => setShowMovieManager(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>

              {/* Trailer Title */}
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">🏷️ Judul Trailer (Banner Beranda)</label>
                <input type="text" value={trailerTitle} onChange={e => setTrailerTitle(e.target.value)}
                  className="w-full bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Tunggu Aku Sukses Nanti" />
              </div>

              {/* Trailer Image URL */}
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">🖼️ URL Gambar Trailer (Banner Beranda)</label>
                <input type="text" value={trailerImage} onChange={e => setTrailerImage(e.target.value)}
                  className="w-full bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://example.com/trailer.jpg (kosongkan = gambar default)" />
              </div>

              {/* Trailer Video URL */}
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">🎬 URL Video Trailer (Beranda)</label>
                <input type="text" value={trailerVideoUrl} onChange={e => setTrailerVideoUrl(e.target.value)}
                  className="w-full bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://example.com/video.mp4" />
              </div>

              {/* Trailer Link */}
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">🔗 Link Trailer (diklik → buka link)</label>
                <div className="flex gap-2">
                  <input type="text" value={trailerLink} onChange={e => setTrailerLink(e.target.value)}
                    className="flex-1 bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-cyan-500 transition-colors"
                    placeholder="https://youtube.com/watch?v=..." />
                  <button onClick={handleSaveTrailerUrl} disabled={loadingMovie}
                    className="bg-cyan-500 text-white text-[10px] font-bold px-3 rounded-lg cursor-pointer hover:bg-cyan-600 transition-colors disabled:opacity-40 whitespace-nowrap">
                    {loadingMovie ? '⏳' : '💾 Simpan'}
                  </button>
                </div>
              </div>

              {/* Add New Movie */}
              <div className="border-t border-gray-700 pt-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Tambah Film Baru</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Judul Film</label>
                    <input type="text" value={movieForm.title} onChange={e => setMovieForm(p => ({...p, title: e.target.value}))}
                      className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Judul film" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Genre</label>
                    <input type="text" value={movieForm.genre} onChange={e => setMovieForm(p => ({...p, genre: e.target.value}))}
                      className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Aksi, Horor, dll" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Rating</label>
                    <input type="text" value={movieForm.rating} onChange={e => setMovieForm(p => ({...p, rating: e.target.value}))}
                      className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-cyan-500 transition-colors"
                      placeholder="9.0" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Link Film</label>
                    <input type="text" value={movieForm.link} onChange={e => setMovieForm(p => ({...p, link: e.target.value}))}
                      className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-cyan-500 transition-colors"
                      placeholder="https://..." />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="text-[10px] text-gray-400 block mb-0.5">🖼️ URL Gambar Poster Film (opsional)</label>
                  <input type="text" value={movieForm.img} onChange={e => setMovieForm(p => ({...p, img: e.target.value}))}
                    className="bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs w-full outline-none focus:border-cyan-500 transition-colors"
                    placeholder="https://example.com/poster.jpg (kosongkan = gambar acak)" />
                </div>
                <button onClick={handleAddMovie} disabled={loadingMovie || !movieForm.title || !movieForm.genre}
                  className="bg-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-lg w-full mt-2 cursor-pointer hover:bg-cyan-600 transition-colors disabled:opacity-40">
                  ➕ Tambah Film
                </button>
              </div>

              {/* Existing Movies List */}
              {movies.length > 0 && (
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Daftar Film ({movies.length})</p>
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {movies.map(m => (
                      <div key={m.id} className="bg-[#0a0e18] border border-gray-700 rounded-lg p-2.5">
                        {editingMovieId === m.id ? (
                          /* Full Edit Mode */
                          <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-3 gap-2">
                              <input type="text" defaultValue={m.title} id={`movie-title-${m.id}`}
                                className="bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Judul film" />
                              <input type="text" defaultValue={m.genre} id={`movie-genre-${m.id}`}
                                className="bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Genre" />
                              <input type="text" defaultValue={m.rating} id={`movie-rating-${m.id}`}
                                className="bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Rating" />
                            </div>
                            <input type="text" defaultValue={m.img} id={`movie-img-${m.id}`}
                              className="w-full bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-cyan-500 transition-colors"
                              placeholder="URL Gambar Poster (https://...)" />
                            <div className="flex gap-2">
                              <input type="text" defaultValue={m.link} id={`movie-link-${m.id}`}
                                className="flex-1 bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Link film (https://...)" />
                              <button onClick={() => {
                                const title = (document.getElementById(`movie-title-${m.id}`) as HTMLInputElement)?.value?.trim();
                                const genre = (document.getElementById(`movie-genre-${m.id}`) as HTMLInputElement)?.value?.trim();
                                const rating = (document.getElementById(`movie-rating-${m.id}`) as HTMLInputElement)?.value?.trim();
                                const link = (document.getElementById(`movie-link-${m.id}`) as HTMLInputElement)?.value?.trim();
                                const img = (document.getElementById(`movie-img-${m.id}`) as HTMLInputElement)?.value?.trim();
                                if (title) handleSaveMovieEdit(m.id, { title, genre: genre || '', rating: rating || '', link: link || '', img: img || '' });
                              }}
                                className="bg-cyan-500 text-white text-[10px] font-bold px-3 rounded cursor-pointer hover:bg-cyan-600">
                                ✅ Simpan
                              </button>
                              <button onClick={() => setEditingMovieId(null)}
                                className="bg-gray-700 text-white text-[10px] font-bold px-2.5 rounded cursor-pointer hover:bg-gray-600">
                                ❌
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-[10px] text-cyan-400 font-bold">⭐ {m.rating}</span>
                                <span className="text-xs text-white font-semibold truncate">{m.title}</span>
                                <span className="text-[10px] text-gray-500">{m.genre}</span>
                              </div>
                              <button onClick={() => handleDeleteMovie(m.id)}
                                className="text-red-400 text-[10px] cursor-pointer bg-transparent border-none hover:text-red-300 flex-shrink-0">
                                🗑️
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] text-gray-500 truncate flex-1">{m.link || 'Belum ada link'}</p>
                              <button onClick={() => setEditingMovieId(m.id)}
                                className="text-cyan-400 text-[10px] cursor-pointer bg-transparent border-none hover:text-cyan-300 flex-shrink-0 ml-2">
                                ✏️ Edit
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inline Wallpaper Manager */}
          {showWallpaperForm && (
            <div className="bg-[#10141f] border border-pink-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-pink-400 font-bold text-sm">🖼️ Wallpaper & Tampilan</h4>
                <button onClick={() => setShowWallpaperForm(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>

              {/* Wallpaper URL */}
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">URL Wallpaper (background seluruh aplikasi)</label>
                <div className="flex gap-2">
                  <input type="text" value={wallpaperInput} onChange={e => setWallpaperInput(e.target.value)}
                    className="flex-1 bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-pink-500 transition-colors"
                    placeholder="https://example.com/wallpaper.jpg" />
                  <button onClick={handleSaveWallpaper} disabled={loadingWallpaper}
                    className="bg-pink-500 text-white text-[10px] font-bold px-3 rounded-lg cursor-pointer hover:bg-pink-600 transition-colors disabled:opacity-40 whitespace-nowrap">
                    {loadingWallpaper ? '⏳' : '💾 Simpan'}
                  </button>
                  <button onClick={handleDeleteWallpaper} disabled={loadingWallpaper}
                    className="bg-red-500/20 text-red-400 text-[10px] font-bold px-3 rounded-lg cursor-pointer hover:bg-red-500/30 transition-colors border border-red-500/30 disabled:opacity-40 whitespace-nowrap">
                    🗑️
                  </button>
                </div>
                {wallpaperUrl && wallpaperUrl.startsWith('http') && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-700">
                    <img src={wallpaperUrl} alt="Wallpaper preview" className="w-full h-24 object-cover" />
                  </div>
                )}
              </div>

              {/* Logo URL */}
              <div className="border-t border-gray-700 pt-3">
                <label className="text-[10px] text-gray-400 block mb-0.5">URL Logo (header & auth screen)</label>
                <div className="flex gap-2">
                  <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                    className="flex-1 bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-pink-500 transition-colors"
                    placeholder="https://example.com/logo.png" />
                  <button onClick={handleSaveTrailerUrl} disabled={loadingMovie}
                    className="bg-pink-500 text-white text-[10px] font-bold px-3 rounded-lg cursor-pointer hover:bg-pink-600 transition-colors disabled:opacity-40 whitespace-nowrap">
                    {loadingMovie ? '⏳' : '💾 Simpan'}
                  </button>
                </div>
              </div>

              {/* CS Link */}
              <div className="border-t border-gray-700 pt-3">
                <label className="text-[10px] text-gray-400 block mb-0.5">Link Customer Service</label>
                <div className="flex gap-2">
                  <input type="text" value={csLinkInput} onChange={e => setCsLinkInput(e.target.value)}
                    className="flex-1 bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-pink-500 transition-colors"
                    placeholder="https://wa.me/62..." />
                  <button onClick={handleSaveCsLink} disabled={loadingCs}
                    className="bg-pink-500 text-white text-[10px] font-bold px-3 rounded-lg cursor-pointer hover:bg-pink-600 transition-colors disabled:opacity-40 whitespace-nowrap">
                    {loadingCs ? '⏳' : '💾 Simpan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Inline Promosi Manager */}
          {showPromoManager && (
            <div className="bg-[#10141f] border border-purple-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-purple-400 font-bold text-sm">🏷️ Kelola Promosi</h4>
                <button onClick={() => setShowPromoManager(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>
              {/* Add New Promo */}
              <div className="border-b border-gray-700 pb-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Tambah Promo Baru</p>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">URL Gambar</label>
                    <input type="text" value={promoForm.img} onChange={e => setPromoForm(p => ({...p, img: e.target.value}))}
                      className="w-full bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors"
                      placeholder="https://example.com/promo.jpg" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Link Promo (opsional)</label>
                    <input type="text" value={promoForm.link} onChange={e => setPromoForm(p => ({...p, link: e.target.value}))}
                      className="w-full bg-[#0a0e18] border border-gray-600 text-white p-2 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors"
                      placeholder="https://..." />
                  </div>
                  <button onClick={handleAddPromo} disabled={loadingPromo || !promoForm.img.trim()}
                    className="bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg w-full cursor-pointer hover:bg-purple-600 transition-colors disabled:opacity-40">
                    ➕ Tambah Promo
                  </button>
                </div>
              </div>
              {/* Existing Promos */}
              {promos.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Daftar Promo ({promos.length})</p>
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {promos.map(p => (
                      <div key={p.id} className="bg-[#0a0e18] border border-gray-700 rounded-lg p-2.5">
                        {editingPromoId === p.id ? (
                          <div className="flex flex-col gap-2">
                            <input type="text" defaultValue={p.img} id={`promo-img-${p.id}`}
                              className="w-full bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-purple-500 transition-colors"
                              placeholder="URL Gambar" />
                            <input type="text" defaultValue={p.link} id={`promo-link-${p.id}`}
                              className="w-full bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-purple-500 transition-colors"
                              placeholder="Link" />
                            <div className="flex gap-2">
                              <button onClick={() => {
                                const img = (document.getElementById(`promo-img-${p.id}`) as HTMLInputElement)?.value?.trim();
                                const link = (document.getElementById(`promo-link-${p.id}`) as HTMLInputElement)?.value?.trim();
                                if (img) handleSavePromoEdit(p.id, { img, link });
                              }}
                                className="bg-purple-500 text-white text-[10px] font-bold px-3 rounded cursor-pointer hover:bg-purple-600">
                                ✅ Simpan
                              </button>
                              <button onClick={() => setEditingPromoId(null)}
                                className="bg-gray-700 text-white text-[10px] font-bold px-2.5 rounded cursor-pointer hover:bg-gray-600">
                                ❌
                                </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <img src={`https://picsum.photos/seed/${p.img}/60/90`} alt="Promo" className="w-10 h-14 rounded object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-white truncate">{p.img}</p>
                              <p className="text-[9px] text-gray-500 truncate">{p.link || 'Tanpa link'}</p>
                            </div>
                            <button onClick={() => setEditingPromoId(p.id)}
                              className="text-purple-400 text-[10px] cursor-pointer bg-transparent border-none hover:text-purple-300 flex-shrink-0">
                              ✏️
                            </button>
                            <button onClick={() => handleDeletePromo(p.id)}
                              className="text-red-400 text-[10px] cursor-pointer bg-transparent border-none hover:text-red-300 flex-shrink-0">
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inline Event Manager */}
          {showEventManager && (
            <div className="bg-[#10141f] border border-teal-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-teal-400 font-bold text-sm">📅 Kelola Event Banner</h4>
                <button onClick={() => setShowEventManager(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>
              {events.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">Belum ada event</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                  {events.map(ev => {
                    const evSetting = eventSettings[ev.id] || {};
                    const isEditing = editingEventId === ev.id;
                    return (
                      <div key={ev.id} className="bg-[#0a0e18] border border-gray-700 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-white font-semibold truncate flex-1">{ev.title}</span>
                          <button onClick={() => setEditingEventId(isEditing ? null : ev.id)}
                            className="text-teal-400 text-[10px] cursor-pointer bg-transparent border-none hover:text-teal-300 flex-shrink-0 ml-2">
                            {isEditing ? '✕' : '✏️'}
                          </button>
                        </div>
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block mb-0.5">Teks Aktivasi</label>
                              <input type="text" defaultValue={evSetting.aktivasi || ev.aktivasi} id={`event-aktivasi-${ev.id}`}
                                className="w-full bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-teal-500 transition-colors"
                                placeholder="AKTIVASI..." />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block mb-0.5">URL Gambar Banner (https://...)</label>
                              <input type="text" defaultValue={evSetting.img || ''} id={`event-img-${ev.id}`}
                                className="w-full bg-[#10141f] border border-gray-600 text-white p-1.5 rounded text-[10px] outline-none focus:border-teal-500 transition-colors"
                                placeholder="https://example.com/banner.jpg" />
                            </div>
                            <button onClick={() => {
                              const aktivasi = (document.getElementById(`event-aktivasi-${ev.id}`) as HTMLInputElement)?.value?.trim();
                              const img = (document.getElementById(`event-img-${ev.id}`) as HTMLInputElement)?.value?.trim();
                              handleSaveEvent(ev.id, { aktivasi, img });
                            }} disabled={loadingEvent}
                              className="bg-teal-500 text-white text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer hover:bg-teal-600 transition-colors disabled:opacity-40">
                              {loadingEvent ? '⏳' : '✅ Simpan'}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500">
                            <p>Aktivasi: <span className="text-gray-300">{evSetting.aktivasi || ev.aktivasi}</span></p>
                            <p className="truncate">Image: <span className="text-gray-400">{evSetting.img || 'default'}</span></p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Inline Role Manager */}
          {showRoleManager && (
            <div className="bg-[#10141f] border border-amber-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-amber-400 font-bold text-sm">👥 Manajemen Role Pengguna</h4>
                <button onClick={() => setShowRoleManager(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>
              {adminUsers.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">Tidak ada pengguna</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                  {adminUsers.map(u => (
                    <div key={u.id} className="bg-[#0a0e18] border border-gray-700 rounded-lg p-2.5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-white font-semibold truncate">{u.username}</span>
                          {u.role === 'admin' && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold flex-shrink-0">ADMIN</span>}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                      </div>
                      {u.id === currentUser?.id ? (
                        <span className="text-[9px] text-amber-400 font-bold flex-shrink-0">Anda</span>
                      ) : u.role === 'admin' ? (
                        <button onClick={() => handleChangeRole(u.id, 'user')} disabled={loadingRole}
                          className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer hover:bg-amber-500/30 border border-amber-500/30 transition-colors disabled:opacity-40 flex-shrink-0">
                          Jadikan User
                        </button>
                      ) : (
                        <button onClick={() => handleChangeRole(u.id, 'admin')} disabled={loadingRole}
                          className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer hover:bg-amber-600 transition-colors disabled:opacity-40 flex-shrink-0">
                          Jadikan Admin
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-gray-500 mt-1">Menampilkan {adminUsers.length} pengguna (halaman {memberPage} dari {memberTotalPages})</p>
            </div>
          )}

          {/* Table Header */}
          <div className="bg-[#10141f] border border-gray-700 rounded-t-xl px-3 py-2.5 flex items-center">
            <div className="flex-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Akun Pengguna</div>
            <div className="w-[100px] text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center">Saldo</div>
            <div className="w-[130px] text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center">Rekening</div>
          </div>

          {/* Member Rows */}
          <div className="flex flex-col">
            {adminUsers.length === 0 ? (
              <div className="bg-[#10141f] border border-t-0 border-gray-700 rounded-b-xl p-8 text-center">
                <p className="text-gray-500 text-sm">Tidak ada data member</p>
              </div>
            ) : (
              adminUsers.map((u, idx) => (
                <div key={u.id} className={`bg-[#10141f] border border-gray-700 border-t-0 flex items-center ${idx === adminUsers.length - 1 ? 'rounded-b-xl' : ''}`}>
                  {/* LEFT BOX: Account Info */}
                  <div
                    className="flex-1 px-3 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors border-r border-gray-700"
                    onDoubleClick={() => handleSelectMember(u.id)}
                    title="Klik 2x untuk edit"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <button
                        onClick={e => { e.stopPropagation(); handleCopyUsername(u.username); }}
                        className="text-[9px] bg-gray-700 hover:bg-gray-600 text-gray-300 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors leading-none"
                        title="Salin username"
                      >
                        📋
                      </button>
                      <span className="text-white text-xs font-bold truncate">{u.username}</span>
                      {u.role === 'admin' && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold flex-shrink-0">ADMIN</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate mb-1 ml-5">{u.email}</p>
                    <div className="flex items-center gap-1.5 ml-5">
                      {u.lastActive && isOnline(u.lastActive) ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                          <span className="text-[10px] text-green-400 font-medium">Online</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0"></span>
                          <span className="text-[10px] text-gray-400">{u.lastActive ? `Offline (${formatTimeAgo(u.lastActive)})` : 'Offline'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* MIDDLE BOX: Balance - centered */}
                  <div className="w-[100px] flex items-center justify-center border-r border-gray-700 py-3 px-1">
                    <span className="text-orange-500 text-[11px] font-bold text-center leading-tight">Rp {formatBalance(u.balance)}</span>
                  </div>

                  {/* RIGHT BOX: Bank Account + Bank Type */}
                  <div className="w-[130px] flex flex-col justify-center items-center py-3 px-1.5">
                    {u.withdrawAccounts && u.withdrawAccounts.length > 0 ? (
                      <>
                        <span className="text-[10px] text-gray-300 font-medium truncate w-full text-center">{u.withdrawAccounts[0].bankOwner}</span>
                        <span className="text-[10px] text-gray-500 truncate w-full text-center">{u.withdrawAccounts[0].accountNumber}</span>
                        <span className="text-[9px] text-orange-400/80 font-medium truncate w-full text-center">{u.withdrawAccounts[0].bankName || u.withdrawAccounts[0].cardType}</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-gray-600">-</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {memberTotalPages > 1 && (
            <div className="flex justify-end items-center mt-3 gap-2">
              <button
                onClick={() => setMemberPage(p => Math.max(1, p - 1))}
                disabled={memberPage <= 1}
                className="bg-[#10141f] border border-gray-700 text-gray-400 w-8 h-8 rounded-lg text-xs cursor-pointer hover:border-orange-500 hover:text-orange-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              >
                ‹
              </button>
              <span className="text-gray-400 text-xs font-medium">
                {memberPage} / {memberTotalPages}
              </span>
              <button
                onClick={() => setMemberPage(p => Math.min(memberTotalPages, p + 1))}
                disabled={memberPage >= memberTotalPages}
                className="bg-[#10141f] border border-gray-700 text-gray-400 w-8 h-8 rounded-lg text-xs cursor-pointer hover:border-orange-500 hover:text-orange-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              >
                ›
              </button>
            </div>
          )}

          {/* Total Info */}
          <div className="mt-2 text-right">
            <span className="text-gray-600 text-[10px]">Total: {memberTotal} pengguna</span>
          </div>

          {/* Pending Upgrade Requests */}
          {pendingUpgrades.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-bold text-sm mb-3">Permintaan Peningkatan ({pendingUpgrades.length})</h3>
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                {pendingUpgrades.map(req => (
                  <div key={req.id} className="bg-[#10141f] p-4 rounded-xl border border-orange-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{req.user?.username || 'User'}</h4>
                        <p className="text-xs text-gray-400">{req.action} - Rp {formatBalance(req.amount)} koin</p>
                      </div>
                      <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded">PENDING</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleApproveUpgrade(req.id)}
                        className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 p-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-green-500/20 transition-colors">
                        ✅ Setujui
                      </button>
                      <button onClick={() => handleRejectUpgrade(req.id)}
                        className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 p-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-red-500/20 transition-colors">
                        ❌ Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center pb-16" onClick={() => setShowDepositModal(false)}>
            <div className="bg-[#10141f] border-t border-green-500/30 rounded-t-2xl w-full max-w-md p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-green-400 font-bold text-base">💰 Deposit Saldo</h3>
                <button onClick={() => setShowDepositModal(false)} className="text-gray-400 text-lg cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>
              {/* Kotak atas: Username */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Username</label>
                <input type="text" value={dwForm.username} onChange={e => setDwForm(p => ({...p, username: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-green-500 transition-colors"
                  placeholder="Masukkan username member" />
              </div>
              {/* Kotak tengah: Nama Rekening & Nomor Rekening */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nama Rekening</label>
                <input type="text" value={dwForm.rekeningName} onChange={e => setDwForm(p => ({...p, rekeningName: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-green-500 transition-colors"
                  placeholder="Nama pemilik rekening" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nomor Rekening</label>
                <input type="text" value={dwForm.rekeningNumber} onChange={e => setDwForm(p => ({...p, rekeningNumber: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-green-500 transition-colors"
                  placeholder="Nomor rekening" />
              </div>
              {/* Kotak bawah: Saldo */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nominal Saldo</label>
                <input type="number" value={dwForm.amount} onChange={e => setDwForm(p => ({...p, amount: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-green-500 transition-colors"
                  placeholder="Masukkan nominal" />
              </div>
              <button onClick={handleAdminDeposit} disabled={loading === 'admin-deposit'}
                className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors disabled:opacity-50">
                {loading === 'admin-deposit' ? '⏳ Memproses...' : '✅ Deposit Saldo'}
              </button>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center pb-16" onClick={() => setShowWithdrawModal(false)}>
            <div className="bg-[#10141f] border-t border-green-500/30 rounded-t-2xl w-full max-w-md p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-green-400 font-bold text-base">💸 Withdraw Saldo</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 text-lg cursor-pointer bg-transparent border-none hover:text-white">✕</button>
              </div>
              {/* Kotak atas: Username */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Username</label>
                <input type="text" value={dwForm.username} onChange={e => setDwForm(p => ({...p, username: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-green-500 transition-colors"
                  placeholder="Masukkan username member" />
              </div>
              {/* Kotak tengah: Nama Rekening & Nomor Rekening */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nama Rekening</label>
                <input type="text" value={dwForm.rekeningName} onChange={e => setDwForm(p => ({...p, rekeningName: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-green-500 transition-colors"
                  placeholder="Nama pemilik rekening" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nomor Rekening</label>
                <input type="text" value={dwForm.rekeningNumber} onChange={e => setDwForm(p => ({...p, rekeningNumber: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-green-500 transition-colors"
                  placeholder="Nomor rekening" />
              </div>
              {/* Kotak bawah: Saldo */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nominal Saldo</label>
                <input type="number" value={dwForm.amount} onChange={e => setDwForm(p => ({...p, amount: e.target.value}))}
                  className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-green-500 transition-colors"
                  placeholder="Masukkan nominal" />
              </div>
              <button onClick={handleAdminWithdraw} disabled={loading === 'admin-withdraw'}
                className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors disabled:opacity-50">
                {loading === 'admin-withdraw' ? '⏳ Memproses...' : '✅ Withdraw Saldo'}
              </button>
            </div>
          </div>
        )}

        {BottomNav({ active: 'admin' })}
      </div>
    );
  };

  // ==================== SCREEN: MEMBER DETAIL ====================
  const MemberDetailScreen = () => {
    if (!selectedMember) return null;
    return (
      <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
        <header className="flex items-center justify-between p-5 sticky top-0 bg-[#050814]/90 backdrop-blur-xl z-20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('admin')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
            <h2 className="text-base font-bold text-white">Detail Member</h2>
          </div>
        </header>
        <main className="p-5 flex flex-col gap-4">
          {/* Current User Info Card */}
          <div className="bg-[#10141f] border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
                {selectedMember.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base">{selectedMember.username}</h3>
                  {selectedMember.role === 'admin' && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                </div>
                <p className="text-gray-400 text-xs mt-0.5">{selectedMember.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-gray-500">Saldo: </span>
                <span className="text-orange-500 font-bold">Rp {formatBalance(selectedMember.balance)}</span>
              </div>
              <div>
                <span className="text-gray-500">No HP: </span>
                <span className="text-gray-300">{selectedMember.phone || '-'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs mt-1">
              <div>
                <span className="text-gray-500">Status: </span>
                <span className={selectedMember.status === 'active' ? 'text-green-400' : 'text-red-400'}>{selectedMember.status}</span>
              </div>
              <div>
                <span className="text-gray-500">Terdaftar: </span>
                <span className="text-gray-300">{new Date(selectedMember.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-[#10141f] border border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
            <h4 className="text-white font-bold text-sm">Edit Data Member</h4>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Username</label>
              <input type="text" value={editForm.username} onChange={e => setEditForm(p => ({...p, username: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Kosongkan jika tidak diubah" />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Kata Sandi Baru</label>
              <input type="password" value={editForm.password} onChange={e => setEditForm(p => ({...p, password: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Kosongkan jika tidak diubah" />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Email</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({...p, email: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="email@domain.com" />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">No HP</label>
              <input type="tel" value={editForm.phone} onChange={e => setEditForm(p => ({...p, phone: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="08xxxxxxxxxx" />
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3">Data Rekening</h4>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Jenis Bank</label>
              <input type="text" value={editForm.cardType} onChange={e => setEditForm(p => ({...p, cardType: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Contoh: BCA, WISE" />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Nama Rekening</label>
              <input type="text" value={editForm.bankOwner} onChange={e => setEditForm(p => ({...p, bankOwner: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Nama pemilik rekening" />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Nomor Rekening</label>
              <input type="text" value={editForm.accountNumber} onChange={e => setEditForm(p => ({...p, accountNumber: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Nomor rekening" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 mt-2">
              <button onClick={handleUpdateMember} disabled={loading === 'update-member'}
                className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors disabled:opacity-50">
                {loading === 'update-member' ? '⏳ Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button onClick={() => handleDeleteUser(selectedMember.id)} disabled={loading === 'delete-member'}
                className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer hover:bg-red-500/20 transition-colors disabled:opacity-50">
                {loading === 'delete-member' ? '⏳ Menghapus...' : 'Hapus Akun'}
              </button>
            </div>
          </div>
        </main>
        {BottomNav({ active: 'admin' })}
      </div>
    );
  };

  // ==================== SCREEN: PROFILE ====================
  const ProfileScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
      {Header({ title: 'Profil Saya' })}
      <main className="mt-6 px-5 flex flex-col gap-4">
        {/* Profile Card */}
        <div className="bg-[#10141f] border border-gray-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 0 15px rgba(249,115,22,0.3)' }}>
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">{currentUser?.username}</h2>
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-extrabold">VIP</span>
            </div>
            <p className="text-gray-400 text-sm">Kredit: <span className="text-orange-500 font-bold">Rp {formatBalance(currentUser?.balance || 0)}</span></p>
          </div>
        </div>

        {/* Menu Groups */}
        <div className="bg-[#10141f] border border-gray-700 rounded-2xl overflow-hidden">
          <p className="px-5 pt-3 pb-1 text-gray-500 text-xs font-bold uppercase tracking-wider">Aktivasi Akun</p>
          <div onClick={() => navigate('withdraw-account')} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-gray-700/30">
            <span className="w-6 text-gray-400 text-base text-center">🪪</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Aktivasi Akun</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
        </div>

        <div className="bg-[#10141f] border border-gray-700 rounded-2xl overflow-hidden">
          <p className="px-5 pt-3 pb-1 text-gray-500 text-xs font-bold uppercase tracking-wider">Akun Saya</p>
          <div onClick={() => { setProfileDetailTitle('Akun Saya'); loadFullProfile(); navigate('profile-detail'); }} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-gray-700/30">
            <span className="w-6 text-gray-400 text-base text-center">👤</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Akun Saya</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
        </div>

        <div className="bg-[#10141f] border border-gray-700 rounded-2xl overflow-hidden">
          <p className="px-5 pt-3 pb-1 text-gray-500 text-xs font-bold uppercase tracking-wider">Umum</p>
          <div onClick={() => navigate('history')} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-gray-700/30">
            <span className="w-6 text-gray-400 text-base text-center">📋</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Manajemen Catatan</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
          <div onClick={() => navigate('asset')} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-gray-700/30">
            <span className="w-6 text-gray-400 text-base text-center">💰</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Aset Saya</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
          <div onClick={() => { loadAdminMessages(); setProfileDetailTitle('Pesan'); navigate('profile-detail'); }} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors">
            <span className="w-6 text-gray-400 text-base text-center">✉️</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Pesan</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
        </div>

        <div className="bg-[#10141f] border border-gray-700 rounded-2xl overflow-hidden">
          <p className="px-5 pt-3 pb-1 text-gray-500 text-xs font-bold uppercase tracking-wider">Ikhtisar Akun</p>
          <div onClick={() => { setProfileDetailTitle('Ringkasan Mata Uang Virtual'); navigate('profile-detail'); }} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-gray-700/30">
            <span className="w-6 text-gray-400 text-base text-center">📊</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Ringkasan Mata Uang Virtual</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
          <div onClick={() => { setProfileDetailTitle('Detail Akun'); navigate('profile-detail'); }} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-gray-700/30">
            <span className="w-6 text-gray-400 text-base text-center">📄</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Detail Akun</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
          <div onClick={() => {
            if (csLink && csLink.startsWith('http')) {
              window.open(csLink, '_blank');
            } else {
              toast({ title: 'Info', description: 'Layanan pelanggan belum tersedia. Hubungi admin.' });
            }
          }} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors">
            <span className="w-6 text-gray-400 text-base text-center">🎧</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Layanan Pelanggan</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
        </div>

        <div className="bg-[#10141f] border border-gray-700 rounded-2xl overflow-hidden">
          <p className="px-5 pt-3 pb-1 text-gray-500 text-xs font-bold uppercase tracking-wider">Keamanan Akun</p>
          <div onClick={() => { setProfileDetailTitle('Manajemen Kata Sandi'); setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); navigate('profile-detail'); }} className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors">
            <span className="w-6 text-gray-400 text-base text-center">🔑</span>
            <span className="flex-1 ml-3 text-sm font-medium text-gray-300">Manajemen Kata Sandi</span>
            <span className="text-gray-600 text-xs">›</span>
          </div>
        </div>

        <button onClick={handleLogout}
          className="bg-red-500/10 text-red-400 font-bold p-3.5 rounded-xl w-full border border-red-500/20 text-sm cursor-pointer hover:bg-red-500/20 transition-colors text-center mt-4">
          🚪 Keluar
        </button>
      </main>
      {BottomNav({ active: 'profile' })}
    </div>
  );

  // ==================== SCREEN: PROFILE DETAIL ====================
  const ProfileDetailScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
      <header className="flex items-center justify-between p-5 sticky top-0 bg-[#050814]/90 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('profile')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
          <h2 className="text-base font-bold text-white">{profileDetailTitle}</h2>
        </div>
      </header>
      {profileDetailTitle === 'Akun Saya' ? (
        <main className="p-5 flex flex-col gap-4">
          {loadingProfile ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block animate-pulse">⏳</span>
              <p className="text-gray-400 text-sm">Memuat data akun...</p>
            </div>
          ) : fullProfile ? (
            <>
              {/* Profile Header Card */}
              <div className="bg-[#10141f] border border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center font-extrabold text-3xl text-white mb-3"
                  style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}>
                  {fullProfile.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h2 className="text-xl font-bold text-white">{fullProfile.username}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {fullProfile.role === 'admin' ? (
                    <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded font-bold">ADMIN</span>
                  ) : (
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 text-[10px] px-2 py-1 rounded font-extrabold">VIP</span>
                  )}
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${fullProfile.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {fullProfile.status === 'active' ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Kredit: <span className="text-orange-500 font-bold">Rp {formatBalance(fullProfile.balance || 0)}</span></p>
              </div>

              {/* Complete Account Data */}
              <div className="bg-[#10141f] border border-gray-700 rounded-2xl overflow-hidden">
                <p className="px-5 pt-4 pb-2 text-gray-500 text-xs font-bold uppercase tracking-wider">Data Akun Lengkap</p>
                <div className="px-5 pb-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>👤</span> Username</span>
                    <span className="text-white text-sm font-semibold">{fullProfile.username}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>📧</span> Email</span>
                    <span className="text-white text-sm font-semibold break-all text-right">{fullProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>📱</span> No. HP</span>
                    <span className="text-white text-sm font-semibold">{fullProfile.phone || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>🔑</span> Kata Sandi</span>
                    <span className="text-orange-400 text-sm font-semibold font-mono">{fullProfile.password || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>💰</span> Saldo</span>
                    <span className="text-orange-500 text-sm font-bold">Rp {formatBalance(fullProfile.balance || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>🏷️</span> Kode Undangan</span>
                    <span className="text-white text-sm font-semibold">{fullProfile.inviteCode || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>👥</span> Role</span>
                    <span className="text-white text-sm font-semibold capitalize">{fullProfile.role}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>✅</span> Status</span>
                    <span className="text-white text-sm font-semibold capitalize">{fullProfile.status}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><span>📅</span> Tanggal Registrasi</span>
                    <span className="text-white text-sm font-semibold">{fullProfile.createdAt ? new Date(fullProfile.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">⚠️</span>
              <p className="text-gray-400 text-sm">Gagal memuat data akun</p>
            </div>
          )}
        </main>
      ) : profileDetailTitle === 'Pesan' ? (
        <main className="p-5 flex flex-col gap-4">
          <div className="bg-[#10141f] border border-gray-700 rounded-2xl p-5">
            <h3 className="text-white font-bold text-base mb-3">📥 Pesan</h3>
            {adminMessages.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block text-gray-600">📭</span>
                <p className="text-gray-500 text-sm">Belum ada pesan</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {adminMessages.map(m => (
                  <div key={m.id} className="bg-[#0a0e18] border border-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-200 flex-1 whitespace-pre-wrap break-words">{m.text}</p>
                      {currentUser?.role === 'admin' && (
                        <button onClick={() => handleDeleteMessage(m.id)}
                          className="text-red-400 text-xs cursor-pointer bg-transparent border-none hover:text-red-300 flex-shrink-0">
                          🗑️
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">{formatDate(m.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin-only: Add new message */}
          {currentUser?.role === 'admin' && (
            <div className="bg-[#10141f] border border-orange-500/30 rounded-2xl p-5 flex flex-col gap-3">
              <h4 className="text-orange-400 font-bold text-sm">✍️ Tulis Pesan Baru (Admin)</h4>
              <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={3}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors resize-none"
                placeholder="Tulis pesan..." />
              <button onClick={handleAddMessage} disabled={loadingMessages || !newMessage.trim()}
                className="bg-orange-500 text-white font-bold p-3 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors disabled:opacity-50">
                {loadingMessages ? '⏳ Menyimpan...' : '📢 Publikasikan Pesan'}
              </button>
            </div>
          )}
        </main>
      ) : profileDetailTitle === 'Manajemen Kata Sandi' ? (
        <main className="p-5 flex flex-col gap-4">
          <div className="bg-[#10141f] border border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-white font-bold text-base">🔑 Ubah Kata Sandi</h3>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Kata Sandi Lama</label>
              <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm(p => ({...p, oldPassword: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Masukkan kata sandi lama" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Kata Sandi Baru</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({...p, newPassword: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Minimal 6 karakter" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Konfirmasi Kata Sandi Baru</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({...p, confirmPassword: e.target.value}))}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Ulangi kata sandi baru" />
            </div>
            <button onClick={handleChangePassword} disabled={loadingPassword}
              className="bg-orange-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors disabled:opacity-50">
              {loadingPassword ? '⏳ Memproses...' : '✅ Ubah Kata Sandi'}
            </button>
          </div>
        </main>
      ) : (
        <main className="p-5 text-center text-gray-400 mt-20">
          <span className="text-5xl mb-4 block">🛠️</span>
          <p>Halaman dalam pengembangan</p>
        </main>
      )}
      {BottomNav({ active: 'profile' })}
    </div>
  );

  // ==================== SCREEN: WITHDRAW ACCOUNT ====================
  const WithdrawAccountScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('alt')}>
      <header className="flex items-center justify-between p-5 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('profile')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
          <h2 className="text-base font-bold text-white">Akun penarikan</h2>
        </div>
      </header>
      <main className="p-5 mt-8">
        {withdrawAccounts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block text-gray-600">🏦</span>
            <p className="text-gray-500 text-sm">Tidak ada data lagi!</p>
          </div>
        ) : (
          withdrawAccounts.map(acc => (
            <div key={acc.id} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-4">
              <div className="flex justify-between mb-2">
                <span className="bg-green-500/20 text-green-400 text-[11px] px-2 py-1 rounded font-bold">{acc.cardType}</span>
              </div>
              <p className="text-gray-300 text-sm mt-2.5">Pemilik: <span className="text-white font-semibold">{acc.bankOwner}</span></p>
              <p className="text-gray-300 text-sm">Bank: <span className="text-white font-semibold">{acc.bankName}</span></p>
              <p className="text-gray-300 text-sm">Nomor Rekening: <span className="text-white font-semibold">{acc.accountNumber}</span></p>
              <p className="text-gray-300 text-sm">Nomor Telepon: <span className="text-white font-semibold">{acc.phone}</span></p>
            </div>
          ))
        )}
        <button onClick={() => navigate('add-withdraw')}
          className="bg-orange-500/10 text-orange-400 border border-dashed border-orange-500 p-3.5 rounded-xl w-full text-sm font-semibold cursor-pointer hover:bg-orange-500/20 transition-colors mt-4">
          + Menambahkan akun
        </button>
      </main>
      {BottomNav({ active: 'profile' })}
    </div>
  );

  // ==================== SCREEN: ADD WITHDRAW ACCOUNT ====================
  const AddWithdrawScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('alt')}>
      <header className="flex items-center justify-between p-5 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('withdraw-account')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
          <h2 className="text-base font-bold text-white">Akun penarikan</h2>
        </div>
      </header>
      <main className="p-5 flex flex-col gap-4">
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Jenis Bank</label>
            <select value={addWithdrawForm.cardType} onChange={e => setAddWithdrawForm(p => ({...p, cardType: e.target.value, bankName: e.target.value}))}
              className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none cursor-pointer appearance-none">
              <optgroup label="E-Wallet" className="bg-[#0a0e18] text-orange-500">
                {['WISE','OVO','GOPAY','DANA','SHOPEEPAY'].map(v => <option key={v} value={v}>{v}</option>)}
              </optgroup>
              <optgroup label="Bank" className="bg-[#0a0e18] text-orange-500">
                {['Mandiri','BRI','BNI','BCA','Bank BTN','Bank Danamon','BSI','Bank Muamalat','BTPN Syariah','Bank Mega','Bank Panin','CIMB Niaga','SeaBank','Bank Jago','blu by BCA Digital','Allo Bank','Superbank'].map(v => <option key={v} value={v}>{v}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nama Pemilik Bank</label>
            <input type="text" value={addWithdrawForm.bankOwner} onChange={e => setAddWithdrawForm(p => ({...p, bankOwner: e.target.value}))}
              className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
              placeholder="Masukkan nama pemilik" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nomor Telephon</label>
            <input type="tel" value={addWithdrawForm.phone} onChange={e => setAddWithdrawForm(p => ({...p, phone: e.target.value}))}
              className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
              placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nomor Rekening</label>
            <input type="text" value={addWithdrawForm.accountNumber} onChange={e => setAddWithdrawForm(p => ({...p, accountNumber: e.target.value}))}
              className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
              placeholder="Masukkan nomor rekening" />
          </div>
          <button onClick={handleAddWithdraw} disabled={loading === 'add-withdraw'}
            className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors disabled:opacity-50 mt-2">
            {loading === 'add-withdraw' ? '⏳ Memproses...' : 'Kirim'}
          </button>
        </div>
      </main>
      {BottomNav({ active: 'profile' })}
    </div>
  );

  // ==================== SCREEN: ASSET (with DEPOSIT & LIST buttons) ====================
  const AssetScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('alt')}>
      <header className="flex items-center justify-between p-5 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('profile')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
          <h2 className="text-base font-bold text-white">Aset Saya</h2>
        </div>
      </header>
      <main className="p-5 mt-4">
        <div className="text-center py-8">
          <h1 className="text-4xl font-extrabold text-white">
            Aktivasi <span className="text-orange-500">Rp {formatBalance(currentUser?.balance || 0)}</span>
          </h1>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-3 mt-6 justify-center">
          <button onClick={() => navigate('withdraw-account')}
            className="bg-orange-500/10 text-orange-400 border border-dashed border-orange-500 p-3.5 rounded-xl flex-1 max-w-[200px] text-sm font-semibold cursor-pointer hover:bg-orange-500/20 transition-colors">
            🪪 Aktivasi Akun
          </button>
          <button onClick={() => { const acc = withdrawAccounts[0]; if(acc) { navigate('withdraw-money'); } else { toast({ title: 'Error', description: 'Anda harus mendaftarkan akun penarikan terlebih dahulu!', variant: 'destructive' }); navigate('withdraw-account'); }}}
            className="bg-green-500/10 text-green-400 border border-dashed border-green-500 p-3.5 rounded-xl flex-1 max-w-[200px] text-sm font-semibold cursor-pointer hover:bg-green-500/20 transition-colors">
            💵 Menarik
          </button>
        </div>

        {/* DEPOSIT & LIST Buttons */}
        <div className="flex gap-3 mt-3 justify-center">
          <button onClick={() => navigate('deposit')}
            className="bg-blue-500/10 text-blue-400 border border-dashed border-blue-500 p-3.5 rounded-xl flex-1 max-w-[200px] text-sm font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors">
            💳 DEPOSIT
          </button>
          <button onClick={() => navigate('list')}
            className="bg-purple-500/10 text-purple-400 border border-dashed border-purple-500 p-3.5 rounded-xl flex-1 max-w-[200px] text-sm font-semibold cursor-pointer hover:bg-purple-500/20 transition-colors">
            📜 LIST
          </button>
        </div>

        {/* Account Assets */}
        <div className="mt-10 bg-slate-900/80 border border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-400 font-bold text-sm mb-4">Aset akun</h3>
          <div className="bg-[#0a0e18] p-5 rounded-xl">
            <p className="text-3xl font-extrabold text-white">Rp {formatBalance(currentUser?.balance || 0)}</p>
          </div>
        </div>
      </main>
      {BottomNav({ active: 'profile' })}
    </div>
  );

  // ==================== SCREEN: DEPOSIT ====================
  const DepositScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('alt')}>
      <header className="flex items-center justify-between p-5 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('asset')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
          <h2 className="text-base font-bold text-white">Deposit</h2>
        </div>
      </header>
      <main className="p-5 flex flex-col gap-4">
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <div className="text-center">
            <span className="text-4xl block mb-3">💳</span>
            <h3 className="text-white font-bold text-lg">Deposit Saldo</h3>
            <p className="text-gray-400 text-xs mt-1">Tambahkan saldo ke akun Anda</p>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Metode Pembayaran</label>
            <select value={depositMethod} onChange={e => setDepositMethod(e.target.value)}
              className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none cursor-pointer appearance-none">
              <option value="bank">Transfer Bank</option>
              <option value="ewallet">E-Wallet</option>
              <option value="qris">QRIS</option>
            </select>
          </div>

          {/* Bank Tujuan Section */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Bank Tujuan</label>
            <div
              onClick={() => setShowBankDest(!showBankDest)}
              className="bg-[#0a0e18] border border-orange-500/40 rounded-xl p-3 cursor-pointer hover:border-orange-500 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-orange-400 text-sm">🏦</span>
                {bankDestList.length > 0 ? (
                  <div className="flex-1">
                    <span className="text-white text-xs font-semibold">{bankDestList[0].bankType} - {bankDestList[0].bankName}</span>
                    <p className="text-[10px] text-gray-500">{bankDestList[0].accountNumber}</p>
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs">Klik untuk melihat bank tujuan</span>
                )}
              </div>
              <span className="text-gray-500 text-xs">{showBankDest ? '▲' : '▼'}</span>
            </div>
            {showBankDest && (
              <div className="mt-2 bg-[#0a0e18] border border-gray-700 rounded-xl p-3 flex flex-col gap-2">
                {bankDestList.length > 0 ? (
                  bankDestList.map(bank => (
                    <div key={bank.id} className="bg-[#10141f] border border-gray-700 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">{bank.bankType}</span>
                        <span className="text-white text-xs font-semibold">{bank.bankName}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">No. Rekening: <span className="text-white font-medium">{bank.accountNumber}</span></p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs text-center py-2">Belum ada bank tujuan yang terdaftar</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Jumlah Deposit</label>
            <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
              className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
              placeholder="Masukkan jumlah deposit" min="10000" />
            <p className="text-[10px] text-gray-500 mt-1">Minimal deposit Rp 10.000</p>
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {['50000', '100000', '500000', '1000000', '5000000', '10000000'].map(amt => (
              <button key={amt} onClick={() => setDepositAmount(amt)}
                className="bg-[#0a0e18] border border-gray-700 text-gray-300 p-2 rounded-lg text-xs font-semibold cursor-pointer hover:border-orange-500 hover:text-orange-400 transition-colors">
                Rp {parseFloat(amt).toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          {depositAmount && (
            <div className="bg-[#0a0e18] p-4 rounded-xl border border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Jumlah</span>
                <span className="text-white font-semibold">Rp {parseFloat(depositAmount).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">Biaya Admin</span>
                <span className="text-green-400 font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-700">
                <span className="text-gray-400">Total</span>
                <span className="text-orange-500 font-bold">Rp {parseFloat(depositAmount).toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          <button onClick={() => {
            const amount = parseFloat(depositAmount);
            if (!amount || amount < 10000) {
              toast({ title: 'Error', description: 'Minimal deposit Rp 10.000!', variant: 'destructive' });
              return;
            }
            toast({ title: 'Info', description: 'Deposit sedang diproses. Silakan hubungi admin untuk konfirmasi pembayaran.' });
          }}
            className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors">
            Kirim Permintaan Deposit
          </button>
        </div>
      </main>
      {BottomNav({ active: 'profile' })}
    </div>
  );

  // ==================== SCREEN: LIST (Upgrade Requests) ====================
  const ListScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('alt')}>
      <header className="flex items-center justify-between p-5 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('asset')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
          <h2 className="text-base font-bold text-white">List Permintaan</h2>
        </div>
      </header>
      <main className="p-5 flex flex-col gap-3">
        <div className="text-center mb-4">
          <span className="text-4xl block mb-3">📜</span>
          <h3 className="text-white font-bold text-lg">Riwayat Permintaan</h3>
          <p className="text-gray-400 text-xs mt-1">Daftar permintaan peningkatan Anda</p>
        </div>

        {/* Balance info */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Saldo Saat Ini</span>
            <span className="text-orange-500 font-bold text-lg">Rp {formatBalance(currentUser?.balance || 0)}</span>
          </div>
        </div>

        {pendingUpgrades.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block text-gray-600">📋</span>
            <p className="text-gray-500 text-sm">Belum ada permintaan</p>
          </div>
        ) : (
          pendingUpgrades.map(req => (
            <div key={req.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-white font-bold text-sm">{req.action}</h4>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(req.createdAt)}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                  req.status === 'pending' ? 'bg-orange-500/10 text-orange-400' :
                  req.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {req.status === 'pending' ? 'MENUNGGU' : req.status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                </span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-700/50">
                <span className="text-gray-400 text-xs">Jumlah Koin</span>
                <span className="text-orange-500 font-semibold text-sm">Rp {formatBalance(req.amount)}</span>
              </div>
            </div>
          ))
        )}
      </main>
      {BottomNav({ active: 'profile' })}
    </div>
  );

  // ==================== SCREEN: WITHDRAW MONEY ====================
  const WithdrawMoneyScreen = () => {
    const myAccount = withdrawAccounts[0];
    return (
      <div className="pb-20 min-h-screen" style={getBackgroundStyle('alt')}>
        <header className="flex items-center justify-between p-5 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('asset')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
            <h2 className="text-base font-bold text-white">Tarik uang</h2>
          </div>
        </header>
        <main className="p-5 flex flex-col gap-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Akun penarikan</label>
              <input type="text" value={myAccount ? `${myAccount.cardType} ${myAccount.accountNumber}` : 'Belum ada akun'} readOnly
                className="bg-gray-800 text-gray-400 p-3 rounded-xl w-full text-sm cursor-not-allowed border border-gray-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Jumlah penarikan</label>
              <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                className="bg-[#0a0e18] border border-gray-600 text-white p-3 rounded-xl w-full text-sm outline-none focus:border-orange-500 transition-colors"
                placeholder="Masukkan jumlah" min="10000" />
              <p className="text-[10px] text-gray-500 mt-1">Minimal penarikan Rp 10.000</p>
            </div>
            <button onClick={handleWithdrawMoney} disabled={loading === 'withdraw-money'}
              className="bg-green-500 text-white font-bold p-3.5 rounded-xl w-full text-sm cursor-pointer shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors disabled:opacity-50 mt-2">
              {loading === 'withdraw-money' ? '⏳ Memproses...' : 'Kirim'}
            </button>
          </div>
        </main>
        {BottomNav({ active: 'profile' })}
      </div>
    );
  };

  // ==================== SCREEN: HISTORY ====================
  const HistoryScreen = () => (
    <div className="pb-20 min-h-screen" style={getBackgroundStyle('main')}>
      <header className="flex items-center justify-between p-5 sticky top-0 bg-[#050814]/90 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('profile')} className="text-white text-lg cursor-pointer bg-transparent border-none">←</button>
          <h2 className="text-base font-bold text-white">Manajemen Catatan</h2>
        </div>
      </header>
      <main className="p-5 mt-4">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block text-gray-600">🧾</span>
            <p className="text-gray-500 text-sm">Belum ada catatan transaksi</p>
          </div>
        ) : (
          transactions.map(t => {
            const isCredit = t.type === 'credit';
            return (
              <div key={t.id} className="flex items-center gap-4 py-4 border-b border-gray-700/50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${isCredit ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isCredit ? '↓' : '↑'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{t.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{formatDate(t.date)}</p>
                </div>
                <div className={`text-sm font-bold text-right ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                  {isCredit ? '+' : '-'} Rp {formatBalance(t.amount)}
                </div>
              </div>
            );
          })
        )}
      </main>
      {BottomNav({ active: 'profile' })}
    </div>
  );

  // ==================== RENDER ====================
  // NOTE: Screen components are called as functions (not <Component />)
  // to prevent React from unmounting/remounting on every parent re-render.
  // When defined inside the parent, each render creates a new function ref;
  // React would see a different component type and destroy the old instance.
  const renderScreen = () => {
    switch (screen) {
      case 'auth': return AuthScreen();
      case 'dashboard': return DashboardScreen();
      case 'promosi': return PromosiScreen();
      case 'event': return EventScreen();
      case 'event-detail': return EventDetailScreen();
      case 'upgrade': return UpgradeScreen();
      case 'admin': return AdminScreen();
      case 'member-detail': return MemberDetailScreen();
      case 'profile': return ProfileScreen();
      case 'profile-detail': return ProfileDetailScreen();
      case 'withdraw-account': return WithdrawAccountScreen();
      case 'add-withdraw': return AddWithdrawScreen();
      case 'asset': return AssetScreen();
      case 'deposit': return DepositScreen();
      case 'list': return ListScreen();
      case 'withdraw-money': return WithdrawMoneyScreen();
      case 'history': return HistoryScreen();
      default: return AuthScreen();
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      {renderScreen()}
    </div>
  );
}