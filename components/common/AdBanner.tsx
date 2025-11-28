
import React, { useEffect, useState } from 'react';
import type { AppSettings } from '../../types';

interface AdBannerProps {
  pageName: keyof AppSettings['adSenseSlots'];
  settings?: AppSettings;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ pageName, settings, className = "" }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Valeurs par défaut si settings n'est pas encore chargé
  const clientId = settings?.adSenseClientId || "";
  const slotId = settings?.adSenseSlots[pageName] || "";
  const isConfigured = clientId && clientId !== 'ca-pub-XXXXXXXXXXXXXXXX' && slotId;

  useEffect(() => {
    // Injection dynamique du script Google AdSense si un ID Client est présent
    if (clientId && clientId !== 'ca-pub-XXXXXXXXXXXXXXXX') {
        const existingScript = document.getElementById('adsense-script');
        
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'adsense-script';
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
            script.async = true;
            script.crossOrigin = "anonymous";
            script.onload = () => setIsScriptLoaded(true);
            document.head.appendChild(script);
        } else {
            setIsScriptLoaded(true);
        }
    }
  }, [clientId]);

  useEffect(() => {
    // Initialisation du push adsbygoogle
    if (isConfigured && isScriptLoaded) {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err: any) {
            // Ignorer l'erreur si le push a déjà été fait ou si l'environnement bloque (AdBlock)
            console.debug("AdSense push:", err ? err.message : "Unknown");
        }
    }
  }, [isConfigured, isScriptLoaded, pageName]);

  // Si non configuré, ne rien afficher (ou un placeholder en dev si besoin)
  if (!isConfigured) {
      return null;
  }

  return (
    <div className={`w-full flex justify-center my-4 overflow-hidden ${className}`}>
        {/* Conteneur AdSense */}
        <div className="text-center w-full" style={{ minHeight: '90px' }}>
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={clientId}
                data-ad-slot={slotId}
                data-ad-format="auto"
                data-full-width-responsive="true">
            </ins>
        </div>
    </div>
  );
};
