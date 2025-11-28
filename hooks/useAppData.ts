
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDocs,
  writeBatch,
  query,
  orderBy,
  getDoc,
  where
} from 'firebase/firestore';
import type { User, Match, Prediction, LeaderboardEntry, Rule, Info, ForumMessage, ContactMessage, Ad, AppSettings, PredictionValue } from '../types';

const MOCK_MATCHES: Match[] = [
  { id: 'match1', betNumber: 1, homeTeam: { name: 'France', flagUrl: 'https://flagcdn.com/w320/fr.png' }, awayTeam: { name: 'Allemagne', flagUrl: 'https://flagcdn.com/w320/de.png' }, date: new Date(Date.now() + 86400000).toISOString(), competition: 'Euro 2024', country: 'Allemagne' },
  { id: 'match2', betNumber: 2, homeTeam: { name: 'Brésil', flagUrl: 'https://flagcdn.com/w320/br.png' }, awayTeam: { name: 'Argentine', flagUrl: 'https://flagcdn.com/w320/ar.png' }, date: new Date(Date.now() + 172800000).toISOString(), competition: 'Copa America', country: 'USA' },
  { id: 'match3', betNumber: 3, homeTeam: { name: 'Espagne', flagUrl: 'https://flagcdn.com/w320/es.png' }, awayTeam: { name: 'Italie', flagUrl: 'https://flagcdn.com/w320/it.png' }, date: new Date(Date.now() + 259200000).toISOString(), competition: 'Euro 2024', country: 'Allemagne' },
];
const MOCK_RULES: Rule[] = [{ id: 'rule1', content: 'RÈGLEMENT OFFICIEL :\n\n1. Victoire 1 ou 2 correcte : 3 Points\n2. Match Nul (X) correct : 2 Points\n3. Double chance (1X ou X2) correcte : 1 Point\n\nLes paris sont fermés 1 heure avant le coup d\'envoi.' }];
const MOCK_INFO: Info[] = [
    { id: 'info_slot_1', text: 'Bienvenue sur le concours ! Participez et gagnez de nombreux lots.', imageUrl: 'https://picsum.photos/seed/info1/800/400', timestamp: new Date().toISOString() },
    { id: 'info_slot_2', text: 'Rejoignez le forum pour débattre des matchs en direct.', imageUrl: 'https://picsum.photos/seed/info2/800/400', timestamp: new Date().toISOString() }
];
const MOCK_ADS: Ad[] = [
    { id: 'ad_slot_1', imageUrl: 'https://picsum.photos/seed/ad1/400/200', name: 'Maillot Pro 2024', price: '79.99€', url: '#' },
    { id: 'ad_slot_2', imageUrl: 'https://picsum.photos/seed/ad2/400/200', name: 'Ballon Officiel', price: '129.99€', url: '#' },
];

const DEFAULT_SETTINGS: AppSettings = {
    adSenseClientId: 'ca-pub-1974570269609479',
    adSenseSlots: {
        home: '9695227462',         // ACCEUIL
        predictions: '1816737445',  // PREDICTION
        leaderboard: '8290630549',  // LEADER
        rules: '6016547348',        // RULES
        info: '8190574104',         // INFOS
        forum: '7329629018',        // FORUM
        contact: '7819857257',      // CONTACTS
        interstitial: '4934673611', // Page de Validation (Interstitiel)
        about: '',
        privacy: ''
    }
};

// Fonction utilitaire pour calculer les points (Doit correspondre à la logique de Predictions.tsx)
const calculatePoints = (prediction: PredictionValue, result: { homeScore: number, awayScore: number }): number => {
    let actualResult: '1' | 'X' | '2';
    if (result.homeScore > result.awayScore) actualResult = '1';
    else if (result.homeScore < result.awayScore) actualResult = '2';
    else actualResult = 'X';

    if (prediction === actualResult) {
        return actualResult === 'X' ? 2 : 3;
    } else if (prediction === '1X' && (actualResult === '1' || actualResult === 'X')) {
        return 1;
    } else if (prediction === 'X2' && (actualResult === 'X' || actualResult === '2')) {
        return 1;
    }
    return 0;
};

