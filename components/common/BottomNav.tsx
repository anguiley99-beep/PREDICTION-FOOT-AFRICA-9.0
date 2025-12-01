import React from 'react';
import { Page } from '../../App';
import { HomeIcon, ChartBarIcon, TrophyIcon, ChatBubbleLeftRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, ChartBarIcon as ChartSolid, TrophyIcon as TrophySolid, ChatBubbleLeftRightIcon as ChatSolid, EnvelopeIcon as EnvelopeSolid } from '@heroicons/react/24/solid';

interface BottomNavProps {
  currentPage: Page;
  navigate: (page: Page) => void;
  notifications?: { predictions: number; forum: number; contact: number };
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, navigate, notifications }) => {
  const tabs = [
    { page: Page.DASHBOARD, label: 'Accueil', icon: HomeIcon, activeIcon: HomeSolid },
    { page: Page.PREDICTIONS, label: 'Pronos', icon: ChartBarIcon, activeIcon: ChartSolid, badge: notifications?.predictions },
    { page: Page.LEADERBOARD, label: 'Top', icon: TrophyIcon, activeIcon: TrophySolid },
    { page: Page.FORUM, label: 'Forum', icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid, badge: notifications?.forum },
    { page: Page.CONTACT, label: 'Contact', icon: EnvelopeIcon, activeIcon: EnvelopeSolid, badge: notifications?.contact },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-[env(safe-area-inset-bottom)] z-50 shadow-2xl">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = isActive ? tab.activeIcon : tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.page)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${isActive ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className="relative">
                <Icon className="w-6 h-6 transition-transform duration-200 active:scale-90" />
                {tab.badge && tab.badge > 0 && (
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-gray-900"></span>
                   </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};