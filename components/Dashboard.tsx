
import React, { useState, useRef } from 'react';
import type { User, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { ArrowLeftOnRectangleIcon, ChartBarIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, UserGroupIcon, CameraIcon, XMarkIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';

interface DashboardProps {
  navigate: (page: Page) => void;
  onLogout: () => void;
  currentUser: User;
  ads: Ad[];
  settings?: AppSettings;
  actions?: any;
  onUpdateUser?: (data: Partial<User>) => void;
  notificationCounts?: {
      predictions: number;
      forum: number;
      contact: number;
      info: number;
  };
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  page: Page;
  colorClass: string;
  count?: number; 
  badgeColor?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ navigate, onLogout, currentUser, ads, settings, actions, onUpdateUser, notificationCounts }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems: MenuItem[] = [
    { 
      label: 'PRONOSTICS', 
      icon: ChartBarIcon, 
      page: Page.PREDICTIONS, 
      colorClass: 'bg-emerald-500 hover:bg-emerald-600',
      count: notificationCounts?.predictions,
      badgeColor: 'bg-red-500'
    },
    { 
      label: 'CLASSEMENT', 
      icon: UserGroupIcon, 
      page: Page.LEADERBOARD, 
      colorClass: 'bg-amber-500 hover:bg-amber-600'
    },
    { 
      label: 'RÈGLEMENT', 
      icon: ClipboardDocumentListIcon, 
      page: Page.RULES, 
      colorClass: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      label: 'INFORMATIONS', 
      icon: InformationCircleIcon, 
      page: Page.INFORMATION, 
      colorClass: 'bg-cyan-500 hover:bg-cyan-600',
      count: notificationCounts?.info,
      badgeColor: 'bg-yellow-500'
    },
    { 
      label: 'FORUM', 
      icon: ChatBubbleLeftRightIcon, 
      page: Page.FORUM, 
      colorClass: 'bg-purple-500 hover:bg-purple-600',
      count: notificationCounts?.forum,
      badgeColor: 'bg-blue-500'
    },
    { 
      label: 'CONTACT', 
      icon: QuestionMarkCircleIcon, 
      page: Page.CONTACT, 
      colorClass: 'bg-pink-500 hover:bg-pink-600',
      count: notificationCounts?.contact,
      badgeColor: 'bg-green-500'
    },
    { 
      label: 'À PROPOS', 
      icon: GlobeAltIcon, 
      page: Page.ABOUT, 
      colorClass: 'bg-indigo-500 hover:bg-indigo-600'
    },
    { 
      label: 'CONFIDENTIALITÉ', 
      icon: ShieldCheckIcon, 
      page: Page.PRIVACY, 
      colorClass: 'bg-slate-600 hover:bg-slate-700'
    },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            alert("L'image est trop lourde (max 2Mo).");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedImage || !actions || !onUpdateUser) return;
    setSaving(true);
    try {
        await actions.updateUserProfile(currentUser.id, selectedImage);
        onUpdateUser({ profilePictureUrl: selectedImage });
        setIsProfileModalOpen(false);
        setSelectedImage(null);
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la mise à jour.");
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 p-4 shadow-lg border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black text-yellow-400 uppercase tracking-wider">
            Prediction Foot
          </h1>
          <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 flex flex-col items-center">
        <AdBanner pageName="home" settings={settings} className="mb-6" />

        <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-700 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-20"></div>
           
           <div className="relative flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                  <img 
                    src={currentUser.profilePictureUrl} 
                    alt="Profil" 
                    className="w-24 h-24 rounded-full border-4 border-gray-900 shadow-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CameraIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-yellow-400 p-1.5 rounded-full text-gray-900 shadow-sm border-2 border-gray-900">
                      <CameraIcon className="w-3 h-3" />
                  </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-white">{currentUser.name}</h2>
              <div className="flex items-center space-x-2 mt-2">
                 <img 
                    src={`https://flagcdn.com/w20/${currentUser.country.code}.png`} 
                    alt={currentUser.country.name}
                    className="w-5 h-auto rounded-sm shadow-sm"
                 />
                 <span className="text-gray-400 font-medium">{currentUser.country.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{currentUser.email}</p>
              
              <div className="mt-6 flex justify-center w-full border-t border-gray-700 pt-4">
                  <button onClick={() => navigate(Page.LEADERBOARD)} className="flex flex-col items-center px-6 border-r border-gray-700 hover:bg-gray-700/50 rounded transition">
                      <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">Classement</span>
                      <span className="text-xl font-black text-yellow-500">Voir</span>
                  </button>
                  <button onClick={() => navigate(Page.LEADERBOARD)} className="flex flex-col items-center px-6 hover:bg-gray-700/50 rounded transition">
                      <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">Points</span>
                      <span className="text-xl font-black text-white">?</span>
                  </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl">
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    onClick={() => navigate(item.page)}
                    className={`${item.colorClass} relative p-4 rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center group h-32 overflow-hidden`}
                >
                    {/* Effet de brillance */}
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-10 rounded-full blur-xl transform group-hover:scale-150 transition-transform"></div>

                    {item.count !== undefined && item.count > 0 && (
                        <div className={`absolute top-2 right-2 ${item.badgeColor || 'bg-red-500'} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-bounce z-10`}>
                            {item.count}
                        </div>
                    )}
                    <item.icon className="w-10 h-10 text-white mb-2 drop-shadow-md group-hover:scale-110 transition-transform relative z-10" />
                    <span className="text-white font-bold text-xs uppercase tracking-wider text-center relative z-10">{item.label}</span>
                </button>
            ))}
        </div>

        <div className="mt-8 w-full max-w-4xl">
            <AdCarousel ads={ads} />
        </div>
      </main>

      {/* Profile Modal */}
      {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white">Modifier ma photo</h3>
                      <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                          <XMarkIcon className="w-6 h-6" />
                      </button>
                  </div>

                  <div className="flex flex-col items-center mb-6">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 mb-4 bg-gray-900 relative shadow-inner">
                          <img 
                              src={selectedImage || currentUser.profilePictureUrl} 
                              alt="New Profile" 
                              className="w-full h-full object-cover"
                          />
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-yellow-400 font-bold hover:text-yellow-300 uppercase tracking-wide"
                      >
                          Choisir une photo
                      </button>
                      <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden" 
                          accept="image/*"
                      />
                  </div>

                  <button 
                      onClick={handleSaveProfile}
                      disabled={!selectedImage || saving}
                      className="w-full py-3 bg-green-500 text-white font-black uppercase rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform active:scale-95"
                  >
                      {saving ? "Sauvegarde..." : "Enregistrer"}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