export const useAppData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [info, setInfo] = useState<Info[]>([]);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // 1. Initialisation de la BDD si elle est vide
  const seedDatabase = async () => {
    if (!db) return;
    try {
        const matchesSnap = await getDocs(collection(db, 'matches'));
        if (!matchesSnap.empty) return;

        const batch = writeBatch(db);
        MOCK_MATCHES.forEach(m => {
            const ref = doc(collection(db, 'matches'));
            batch.set(ref, { ...m, id: ref.id });
        });
        MOCK_RULES.forEach(r => {
            const ref = doc(collection(db, 'rules'));
            batch.set(ref, { ...r, id: ref.id });
        });
        MOCK_ADS.forEach(a => {
            const ref = doc(db, 'ads', a.id);
            batch.set(ref, a);
        });
        MOCK_INFO.forEach(i => {
            const ref = doc(db, 'info', i.id);
            batch.set(ref, i);
        });
        
        // Seed Settings
        batch.set(doc(db, 'settings', 'config'), DEFAULT_SETTINGS);

        await batch.commit();
    } catch (error) {
        console.error("Erreur lors du seeding:", error);
    }
  };

  // 2. Écouteurs temps réel (Listeners)
  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    seedDatabase();

    const unsubs = [
        onSnapshot(collection(db, 'users'), (snap) => {
            setUsers(snap.docs.map(d => ({...d.data(), id: d.id} as User)));
        }),
        onSnapshot(collection(db, 'matches'), (snap) => {
            const fetchedMatches = snap.docs.map(d => ({...d.data(), id: d.id} as Match));
            fetchedMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setMatches(fetchedMatches);
        }),
        onSnapshot(collection(db, 'predictions'), (snap) => {
            setPredictions(snap.docs.map(d => d.data() as Prediction));
        }),
        onSnapshot(collection(db, 'rules'), (snap) => {
            setRules(snap.docs.map(d => ({...d.data(), id: d.id} as Rule)));
        }),
        onSnapshot(collection(db, 'info'), (snap) => {
            const items = snap.docs.map(d => ({...d.data(), id: d.id} as Info));
            items.sort((a, b) => a.id.localeCompare(b.id));
            setInfo(items);
        }),
        onSnapshot(query(collection(db, 'forum'), orderBy('timestamp', 'asc')), (snap) => {
            setForumMessages(snap.docs.map(d => ({...d.data(), id: d.id} as ForumMessage)));
        }),
        onSnapshot(query(collection(db, 'contact'), orderBy('timestamp', 'asc')), (snap) => {
            setContactMessages(snap.docs.map(d => ({...d.data(), id: d.id} as ContactMessage)));
        }),
        onSnapshot(collection(db, 'ads'), (snap) => {
            const fetchedAds = snap.docs.map(d => ({...d.data(), id: d.id} as Ad));
            fetchedAds.sort((a, b) => {
                const getSlotNumber = (id: string) => {
                     const parts = id.split('_'); 
                     if (parts.length >= 3) {
                         return parseInt(parts[2], 10) || 999;
                     }
                     return 999;
                };
                return getSlotNumber(a.id) - getSlotNumber(b.id);
            });
            setAds(fetchedAds);
        }),
        onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as AppSettings;
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...data,
                    adSenseSlots: {
                        ...DEFAULT_SETTINGS.adSenseSlots,
                        ...data.adSenseSlots
                    }
                });
            }
        }),
    ];

    setLoading(false);

    return () => unsubs.forEach(unsub => unsub());
  }, []);

  // 3. Calcul du Classement (Leaderboard)
  useEffect(() => {
    if (users.length === 0) return;

    const calculatedLeaderboard: LeaderboardEntry[] = users
        .filter(u => !u.isAdmin)
        .map(user => {
            let points = 0;
            const userPreds = predictions.filter(p => p.userId === user.id);
            
            userPreds.forEach(p => {
                // PRIORITÉ 1 : Si les points sont "gelés" (stockés dans la prédiction), on les utilise directement.
                // Cela permet de garder les points même si le match est supprimé.
                if (typeof p.points === 'number') {
                    points += p.points;
                    return;
                }

                // PRIORITÉ 2 : Calcul dynamique si le match existe encore
                const match = matches.find(m => m.id === p.matchId);
                if (match && match.result) {
                    points += calculatePoints(p.prediction, match.result);
                }
            });

            return {
                user,
                points,
                rank: 0,
                rankChange: 'same' as const
            };
        });

    calculatedLeaderboard.sort((a, b) => b.points - a.points);
    const finalLeaderboard = calculatedLeaderboard.map((entry, index) => ({ ...entry, rank: index + 1 }));
    setLeaderboard(finalLeaderboard);

  }, [users, matches, predictions]);

  // 4. Actions (CRUD)
  const actions = {
    submitPredictions: async (newPredictions: Prediction[]) => {
        if (!db) return;
        const batch = writeBatch(db);
        newPredictions.forEach(p => {
            const docId = `${p.userId}_${p.matchId}`;
            const ref = doc(db, 'predictions', docId);
            batch.set(ref, p);
        });
        await batch.commit();
    },
    sendForumMessage: async (msg: Omit<ForumMessage, 'id'>) => {
        if (!db) return;
        await addDoc(collection(db, 'forum'), msg);
    },
    sendContactMessage: async (msg: Omit<ContactMessage, 'id'>) => {
        if (!db) return;
        await addDoc(collection(db, 'contact'), msg);
    },
    updateUserProfile: async (userId: string, photoUrl: string) => {
        if (!db) return;
        await updateDoc(doc(db, 'users', userId), { profilePictureUrl: photoUrl });
    },
    addMatch: async (match: Omit<Match, 'id'>) => {
        if (!db) return;
        const ref = doc(collection(db, 'matches'));
        await setDoc(ref, { ...match, id: ref.id });
    },
    updateMatch: async (match: Match) => {
        if (!db) return;
        const { id, ...data } = match;
        await updateDoc(doc(db, 'matches', id), data);
    },
    // SUPPRESSION INTELLIGENTE D'UN MATCH
    deleteMatch: async (id: string) => {
        if (!db) return;
        
        try {
            // 1. Récupérer le match pour avoir le résultat
            const matchDoc = await getDoc(doc(db, 'matches', id));
            if (!matchDoc.exists()) return;
            const matchData = matchDoc.data() as Match;

            // 2. Si le match a un résultat, on fige les points dans les prédictions associées
            if (matchData.result) {
                const q = query(collection(db, 'predictions'), where('matchId', '==', id));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const batch = writeBatch(db);
                    querySnapshot.forEach((docSnap) => {
                        const pred = docSnap.data() as Prediction;
                        // On calcule les points une dernière fois
                        const points = calculatePoints(pred.prediction, matchData.result!);
                        // On stocke ces points dans le document prédiction
                        batch.update(docSnap.ref, { points: points });
                    });
                    await batch.commit();
                }
            }

            // 3. On peut maintenant supprimer le match sans perdre les points des joueurs
            await deleteDoc(doc(db, 'matches', id));
        } catch (error) {
            console.error("Erreur lors du suppression sécurisée du match:", error);
            throw error;
        }
    },
    // SUPPRESSION INTELLIGENTE DE MASSE
    deleteAllFinishedMatches: async () => {
        if (!db) return;
        
        try {
            const matchesCollection = collection(db, 'matches');
            const snapshot = await getDocs(matchesCollection);
            
            // On ne peut pas faire un seul gros batch pour tout (lectures + écritures complexes).
            // On va traiter match par match pour la sécurité des données, ou par petits groupes.
            // Pour simplifier : on itère.
            
            const finishedMatches = snapshot.docs.filter(d => (d.data() as Match).result);
            
            for (const matchDoc of finishedMatches) {
                const matchData = matchDoc.data() as Match;
                if (!matchData.result) continue;

                // Figer les points pour ce match
                const q = query(collection(db, 'predictions'), where('matchId', '==', matchDoc.id));
                const predsSnap = await getDocs(q);
                
                if (!predsSnap.empty) {
                    const batch = writeBatch(db);
                    predsSnap.forEach((pDoc) => {
                         const pred = pDoc.data() as Prediction;
                         const points = calculatePoints(pred.prediction, matchData.result!);
                         batch.update(pDoc.ref, { points: points });
                    });
                    await batch.commit();
                }

                // Supprimer le match
                await deleteDoc(matchDoc.ref);
            }
        } catch (error) {
            console.error("Erreur suppression de masse:", error);
            throw error;
        }
    },
    updateRules: async (newRules: Rule[]) => {
        if (!db || newRules.length === 0) return;
        const r = newRules[0];
        await updateDoc(doc(db, 'rules', r.id), { content: r.content });
    },
    saveInfoSlot: async (info: Info) => {
        if (!db) return;
        await setDoc(doc(db, 'info', info.id), { ...info, timestamp: new Date().toISOString() });
    },
    deleteInfo: async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'info', id));
    },
    saveAdSlot: async (ad: Ad) => {
        if (!db) return;
        await setDoc(doc(db, 'ads', ad.id), ad);
    },
    deleteAd: async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'ads', id));
    },
    deleteForumMessage: async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'forum', id));
    },
    resetCompetition: async () => {
        if (!db) return;
        if (!window.confirm("ATTENTION : Vous allez supprimer TOUS les pronostics pour remettre les compteurs à zéro.\n\nCette action est irréversible.\n\nVoulez-vous continuer ?")) return;
        try {
            const predSnap = await getDocs(collection(db, 'predictions'));
            if (predSnap.empty) {
                alert("Aucun pronostic à supprimer.");
                return;
            }
            const BATCH_SIZE = 400;
            const chunks = [];
            let batch = writeBatch(db);
            let count = 0;
            predSnap.docs.forEach((doc) => {
                batch.delete(doc.ref);
                count++;
                if (count >= BATCH_SIZE) {
                    chunks.push(batch.commit());
                    batch = writeBatch(db);
                    count = 0;
                }
            });
            if (count > 0) chunks.push(batch.commit());
            await Promise.all(chunks);
            setPredictions([]);
            alert("Compétition réinitialisée avec succès.");
        } catch (e) {
            console.error("Erreur lors du reset:", e);
            alert("Erreur lors de la réinitialisation.");
        }
    },
    updateSettings: async (newSettings: AppSettings) => {
        if (!db) return;
        await setDoc(doc(db, 'settings', 'config'), newSettings);
    }
  };

  return {
    users,
    matches,
    predictions,
    leaderboard,
    rules,
    info,
    forumMessages,
    contactMessages,
    ads,
    settings,
    loading,
    actions
  };
};
