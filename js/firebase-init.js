/* ============================================================
   firebase-init.js
   Firebase bootstrap for Visited Planets — Google Sign-In + Firestore.

   SETUP: paste your own project's config below. Get it by running
   (from your project folder, after `npx firebase-tools use --add`):

       npx firebase-tools apps:create web nms-app

   That prints exactly this object — copy/paste it in.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/* ---------------- 1. YOUR CONFIG (replace these placeholders) ---------------- */

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

/* ---------------- 2. Init ---------------- */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* ---------------- 3. Nicknames ----------------
   Uniqueness is enforced with a "nicknames/{lowercased-name}" doc
   that holds { uid }. Claiming a name is a transaction: read the
   candidate doc, fail if it belongs to someone else, otherwise
   write it and free up any previous name this uid held.
   ------------------------------------------------------------ */

function randomNickname() {
  return "Explorer-" + Math.floor(1000 + Math.random() * 9000);
}

async function claimNicknameInternal(uid, nickname, markEdited) {
  const trimmed = (nickname || "").trim();
  if (!trimmed) return { ok: false, message: "Nickname cannot be empty." };
  if (trimmed.length > 24) return { ok: false, message: "Keep it under 24 characters." };

  const key = trimmed.toLowerCase();
  const nickRef = doc(db, "nicknames", key);
  const userRef = doc(db, "users", uid);

  try {
    await runTransaction(db, async (tx) => {
      const nickSnap = await tx.get(nickRef);
      if (nickSnap.exists() && nickSnap.data().uid !== uid) {
        throw new Error("TAKEN");
      }
      const userSnap = await tx.get(userRef);
      const prev = userSnap.exists() ? userSnap.data() : null;

      // Free the old name if this user is renaming.
      if (prev && prev.nickname && prev.nickname.toLowerCase() !== key) {
        tx.delete(doc(db, "nicknames", prev.nickname.toLowerCase()));
      }

      tx.set(nickRef, { uid, nickname: trimmed });
      tx.set(
        userRef,
        {
          nickname: trimmed,
          nicknameEdited: markEdited ? true : prev ? !!prev.nicknameEdited : false,
          createdAt: prev && prev.createdAt ? prev.createdAt : serverTimestamp()
        },
        { merge: true }
      );
    });
    return { ok: true, nickname: trimmed };
  } catch (err) {
    if (err && err.message === "TAKEN") {
      return { ok: false, message: "That nickname is already taken — pick another." };
    }
    console.error("[firebase-init] claimNickname failed:", err);
    return { ok: false, message: "Could not save nickname — try again." };
  }
}

/** Called once per session after sign-in. Creates the user doc with an
 *  auto-generated nickname on first-ever login; otherwise just returns
 *  the existing profile. */
async function ensureUserDoc(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return snap.data();

  for (let i = 0; i < 8; i++) {
    const result = await claimNicknameInternal(user.uid, randomNickname(), false);
    if (result.ok) {
      const fresh = await getDoc(userRef);
      return fresh.data();
    }
    // extremely unlikely collision on a 4-digit suffix — just retry
  }
  throw new Error("Could not assign a starting nickname.");
}

/** Manual nickname change from the profile panel. Allowed once —
 *  callers should check `nicknameEdited` before showing the control,
 *  but this also re-checks server-side via the returned profile. */
async function changeNickname(uid, newNickname) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists() && snap.data().nicknameEdited) {
    return { ok: false, message: "You've already used your one nickname change." };
  }
  return claimNicknameInternal(uid, newNickname, true);
}

/* ---------------- 4. Planets ---------------- */

function planetsCol() {
  return collection(db, "planets");
}

/** Live subscription. mode 'mine' filters to the signed-in user;
 *  'all' returns every user's entries (rules still require sign-in
 *  to read at all). Returns an unsubscribe function. */
function subscribePlanets(uid, mode, callback) {
  const q = mode === "all" ? query(planetsCol()) : query(planetsCol(), where("uid", "==", uid));
  return onSnapshot(
    q,
    (snap) => {
      const rows = [];
      snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
      callback(rows, null);
    },
    (err) => {
      console.error("[firebase-init] subscribePlanets error:", err);
      callback([], err);
    }
  );
}

async function addPlanet(uid, nickname, data) {
  return addDoc(planetsCol(), {
    uid,
    nickname,
    priority: data.priority || "1",
    galaxy: data.galaxy || "",
    address: data.address || "",
    biome: data.biome || "",
    notes: data.notes || "",
    dateAdded: data.dateAdded || new Date().toISOString(),
    createdAt: serverTimestamp()
  });
}

async function updatePlanet(id, patch) {
  return updateDoc(doc(db, "planets", id), patch);
}

async function deletePlanet(id) {
  return deleteDoc(doc(db, "planets", id));
}

/** One-time legacy CSV import. Skips rows that look identical to
 *  something already stored for this uid (same galaxy+address+dateAdded)
 *  so re-running the import doesn't duplicate everything. */
async function importRows(uid, nickname, rows) {
  const existingQ = query(planetsCol(), where("uid", "==", uid));
  const existingSnap = await getDocs(existingQ);
  const seen = new Set();
  existingSnap.forEach((d) => {
    const r = d.data();
    seen.add([r.galaxy, r.address, r.dateAdded].join("|"));
  });

  let added = 0;
  for (const row of rows) {
    const key = [row.galaxy, row.address, row.dateAdded].join("|");
    if (seen.has(key)) continue;
    await addPlanet(uid, nickname, row);
    added++;
  }
  return added;
}

/* ---------------- 5. Auth ---------------- */

function signIn() {
  return signInWithPopup(auth, googleProvider);
}
function signOutUser() {
  return signOut(auth);
}

/* ---------------- 6. Expose to the classic (non-module) script ---------------- */

window.NMSFirebase = {
  onAuthStateChanged: (cb) => onAuthStateChanged(auth, cb),
  signIn,
  signOut: signOutUser,
  ensureUserDoc,
  changeNickname,
  subscribePlanets,
  addPlanet,
  updatePlanet,
  deletePlanet,
  importRows
};
