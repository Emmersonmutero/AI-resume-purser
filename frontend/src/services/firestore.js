import { db, storage } from "../utils/firebase";
import {
  addDoc, collection, serverTimestamp,
  query, where, orderBy, onSnapshot,
  doc, getDoc, setDoc, updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadResumeFile(uid, file) {
  const path = `resumes/${uid}/${Date.now()}_${file.name}`;
  const sref = ref(storage, path);
  await uploadBytes(sref, file);
  const url = await getDownloadURL(sref);
  return { path, url };
}

export async function saveParsedResume(uid, fileMeta, parsed) {
  const ref = await addDoc(collection(db, "resumes"), {
    uid,
    fileName: fileMeta.name,
    storagePath: fileMeta.path,
    url: fileMeta.url,
    parsed,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function listenMyResumes(uid, cb) {
  const q = query(
    collection(db, "resumes"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function listenAllResumes(cb) {
  const q = query(collection(db, "resumes"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function setJobDescription(uid, jdText) {
  const ref = doc(db, "job_descriptions", uid);
  await setDoc(ref, { uid, text: jdText, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getJobDescription(uid) {
  const snap = await getDoc(doc(db, "job_descriptions", uid));
  return snap.exists() ? snap.data().text : "";
}

export async function saveMatchScore(resumeId, score, reasons) {
  const ref = doc(db, "resumes", resumeId);
  await updateDoc(ref, { matchScore: score, matchReasons: reasons });
}
