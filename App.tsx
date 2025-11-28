
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AuthView } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Predictions } from './components/Predictions';
import { Leaderboard } from './components/Leaderboard';
import { Rules } from './components/Rules';
import { Information } from './components/Information';
import { Forum } from './components/Forum';
import { Contact } from './components/Contact';
import { About } from './components/About';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AdminPanel } from './components/admin/AdminPanel';
import { useAppData } from './hooks/useAppData'; 
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User, Match } from './types';

export enum Page {
  AUTH,
  DASHBOARD,
  PREDICTIONS,
  LEADERBOARD,
  RULES,
  INFORMATION,
  FORUM,
  CONTACT,
  ABOUT,
  PRIVACY,
  ADMIN
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.AUTH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Hook principal de gestion des données (Firebase)
  const {
    users, matches, predictions, leaderboard, rules, info, 
    forumMessages, contactMessages, ads, settings, loading: dataLoading,
    actions
  } = useAppData();

  // Gestionnaire d'authentification global
  useEffect(() => {
    if (auth) {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                if (db) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                        if (userDoc.exists()) {
                            setCurrentUser({ ...userDoc.data(), id: firebaseUser.uid } as User);
                        } else {
                            throw new Error("User doc not found");
                        }
                    } catch (err) {
                        console.error("Erreur fetch user (Mode Hors Ligne activé):", err);
                        setCurrentUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: firebaseUser.displayName || 'Joueur Hors Ligne',
                            isAdmin: false,
                            profilePictureUrl: firebaseUser.photoURL || 'https://picsum.photos/seed/default/200',
                            country: { name: 'Inconnu', code: 'un'},
                            gender: 'Other',
                            phone: ''
                        });
                    }
                }
                if (currentPage === Page.AUTH) setCurrentPage(Page.DASHBOARD);
            } else {
                setCurrentUser(null);
                setCurrentPage(Page.AUTH);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    } else {
        setAuthLoading(false);
    }
  }, []);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    if (user.isAdmin) {
      setCurrentPage(Page.ADMIN);
    } else {
      setCurrentPage(Page.DASHBOARD);
    }
  }, []);
  
  const handleLogout = useCallback(async () => {
    if (auth) {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erreur logout", error);
        }
    }
    setCurrentUser(null);
    setCurrentPage(Page.AUTH);
  }, []);
  
  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);
  
  const handleUpdateUser = useCallback((updatedData: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
  }, []);

  const adminUser = useMemo(() => users.find(u => u.isAdmin) || { email: 'admin@example.com', isAdmin: true } as User, [users]);
  const regularUser = useMemo(() => users.find(u => !u.isAdmin) || { email: 'user@example.com', isAdmin: false } as User, [users]);

  // --- CALCUL DES NOTIFICATIONS ---
  const notifications = useMemo(() => {
    if (!currentUser) return { predictions: 0, forum: 0, contact: 0, info: 0 };

    const now = new Date();
    const openMatches = matches.filter(m => {
        if (m.result) return false;
        const matchDate = new Date(m.date);
        const lockTime = new Date(matchDate.getTime() - (60 * 60 * 1000));
        return now < lockTime;
    });
    
    const myPredictions = predictions.filter(p => p.userId === currentUser.id);
    const missingPredictionsCount = openMatches.filter(m => !myPredictions.some(p => p.matchId === m.id)).length;

    const adminRepliesCount = contactMessages.filter(m => m.user.id === currentUser.id && m.isFromAdmin).length;

    return {
        predictions: missingPredictionsCount,
        forum: forumMessages.length,
        contact: adminRepliesCount,
        info: info.length
    };
  }, [currentUser, matches, predictions, forumMessages, contactMessages, info]);


  if (authLoading || dataLoading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white flex-col">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-yellow-400 font-semibold animate-pulse">Chargement des données...</p>
        </div>
      );
  }

  const renderPage = () => {
    if (!currentUser) {
      return <AuthView onLogin={handleLogin} adminUser={adminUser} regularUser={regularUser} />;
    }

    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard 
          navigate={navigate} 
          onLogout={handleLogout} 
          currentUser={currentUser} 
          ads={ads} 
          settings={settings}
          actions={actions}
          onUpdateUser={handleUpdateUser}
          notificationCounts={notifications}
        />;
      case Page.PREDICTIONS:
        return <Predictions navigate={navigate} currentUser={currentUser} matches={matches} predictions={predictions} onSubmit={actions.submitPredictions} ads={ads} settings={settings} />;
      case Page.LEADERBOARD:
        return <Leaderboard navigate={navigate} currentUser={currentUser} leaderboard={leaderboard} ads={ads} settings={settings} />;
      case Page.RULES:
        return <Rules navigate={navigate} currentUser={currentUser} rules={rules} ads={ads} settings={settings} />;
      case Page.INFORMATION:
        return <Information navigate={navigate} currentUser={currentUser} info={info} ads={ads} settings={settings} />;
      case Page.FORUM:
        return <Forum navigate={navigate} currentUser={currentUser} messages={forumMessages} onSend={actions.sendForumMessage} ads={ads} settings={settings} />;
      case Page.CONTACT:
        return <Contact navigate={navigate} currentUser={currentUser} messages={contactMessages} onSend={actions.sendContactMessage} adminUser={adminUser!} ads={ads} settings={settings} />;
      case Page.ABOUT:
        return <About navigate={navigate} currentUser={currentUser} ads={ads} settings={settings} />;
      case Page.PRIVACY:
        return <PrivacyPolicy navigate={navigate} currentUser={currentUser} ads={ads} settings={settings} />;
      case Page.ADMIN:
        if(currentUser.isAdmin) {
          return <AdminPanel 
            onLogout={handleLogout}
            matches={matches} actions={actions}
            rules={rules} 
            info={info} 
            forumMessages={forumMessages} 
            contactMessages={contactMessages} 
            ads={ads} 
            users={users}
            predictions={predictions}
            settings={settings}
          />;
        }
        setCurrentPage(Page.DASHBOARD);
        return <Dashboard navigate={navigate} onLogout={handleLogout} currentUser={currentUser} ads={ads} actions={actions} onUpdateUser={handleUpdateUser} notificationCounts={notifications} settings={settings} />;
      default:
        return <Dashboard navigate={navigate} onLogout={handleLogout} currentUser={currentUser} ads={ads} actions={actions} onUpdateUser={handleUpdateUser} notificationCounts={notifications} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      {renderPage()}
    </div>
  );
};

export default App;
