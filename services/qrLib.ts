// services/qrLib.ts

// pass funcstion form fSCofnig file--
// Only needed db here => no auth req. in this lib
import { db } from "./firebaseConfig";

// actula furstore functiosns---
import {
  addDoc,
  collection,
  getDocs,
  limit as qLimit, //apparently need this-> alias to avoid naming clash
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

// feth data from qrServiec--- we'll store
import type { DecodedQR } from "./qrService";

// VAlue/Types from the DAta we'll storeu
export type StoredScan = {
  id: string;
  type: DecodedQR["type"];
  value: string;
  label: DecodedQR["label"];
  raw: string;
  createdAt: number; //tmispmt
};

/** Save e/a Scan --> user  */
// match whn passing ot qrScreen saveScan(uid, { ... })
export async function saveScan(
  uid: string,
  decoded: {
    type: DecodedQR["type"];
    value: string;
    label: DecodedQR["label"];
    raw: string;
  }
) {
  // cehck for user-logIn  (uid is provided by caller)
  // fethc thier ID -> already have uid param

  //   wait fpor newScan to pass --
  await addDoc(collection(db, "users", uid, "scans"), {
    // data/tpese passed
    type: decoded.type,
    value: decoded.value,
    label: decoded.label,
    raw: decoded.raw,
    createdAt: serverTimestamp(),
  });
}

/** Fetch Saved QR scans Max/limti @10==> current user */
// matc @qrScreen--> listScans(uid, { limit: 10 })
export async function listScans(
  uid: string,
  opts: { limit?: number } = {}
): Promise<StoredScan[]> {
  // confrim logged in  (uid provided by caller)
  //   userID -> uid param

  // setUp list
  const q = query(
    // data  structure----
    collection(db, "users", uid, "scans"),
    orderBy("createdAt", "desc"),
    ...(opts.limit ? [qLimit(opts.limit)] : []) //update w/limit
  );

  // functoun to to handle new Scans --
  const snap = await getDocs(q); //get list@firestore db--

  //   loop==> e/a doc @ firesotre db--
  return snap.docs.map((d) => {
    const data = d.data() as any;
    // fetch sotred data/fielsd

    // /Timestamp hadnlign --- b;c firstore writes CreatedAt :serverTimestamp() value
    const ts =
      // checsk for sync issues ---
      (data.createdAt?.toMillis?.() as number | undefined) ?? Date.now();

    return {
      id: d.id,
      type: data.type,
      value: data.value,
      label: data.label,
      raw: data.raw,
      createdAt: ts,
    };
  });
}
