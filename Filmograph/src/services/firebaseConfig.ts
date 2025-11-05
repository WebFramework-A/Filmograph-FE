// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcN7umU2WqbZOg-JghWVoOYqnVaf-7iPo",
  authDomain: "filmograph-df1d4.firebaseapp.com",
  projectId: "filmograph-df1d4",
  storageBucket: "filmograph-df1d4.firebasestorage.app",
  messagingSenderId: "852597373277",
  appId: "1:852597373277:web:df5a0aabf1f815ad58d0b4",
  measurementId: "G-6152S1XVQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);