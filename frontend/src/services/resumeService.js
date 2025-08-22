import { db } from "../utils/firebase";
import { collection, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { apiParseFile, apiIndexResume, apiScore } from "./api";

// Real-time listener for all resumes
export function listenAllResumes(callback) {
  const colRef = collection(db, "resumes");
  return onSnapshot(colRef, snapshot => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
}

// Mark resume as viewed
export async function markResumeViewed(resumeId) {
  const docRef = doc(db, "resumes", resumeId);
  await updateDoc(docRef, { isNew: false });
}

// Upload resume file, parse, score, and index it
export async function uploadAndProcessResume(file, jd) {
  return await apiParseFile(file, jd);
}
