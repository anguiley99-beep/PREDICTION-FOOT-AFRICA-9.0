
import React from 'react';
import type { Ad } from '../../types';

interface AdCarouselProps {
  ads: Ad[];
}

export const AdCarousel: React.FC<AdCarouselProps> = ({ ads }) => {
  if (!ads || ads.length === 0) return null;

  // On duplique la liste pour permettre un défilement infini sans coupure (boucle parfaite)
  const duplicatedAds = [...ads, ...ads]; 

  // Durée de l'animation ajustée en fonction du nombre de pubs
  // Environ 3 à 4 secondes par pub pour laisser le temps de lire
  const duration = Math.max(15, ads.length * 4);

  return (
    <div className="w-full overflow-hidden relative py-4 bg-gray-800/50">
      {/* 
        w-max est essentiel ici : il force le conteneur à s'élargir selon son contenu total.
        Sans cela, l'animation se basait sur la largeur de l'écran, coupant le défilement prématurément.
      */}
      <div 
        className="flex space-x-4 w-max animate-scroll"
        style={{ animationDuration: `${duration}s` }}
      >
        {duplicatedAds.map((ad, index) => (
          <a 
            href={ad.url} 
            key={`${ad.id}-${index}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-shrink-0 w-64 bg-gray-700 rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300 block"
          >
            <img src={ad.imageUrl} alt={ad.name} className="w-full h-32 object-cover" />
            <div className="p-3">
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-yellow-400">{ad.name}</h3>
              <p className="text-lg font-bold text-yellow-400">{ad.price}</p>
            </div>
          </a>
        ))}
      </div>
       <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* Défile de la moitié (la longueur de la liste originale) puis reset */
        }
        .animate-scroll {
          animation-name: scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        /* Pause au survol pour permettre le clic */
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};