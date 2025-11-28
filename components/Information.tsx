
import React from 'react';
import type { User, Info, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface InformationProps {
  navigate: (page: Page) => void;
  currentUser: User;
  info: Info[];
  ads: Ad[];
  settings?: AppSettings;
}

export const Information: React.FC<InformationProps> = ({ navigate, currentUser, info, ads, settings }) => {
  const getInfo = (slotId: string) => info.find(i => i.id === slotId);
  const slot1 = getInfo('info_slot_1');
  const slot2 = getInfo('info_slot_2');

  const InfoCard = ({ item, index }: { item?: Info, index: number }) => {
      if (!item) {
          return (
              <div className="bg-gray-800 rounded-2xl p-8 border-2 border-gray-700 border-dashed flex flex-col items-center justify-center text-center min-h-[320px]">
                  <div className="bg-gray-700/50 p-4 rounded-full mb-4">
                    <InformationCircleIcon className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Emplacement N°{index}</h3>
                  <p className="text-gray-500 mt-2 text-sm">Aucune information disponible pour le moment.</p>
              </div>
          );
      }

      return (
          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700 flex flex-col h-full hover:border-yellow-500/30 transition-all duration-300 group">
              <div className="h-56 sm:h-64 w-full relative bg-gray-900 overflow-hidden">
                   <img 
                        src={item.imageUrl} 
                        alt="Info" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wide mb-2">
                            Actualité {index}
                        </span>
                    </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                  <div className="prose prose-invert max-w-none flex-grow">
                      <p className="whitespace-pre-wrap text-gray-200 leading-relaxed text-base font-medium">{item.text}</p>
                  </div>
                  {item.timestamp && (
                      <div className="mt-6 pt-4 text-xs text-gray-500 flex items-center border-t border-gray-700">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Mis à jour le {new Date(item.timestamp).toLocaleDateString('fr-FR')}
                      </div>
                  )}
              </div>
          </div>
      )
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header title="Informations" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <AdBanner pageName="info" settings={settings} className="mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <InfoCard item={slot1} index={1} />
            <InfoCard item={slot2} index={2} />
        </div>

        <div className="my-8">
          <AdCarousel ads={ads} />
        </div>
      </main>
    </div>
  );
};
