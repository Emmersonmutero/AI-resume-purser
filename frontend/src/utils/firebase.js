import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Retry helper
const withRetry = async (operation, maxAttempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Initialize Firebase
let app, auth, db, storage;
try {
  // Log configuration (without sensitive data)
  console.log("Initializing Firebase with project:", firebaseConfig.projectId);
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  console.error("Firebase config:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey
  });
  throw error;
}

// Google Auth
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "job_seeker",
        createdAt: new Date()
      });
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Email/Password registration
export const registerWithEmailAndPassword = async (name, email, password, role = "job_seeker") => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: new Date()
    });

    return user;
  } catch (error) {
    console.error("Error registering with email and password:", error);
    throw error;
  }
};

// Email/Password login
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error logging in with email and password:", error);
    throw error;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Firestore user functions
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) return userDoc.data();
    throw new Error("User not found");
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

export const updateUserData = async (uid, data) => {
  try {
    await updateDoc(doc(db, "users", uid), data);
    return true;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

// Resume Storage
export const uploadResume = async (uid, file, metadata = {}) => {
  try {
    const storageRef = ref(storage, `resumes/${uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const resumeData = {
            uid,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            downloadURL,
            uploadedAt: new Date(),
            ...metadata
          };
          const docRef = await addDoc(collection(db, "resumes"), resumeData);
          resolve({ id: docRef.id, ...resumeData });
        }
      );
    });
  } catch (error) {
    console.error("Error in uploadResume:", error);
    throw error;
  }
};

export const getUserResumes = async (uid) => {
  try {
    const q = query(collection(db, "resumes"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const resumes = [];
    querySnapshot.forEach(doc => resumes.push({ id: doc.id, ...doc.data() }));
    return resumes;
  } catch (error) {
    console.error("Error getting user resumes:", error);
    throw error;
  }
};

export const deleteResume = async (uid, resumeId, fileName) => {
  try {
    await deleteDoc(doc(db, "resumes", resumeId));
    const storageRef = ref(storage, `resumes/${uid}/${fileName}`);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw error;
  }
};

export const downloadResume = async (downloadURL, originalName) => {
  try {
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Error downloading resume:", error);
    throw error;
  }
};

export const generateResumeReport = async (resumeId) => {
  try {
    const resumeDoc = await getDoc(doc(db, "resumes", resumeId));
    if (!resumeDoc.exists()) throw new Error("Resume not found");
    const resumeData = resumeDoc.data();
    return { id: resumeId, reportURL: resumeData.downloadURL, reportData: resumeData.parsedData, generatedAt: new Date() };
  } catch (error) {
    console.error("Error generating resume report:", error);
    throw error;
  }
};

export const getAllResumes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "resumes"));
    const resumes = [];
    querySnapshot.forEach(doc => resumes.push({ id: doc.id, ...doc.data() }));
    return resumes;
  } catch (error) {
    console.error("Error getting all resumes:", error);
    throw error;
  }
};

// Export Firebase instances
export { app, auth, db, storage, withRetry };
