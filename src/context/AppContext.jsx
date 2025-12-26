import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { defaultSettings } from '@/config/defaults';
import { getTranslation, isRTL } from '@/i18n/translations';

// Create context
const AppContext = createContext(null);

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Provider component
export const AppProvider = ({ children }) => {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // App state
  const [settings, setSettings] = useState(defaultSettings);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Derived state
  const t = getTranslation(settings.language);
  const rtl = isRTL(settings.language);
  
  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load user profile to get name
        const profileRef = doc(db, 'users', firebaseUser.uid, 'profile', 'info');
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists() ? profileSnap.data() : {};
        
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: profileData.name || null
        });
        
        // Load user settings
        await loadSettings(firebaseUser.uid);
        
        // Subscribe to shifts
        subscribeToShifts(firebaseUser.uid);
      } else {
        setUser(null);
        setSettings(defaultSettings);
        setShifts([]);
      }
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Load user settings from Firestore
  const loadSettings = async (userId) => {
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        setSettings({ ...defaultSettings, ...settingsSnap.data() });
      } else {
        // Create default settings for new user
        await setDoc(settingsRef, defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Subscribe to shifts collection
  const subscribeToShifts = (userId) => {
    const shiftsRef = collection(db, 'users', userId, 'shifts');
    const q = query(shiftsRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const shiftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShifts(shiftsData);
    }, (error) => {
      console.error('Error subscribing to shifts:', error);
    });
  };
  
  // Auth functions
  const login = async (email, password) => {
    setAuthError(null);
    setLoading(true);
    
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      const profileRef = doc(db, 'users', credential.user.uid, 'profile', 'info');
      await setDoc(profileRef, {
        email: email,
        lastLogin: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      setAuthError(getAuthErrorMessage(error.code, t));
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (email, password, name) => {
    setAuthError(null);
    setLoading(true);
    
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user profile with email and name
      const profileRef = doc(db, 'users', credential.user.uid, 'profile', 'info');
      await setDoc(profileRef, {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      
      // Initialize user document with default settings
      const settingsRef = doc(db, 'users', credential.user.uid, 'settings', 'preferences');
      await setDoc(settingsRef, defaultSettings);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error.code, t));
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const resetPassword = async (email) => {
    setAuthError(null);
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error.code, t));
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Settings functions
  const updateSettings = useCallback(async (newSettings) => {
    if (!user) return;
    
    const mergedSettings = { ...settings, ...newSettings };
    setSettings(mergedSettings);
    
    try {
      const settingsRef = doc(db, 'users', user.id, 'settings', 'preferences');
      await updateDoc(settingsRef, newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }, [user, settings]);
  
  // Shift functions
  const addShift = async (shiftData) => {
    if (!user) return;
    
    try {
      const shiftsRef = collection(db, 'users', user.id, 'shifts');
      const docRef = await addDoc(shiftsRef, {
        ...shiftData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding shift:', error);
      throw error;
    }
  };
  
  const updateShift = async (shiftId, shiftData) => {
    if (!user) return;
    
    try {
      const shiftRef = doc(db, 'users', user.id, 'shifts', shiftId);
      await updateDoc(shiftRef, {
        ...shiftData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  };
  
  const deleteShift = async (shiftId) => {
    if (!user) return;
    
    try {
      const shiftRef = doc(db, 'users', user.id, 'shifts', shiftId);
      await deleteDoc(shiftRef);
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  };
  
  // Update user profile
  const updateProfile = async (profileData) => {
    if (!user) return;
    
    try {
      const profileRef = doc(db, 'users', user.id, 'profile', 'info');
      await setDoc(profileRef, profileData, { merge: true });
      
      // Update local user state
      setUser(prev => ({ ...prev, ...profileData }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  
  // Context value
  const value = {
    // Auth
    user,
    authLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    
    // Settings
    settings,
    updateSettings,
    
    // Shifts
    shifts,
    addShift,
    updateShift,
    deleteShift,
    
    // Loading
    loading,
    
    // Translations
    t,
    rtl
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Helper function to get auth error messages
const getAuthErrorMessage = (errorCode, t) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return t.errorInvalidEmail;
    case 'auth/user-not-found':
      return t.errorUserNotFound;
    case 'auth/wrong-password':
      return t.errorWrongPassword;
    case 'auth/email-already-in-use':
      return t.errorEmailInUse;
    case 'auth/weak-password':
      return t.errorPasswordWeak;
    default:
      return t.errorGeneric;
  }
};

export default AppContext;
