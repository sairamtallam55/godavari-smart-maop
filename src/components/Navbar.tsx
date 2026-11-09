import React, { useState } from 'react';
import {
  MapPin,
  Menu,
  X,
  ShieldCheck,
  User,
  Globe,
  Bell,
  Sparkles,
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  unreadAnnouncementsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  language,
  onLanguageChange,
  role,
  onRoleChange,
  unreadAnnouncementsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const navLinks = [
    { id: 'home', label: t.navHome },
    { id: 'map', label: 'GIS Map' },
    { id: 'nearby', label: 'Nearby' },
    { id: 'directory', label: 'Directory' },
    { id: 'ai-search', label: 'AI Search' },
    { id: 'assistant', label: 'Assistant' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Top Banner Notice: Strict Demo Separation */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-teal-400">GODAVARI PUSHKARALU 2027</span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="text-amber-300 font-semibold hidden sm:inline">
            DEMO DATA — NOT OFFICIAL — NOT LIVE
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[10px]">
          <span>Rajamahendravaram & Kovvur</span>
          <span>·</span>
          <span className="text-teal-400 font-bold">Helpline: 108 / 100</span>
        </div>
      </div>

      {/* Strict 3-Zone Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 hover:opacity-90 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
          <span>Godavari SmartMap</span>
        </button>

        {/* Zone 2: Single-line Text Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === link.id
                  ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 font-bold'
                  : ''
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Controls (Language, Role Switcher, Announcements, PWA Install) */}
        <div className="flex items-center gap-3 shrink-0">
          <PWAInstallButton />

          {/* Announcements Notification Trigger */}
          <button
            onClick={() => onNavigate('announcements')}
            className="relative p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Public Announcements"
          >
            <Bell className="w-4 h-4" />
            {unreadAnnouncementsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            {(['en', 'te', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  language === lang
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'te' ? 'తె' : 'हि'}
              </button>
            ))}
          </div>

          {/* Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => onRoleChange('pilgrim')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                role === 'pilgrim'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Pilgrim
            </button>
            <button
              onClick={() => {
                onRoleChange('operator');
                onNavigate('operator');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                role === 'operator'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Operator
            </button>
            <button
              onClick={() => {
                onRoleChange('admin');
                onNavigate('admin');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                role === 'admin'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-left ${
                  activeTab === link.id
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('feedback');
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-lg text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.navFeedback}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Switch Role:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onRoleChange('pilgrim');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1 rounded text-xs ${role === 'pilgrim' ? 'bg-teal-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
              >
                Pilgrim
              </button>
              <button
                onClick={() => {
                  onRoleChange('operator');
                  onNavigate('operator');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1 rounded text-xs ${role === 'operator' ? 'bg-teal-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
              >
                Operator
              </button>
              <button
                onClick={() => {
                  onRoleChange('admin');
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1 rounded text-xs ${role === 'admin' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
