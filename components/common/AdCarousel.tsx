import React from 'react';
import type { Ad } from '../../types';

interface AdCarouselProps {
  ads: Ad[];
}

export const AdCarousel: React.FC<AdCarouselProps> = ({ ads }) => {
  const duplicatedAds = [...ads, ...ads]; // Duplicate for seamless loop

  return (
    <div className="w-full overflow-hidden relative py-4 bg-gray-800/50">
      <div className="animate-scroll flex space-x-4">
        {duplicatedAds.map((ad, index) => (
          <a href={ad.url} key={`${ad.id}-${index}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-64 bg-gray-700 rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300">
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
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </div>
  );
};