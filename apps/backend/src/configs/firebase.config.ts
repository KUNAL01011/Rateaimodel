import admin from "firebase-admin";
import { myEnvironment } from "./env.config";

const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: myEnvironment.FIREBASE_PROJECT_ID,
        clientEmail: myEnvironment.FIREBASE_CLIENT_EMAIL,
        privateKey: myEnvironment.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      })
    })
  }
  return admin;
}

export const firebaseAdmin = initializeFirebaseAdmin();