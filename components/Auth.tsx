
import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { CameraIcon, PhotoIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon, WrenchScrewdriverIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { countries } from '../data/countries';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// LISTE DES EMAILS ADMINISTRATEURS
const ADMIN_EMAILS = [
  'admin@example.com', 
  'test@admin.com',
  'superadmin@pronos.com'
];

interface AuthViewProps {
  onLogin: (user: User) => void;
  adminUser?: User;
  regularUser?: User;
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, adminUser, regularUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-t-4 border-yellow-400">
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-yellow-400/10 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-16 h-16 text-yellow-400">
                <path fill="currentColor" d="M493.1 319.4c-4.2-1.4-8.6.2-11.4 3.7L405 419.4V84.3c0-3.3-1.8-6.3-4.6-7.9c-2.8-1.6-6.2-1.5-8.9.2L249.3 154.4l-31-38.9c-3.4-4.3-9.5-5.2-13.9-1.8L120.5 174c-4.3 3.4-5.2 9.5-1.8 13.9l43.2 54.2L41.3 222c-4.3-3-10.1-2.2-13.4 2.1l-25.2 32.5c-3.3 4.3-2.5 10.2 1.8 13.6L129.2 355c4.3 3.3 10.1 2.5 13.4-1.8l16.1-20.2l82.6 62.8c4.3 3.3 10.1 2.5 13.4-1.8l1.8-2.2l132.8-173.8c3.4-4.3 2.5-10.2-1.8-13.6zm-193.4 53.2L182.8 285.2l-32.1 40.2l128.2-97.1l-22.9 28.7c-3.4 4.3-2.5 10.2 1.8 13.6l42.6 33.1z"/>
                </svg>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider text-center leading-tight">PREDICTION FOOT AFRICA</h1>
          </div>
          
          {isLogin ? <LoginForm onLogin={onLogin} adminUser={adminUser} regularUser={regularUser} showPassword={showPassword} setShowPassword={setShowPassword} /> : <SignUpForm onLogin={onLogin} showPassword={showPassword} setShowPassword={setShowPassword} />}

          <p className="text-center text-gray-400 mt-6">
            {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-yellow-400 hover:text-yellow-300 ml-2 uppercase text-sm">
              {isLogin ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const LoginForm: React.FC<any> = ({ onLogin, adminUser, regularUser, showPassword, setShowPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (auth) {
        try {
            // Modular syntax: signInWithEmailAndPassword(auth, email, password)
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user?.uid;

            if (uid) {
                if (db) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data() as User;
                            onLogin({ ...userData, id: uid }); 
                            setLoading(false);
                            return;
                        }
                    } catch (fetchError) {
                        console.warn("Firestore access failed (likely offline). Using basic auth profile.");
                    }
                }
                
                // Fallback if firestore user doc missing or offline
                const basicUser: User = {
                    id: uid,
                    name: userCredential.user?.displayName || email.split('@')[0],
                    email: email,
                    profilePictureUrl: userCredential.user?.photoURL || `https://picsum.photos/seed/${uid}/200`,
                    country: { name: 'Unknown', code: 'un' },
                    gender: 'Other',
                    phone: '',
                    isAdmin: ADMIN_EMAILS.includes(email.toLowerCase())
                };
                onLogin(basicUser);
                setLoading(false);
                return;
            }

        } catch (firebaseError: any) {
            console.error("Erreur Firebase:", firebaseError);
             if (email.toLowerCase() !== adminUser?.email.toLowerCase() && email.toLowerCase() !== regularUser?.email.toLowerCase()) {
                 let msg = "Erreur de connexion.";
                 if (firebaseError.code === 'auth/invalid-credential') msg = "Email ou mot de passe incorrect.";
                 if (firebaseError.code === 'auth/user-not-found') msg = "Aucun compte trouvé avec cet email.";
                 if (firebaseError.code === 'auth/wrong-password') msg = "Mot de passe incorrect.";
                 if (firebaseError.code === 'auth/network-request-failed') msg = "Erreur réseau. Vérifiez votre connexion.";
                 setError(msg);
                 setLoading(false);
                 return;
             }
        }
    }

    // Mock fallback
    if (email.toLowerCase() === adminUser?.email.toLowerCase() && password === 'admin123') {
        onLogin(adminUser);
        setLoading(false);
        return;
    }
    if (email.toLowerCase() === regularUser?.email.toLowerCase() && password === '123456') {
        onLogin(regularUser);
        setLoading(false);
        return;
    }
    
    if (!auth) {
         setError("Firebase hors ligne. Utilisez le compte démo.");
    } else {
         setError("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  return (
    <>
      <h2 className="text-xl font-bold text-center text-white mb-6 uppercase">Connexion</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 mt-1 bg-gray-700 border-0 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 transition-all"
            placeholder="votre@email.com"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Mot de passe</label>
          <div className="relative">
            <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 mt-1 bg-gray-700 border-0 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="••••••••"
                required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg flex items-start">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <button disabled={loading} type="submit" className="w-full py-3 bg-yellow-400 text-gray-900 font-black uppercase rounded-lg hover:bg-yellow-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Connexion..." : "Se connecter"}
        </button>
        
        {!auth && (
             <div className="mt-4 p-3 bg-gray-700/50 rounded text-xs text-center text-gray-400">
                <p className="font-bold text-gray-300 mb-1">Mode Démo (Hors Ligne)</p>
                <p>Admin: admin@example.com / admin123</p>
            </div>
        )}
      </form>
    </>
  );
};

const SignUpForm: React.FC<{
    onLogin: (user: User) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
}> = ({ onLogin, showPassword, setShowPassword }) => {
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [phoneDialCode, setPhoneDialCode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fonction simplifiée pour gérer le clic
    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setCountryCode(code);
        const selectedCountry = countries.find(c => c.code === code);
        if (selectedCountry) {
            setPhoneDialCode(selectedCountry.dial_code);
        } else {
            setPhoneDialCode('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                setError("L'image est trop lourde (max 2Mo).");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setError(''); 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password || !countryCode || !gender || !phoneNumber) {
            setError("Veuillez remplir tous les champs.");
            return;
        }

        const selectedCountry = countries.find(c => c.code === countryCode);
        if (!selectedCountry) {
            setError("Pays invalide.");
            return;
        }
        
        setLoading(true);

        if (!auth || !db) {
            setError("Erreur système : Firebase non connecté.");
            setLoading(false);
            return;
        }

        try {
            // Modular syntax: createUserWithEmailAndPassword(auth, email, password)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user?.uid;
            
            if (!uid || !userCredential.user) {
                throw new Error("Erreur création utilisateur");
            }

            const finalPhotoUrl = selectedImage || `https://picsum.photos/seed/${uid}/200`;

            // Modular syntax: updateProfile(user, ...)
            await updateProfile(userCredential.user, {
                displayName: fullName,
                photoURL: finalPhotoUrl
            });

            const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

            const newUser: User = {
                id: uid,
                name: fullName,
                email: email,
                profilePictureUrl: finalPhotoUrl,
                country: { name: selectedCountry.name, code: selectedCountry.code },
                gender: gender as 'Male'|'Female'|'Other',
                phone: `${phoneDialCode}${phoneNumber}`,
                isAdmin: isAdmin, 
            };

            // db is modular now
            try {
                await setDoc(doc(db, "users", uid), newUser);
            } catch (docError) {
                console.warn("Échec sauvegarde profil complet (offline?). Utilisation profil local.", docError);
            }
            onLogin(newUser);

        } catch (e: any) {
            let msg = "Erreur lors de l'inscription.";
            if (e.code === 'auth/email-already-in-use') msg = "Email déjà utilisé.";
            if (e.code === 'auth/weak-password') msg = "Mot de passe trop court (6+).";
            if (e.code === 'auth/network-request-failed') msg = "Erreur réseau.";
            setError(msg);
            setLoading(false);
        }
    };

    return (
    <>
      <h2 className="text-xl font-bold text-center text-white mb-6 uppercase">Créer un compte</h2>
      <form className="space-y-3" onSubmit={handleSignUp}>
        
        {/* Sélecteur d'image simplifié et robuste */}
        <div className="flex justify-center mb-4">
            <div 
                className="relative cursor-pointer group" 
                onClick={handleImageClick}
                title="Changer la photo"
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                />
                <div className="w-24 h-24 rounded-full border-4 border-gray-700 group-hover:border-yellow-400 transition-colors overflow-hidden relative bg-gray-900">
                    <img 
                        src={selectedImage || "https://picsum.photos/seed/newuser/200"} 
                        alt="Profile" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    {/* Overlay icône appareil photo */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <CameraIcon className="w-8 h-8 text-white/80 drop-shadow-md" />
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-yellow-400 text-black p-1.5 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                     <PhotoIcon className="w-4 h-4" />
                </div>
            </div>
        </div>

        <input type="text" placeholder="Nom complet" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border-0 rounded-lg text-white focus:ring-2 focus:ring-yellow-400" required />
        
        <div className="grid grid-cols-2 gap-3">
            <select className="px-4 py-3 bg-gray-700 border-0 rounded-lg text-white focus:ring-2 focus:ring-yellow-400" value={gender} onChange={e => setGender(e.target.value)} required>
                <option value="">Sexe</option>
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
            </select>
            <select className="px-4 py-3 bg-gray-700 border-0 rounded-lg text-white focus:ring-2 focus:ring-yellow-400" value={countryCode} onChange={handleCountryChange} required>
                <option value="">Pays</option>
                {countries.map(c => <option key={c.code} value={c.code}>{getFlagEmoji(c.code)} {c.name}</option>)}
            </select>
        </div>

        {/* Champ Téléphone International Amélioré */}
        <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1 ml-1">Numéro de téléphone (WhatsApp)</label>
            <div className="flex gap-2">
                <div className="w-1/3 px-2 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 text-center flex items-center justify-center text-sm font-mono" title="Indicatif Pays">
                    {phoneDialCode || "+??"}
                </div>
                <div className="relative w-2/3">
                    <input 
                        type="tel" 
                        placeholder="Ex: 6 12 34 56 78" 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)} 
                        className="w-full px-4 py-3 bg-gray-700 border-0 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 pl-10" 
                        required 
                        disabled={!phoneDialCode}
                    />
                    <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
            </div>
        </div>

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border-0 rounded-lg text-white focus:ring-2 focus:ring-yellow-400" required />
        
        <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border-0 rounded-lg text-white focus:ring-2 focus:ring-yellow-400" required minLength={6} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-white">
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
        </div>

        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg flex items-start">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <button disabled={loading} type="submit" className="w-full py-3 bg-green-500 text-white font-black uppercase rounded-lg hover:bg-green-600 transition-all shadow-lg mt-4 disabled:opacity-50">
             {loading ? "Inscription..." : "S'inscrire"}
        </button>
        
        <p className="text-xs text-gray-500 text-center pt-2">
            Astuce : Utilisez <strong>admin@example.com</strong> pour créer un compte administrateur.
        </p>
      </form>
    </>
  );
}
