
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAfhwJNkUG31d_pVI_k7FsblKZwRs7BquA",
  authDomain: "email-scheduler-bd5d4.firebaseapp.com",
  projectId: "email-scheduler-bd5d4",
  storageBucket: "email-scheduler-bd5d4.firebasestorage.app",
  messagingSenderId: "770688313528",
  appId: "1:770688313528:web:7c3fa943fd876f78dc6c4d",
  measurementId: "G-06YH8W6C3P",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
