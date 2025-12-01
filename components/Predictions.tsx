

import React, { useState, useEffect, useMemo } from 'react';
import type { User, Match, Prediction, PredictionValue, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { CheckIcon, ClockIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface PredictionsProps {
  navigate: (page: Page) => void;
  currentUser: User;
  matches: Match[];
  predictions: Prediction[];
  onSubmit: (predictions: Prediction[]) => Promise<void>;
  ads: Ad[];
  settings?: AppSettings;
}

const getPointsForPrediction = (prediction: PredictionValue, match: Match): number | null => {
    if (!match.result) return null;
    const { homeScore, awayScore } = match.result;
    
    let actualResult: '1' | 'X' | '2';
    if (homeScore > awayScore) actualResult = '1';
    else if (homeScore < awayScore) actualResult = '2';
    else actualResult = 'X';

    switch (prediction) {
        case '1': return actualResult === '1' ? 3 : 0;
        case '2': return actualResult === '2' ? 3 : 0;
        case 'X': return actualResult === 'X' ? 2 : 0;
        case '1X': return actualResult === '1' || actualResult === 'X' ? 1 : 0;
        case 'X2': return actualResult === 'X' || actualResult === '2' ? 1 : 0;
        default: return 0;
    }
}

export const Predictions: React.FC<PredictionsProps> = ({ navigate, currentUser, matches, predictions, onSubmit, ads, settings }) => {
  const [localPredictions, setLocalPredictions] = useState<Record<string, PredictionValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [canCloseAd, setCanCloseAd] = useState(false);

  const gridMatches = useMemo(() => {
    return [...matches]
        .sort((a, b) => (a.betNumber || 999) - (b.betNumber || 999))
        .slice(0, 10);
  }, [matches]);

  useEffect(() => {
      const userPreds = predictions.filter(p => p.userId === currentUser.id);
      const predMap = userPreds.reduce((acc, p) => ({ ...acc, [p.matchId]: p.prediction }), {});
      setLocalPredictions(predMap);
  }, [predictions, currentUser.id]);
  
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Timer pour le bouton de fermeture de la pub
  useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      if (showAdModal) {
          setCanCloseAd(false);
          timer = setTimeout(() => {
              setCanCloseAd(true);
          }, 3000); // 3 secondes d'attente avant de pouvoir fermer
      }
      return () => clearTimeout(timer);
  }, [showAdModal]);

  const isMatchLocked = (match: Match): boolean => {
    if (match.result) return true;
    const matchDate = new Date(match.date);
    const now = new Date();
    const lockTime = new Date(matchDate.getTime() - (60 * 60 * 1000)); 
    return now >= lockTime;
  };

  const handlePredictionChange = (matchId: string, value: PredictionValue) => {
    setLocalPredictions(prev => ({ ...prev, [matchId]: value }));
  };

  // 1ère étape : Ouvre la pub
  const handleInitialSubmit = () => {
      // Si aucune pub interstitielle configurée, on soumet direct
      if (!settings?.adSenseSlots?.interstitial) {
          handleFinalSubmit();
          return;
      }
      setShowAdModal(true);
  };

  // 2ème étape : Soumission réelle après la pub
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setShowAdModal(false);
    setIsSubmitting(true);

    const validPredictions: Prediction[] = [];
    
    Object.entries(localPredictions).forEach(([matchId, prediction]) => {
        const match = gridMatches.find(m => m.id === matchId);
        if (match && !isMatchLocked(match)) {
            validPredictions.push({
                userId: currentUser.id,
                userName: currentUser.name,
                matchId,
                matchBetNumber: match.betNumber,
                matchLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
                prediction: prediction as PredictionValue,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    try {
        await onSubmit(validPredictions);
        alert('Vos pronostics pour la grille de 10 matchs ont été envoyés avec succès !');
        navigate(Page.DASHBOARD);
    } catch (e) {
        console.error(e);
        alert('Erreur lors de la sauvegarde.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const PredictionSelector: React.FC<{ match: Match }> = ({ match }) => {
    const options: PredictionValue[] = ['1', 'X', '2', '1X', 'X2'];
    const locked = isMatchLocked(match);
    const currentPrediction = localPredictions[match.id];

    return (
      <div className="flex justify-between items-center bg-gray-900 p-2 rounded-lg mt-4">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => !locked && handlePredictionChange(match.id, opt)}
            disabled={locked}
            className={`w-10 h-10 sm:w-12 sm:h-12 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center ${
              currentPrediction === opt 
                ? 'bg-yellow-500 text-gray-900 shadow-lg transform scale-110' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
            } ${locked ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  };
  
  const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
      const locked = isMatchLocked(match);
      const userPrediction = localPredictions[match.id];
      const resultPoints = userPrediction && match.result ? getPointsForPrediction(userPrediction, match) : null;
      const isWin = resultPoints !== null && resultPoints > 0;

      return (
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden relative group hover:border-gray-600 transition-all">
              <div className={`h-1.5 w-full ${match.result ? 'bg-gray-600' : (locked ? 'bg-red-500' : 'bg-green-500')}`}></div>
              
              <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                          <span className="text-yellow-500 font-black text-lg">#{match.betNumber}</span>
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{new Date(match.date).toLocaleDateString('fr-FR')} • {new Date(match.date).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      {match.result ? (
                          <div className={`px-2 py-1 rounded text-xs font-black uppercase flex items-center ${isWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {isWin ? (
                                <>
                                    <CheckIcon className="w-4 h-4 mr-1" />
                                    +{resultPoints} pts
                                </>
                              ) : 'Perdu'}
                          </div>
                      ) : (
                           locked ? 
                           <div className="flex items-center text-red-500 text-xs font-bold uppercase"><LockClosedIcon className="w-4 h-4 mr-1" /> Fermé</div> 
                           : <div className="flex items-center text-green-500 text-xs font-bold uppercase"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div> Ouvert</div>
                      )}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col items-center w-1/3 text-center group-hover:scale-105 transition-transform duration-300">
                          <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="w-14 h-14 object-contain mb-2 drop-shadow-lg" />
                          <span className="font-bold text-white text-xs leading-tight">{match.homeTeam.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-gray-600">VS</span>
                          {match.result && (
                              <div className="mt-1 bg-gray-900 px-2 py-0.5 rounded border border-gray-700 text-white font-mono font-bold tracking-widest text-sm">
                                  {match.result.homeScore} - {match.result.awayScore}
                              </div>
                          )}
                      </div>

                      <div className="flex flex-col items-center w-1/3 text-center group-hover:scale-105 transition-transform duration-300">
                          <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="w-14 h-14 object-contain mb-2 drop-shadow-lg" />
                          <span className="font-bold text-white text-xs leading-tight">{match.awayTeam.name}</span>
                      </div>
                  </div>

                   {match.competition && (
                        <div className="text-center mb-2">
                             <span className="text-[10px] uppercase text-gray-500 font-bold bg-gray-900/50 px-2 py-0.5 rounded-full">{match.competition}</span>
                        </div>
                   )}

                  <PredictionSelector match={match} />
              </div>
          </div>
      );
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header title="Grille du Jour" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      
      <main className="flex-grow container mx-auto p-2 md:p-4 pb-24">
        <AdBanner pageName="predictions" settings={settings} className="mb-4" />
        
        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 mb-6 rounded-r-lg shadow-sm">
            <div className="flex items-start">
                <ClockIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                <div>
                    <h3 className="text-yellow-500 font-bold uppercase text-xs mb-1">Règles de la Grille</h3>
                    <p className="text-gray-300 text-xs leading-relaxed">
                        Pronostiquez les 10 matchs. Fermeture 1h avant. Doubles chances (1X, X2) autorisées.
                    </p>
                </div>
            </div>
        </div>

        {gridMatches.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-700 text-center">
                <div className="bg-gray-700/50 p-4 rounded-full mb-4">
                    <CheckIcon className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucune grille disponible</h3>
                <p className="text-gray-400 max-w-xs mx-auto">Revenez un peu plus tard pour découvrir les prochains matchs à pronostiquer.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gridMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))}
            </div>
        )}
        
        <div className="mt-6">
            <AdCarousel ads={ads} />
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md p-4 border-t border-gray-800 z-30 shadow-2xl">
        <div className="container mx-auto max-w-4xl">
            <button
              onClick={handleInitialSubmit}
              disabled={isSubmitting || gridMatches.length === 0}
              className={`w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-black uppercase tracking-wider rounded-xl shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`}
            >
              {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validation...
                  </>
              ) : 'VALIDER MA GRILLE'}
            </button>
        </div>
      </footer>

      {/* FULL SCREEN INTERSTITIAL AD OVERLAY */}
      {showAdModal && (
          <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center p-4">
              <div className="absolute top-4 right-4">
                  {/* Optionnel: Croix de fermeture si le bouton principal ne suffit pas */}
                  {canCloseAd && (
                      <button onClick={handleFinalSubmit} className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700">
                          <XMarkIcon className="w-6 h-6" />
                      </button>
                  )}
              </div>
              
              <div className="text-center mb-6 animate-pulse">
                  <h2 className="text-2xl font-black text-yellow-400 uppercase">Validation en cours...</h2>
                  <p className="text-gray-400 text-sm">Merci de soutenir notre application</p>
              </div>

              {/* CONTENEUR PUB RESPONSIVE */}
              <div className="w-full max-w-lg bg-white rounded-lg overflow-hidden shadow-2xl min-h-[300px] flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs z-0">
                      Chargement Publicité...
                  </div>
                  <div className="relative z-10 w-full">
                       <AdBanner pageName="interstitial" settings={settings} />
                  </div>
              </div>

              <div className="mt-8">
                  <button 
                    onClick={handleFinalSubmit}
                    disabled={!canCloseAd}
                    className={`px-8 py-4 rounded-full font-black uppercase tracking-wider text-lg shadow-xl transition-all ${
                        canCloseAd 
                        ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105' 
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                      {canCloseAd ? "Poursuivre la Validation" : "Patientez..."}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};