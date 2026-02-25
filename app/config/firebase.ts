import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAujlxTz3ybkFocOAmDj-j4cO-FxtSxuww",
  authDomain: "tenaly-mobile.firebaseapp.com",
  projectId: "tenaly-mobile",
  storageBucket: "tenaly-mobile.firebasestorage.app",
  messagingSenderId: "105186528027",
  appId: "1:105186528027:web:ba4ca345928d71e07021be",
  measurementId: "G-20DTS1GCQB"
};

// Initialize firebase 
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

export default app;