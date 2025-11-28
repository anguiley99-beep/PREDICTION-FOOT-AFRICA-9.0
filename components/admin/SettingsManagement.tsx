
import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../../types';
import { TrashIcon, ExclamationTriangleIcon, CircleStackIcon, CurrencyDollarIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface SettingsManagementProps {
    onResetCompetition: () => void;
}

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

export const SettingsManagement: React.FC<SettingsManagementProps> = ({ onResetCompetition }) => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            if (!db) {
                setLoading(false);
                return;
            }
            try {
                const docSnap = await getDoc(doc(db, 'settings', 'config'));
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as AppSettings);
                }
            } catch (e) {
                console.error("Erreur chargement settings:", e);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleChange = (field: keyof AppSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSlotChange = (page: keyof AppSettings['adSenseSlots'], value: string) => {
        setSettings(prev => ({
            ...prev,
            adSenseSlots: {
                ...prev.adSenseSlots,
                [page]: value
            }
        }));
    };

    const handleSave = async () => {
        if (!db) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'config'), settings);
            alert("Configuration sauvegardée avec succès !");
        } catch (e) {
            console.error("Erreur save:", e);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-gray-400 p-4">Chargement de la configuration...</div>;

    return (
        <div className="space-y-8 max-w-4xl">
            {/* SECTION ADSENSE */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <CurrencyDollarIcon className="w-6 h-6 mr-2 text-green-400" />
                    Configuration Google AdSense
                </h3>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">ID Éditeur (Client ID)</label>
                        <input 
                            type="text" 
                            placeholder="ex: ca-pub-1234567890123456" 
                            value={settings.adSenseClientId}
                            onChange={(e) => handleChange('adSenseClientId', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">Trouvable dans votre compte AdSense.</p>
                    </div>

                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600 mb-6">
                         <label className="block text-sm font-bold text-yellow-500 uppercase mb-2 flex items-center">
                             <ComputerDesktopIcon className="w-4 h-4 mr-2" />
                             Page de Validation (Interstitiel)
                         </label>
                         <input 
                            type="text" 
                            placeholder="Slot ID pour l'écran de validation (Interstitiel)" 
                            value={settings.adSenseSlots.interstitial || ''}
                            onChange={(e) => handleSlotChange('interstitial', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-500 rounded p-3 text-sm text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                        />
                        <p className="text-xs text-gray-400 mt-2">Cette publicité s'affiche en plein écran lorsque l'utilisateur clique sur "Valider". Créez un bloc d'annonces responsive dans AdSense.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(settings.adSenseSlots).filter(k => k !== 'interstitial').map((key) => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                    Slot ID : {key === 'home' ? 'Accueil' : key.charAt(0).toUpperCase() + key.slice(1)}
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="ex: 1234567890" 
                                    value={settings.adSenseSlots[key as keyof AppSettings['adSenseSlots']]}
                                    onChange={(e) => handleSlotChange(key as any, e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white focus:border-green-400"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Sauvegarde...' : 'Sauvegarder la Configuration'}
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-gray-700" />

            {/* SECTION SYSTEME */}
            <div>
                <h3 className="text-xl font-bold mb-4">Base de Données & Paramètres</h3>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-900/30 rounded-full">
                            <CircleStackIcon className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-white">État du Système</h4>
                            <p className="text-gray-400 mt-1">
                                La base de données est active et connectée au projet Firebase.
                            </p>
                            <div className="mt-4 flex space-x-2">
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">Firebase Connecté</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4 text-red-500 flex items-center">
                    <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
                    Zone de Danger
                </h3>
                <div className="bg-red-900/10 border border-red-500/30 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">Réinitialiser le Concours</h4>
                    <p className="text-gray-300 mb-6">
                        Cette action va remettre à zéro tous les compteurs de points et supprimer les pronostics.
                        <br/>
                        <strong className="text-red-400 mt-2 block">Cette action est irréversible.</strong>
                    </p>
                    <button 
                        onClick={onResetCompetition}
                        className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                    >
                        <TrashIcon className="w-5 h-5 mr-2" />
                        Remettre les compteurs à zéro
                    </button>
                </div>
            </div>
        </div>
    );
};
