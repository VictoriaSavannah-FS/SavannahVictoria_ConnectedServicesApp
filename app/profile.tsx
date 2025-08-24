import { View, Text, StyleSheet, Button } from "react-native";
import { useEffect, useState } from "react";
// import fireBAse Auths----
import {
  signInAnon,
  signOutUser,
  authListen,
} from "../services/firebaseConfig";

export default function ProfileScreen() {
  // state=> stoevalues
  const [uid, setUid] = useState<string | null>(null);
  // useFx @ mount --  cekc if sIn /not on load/state?
  useEffect(() => {
    return authListen(setUid);
  }, []);

  return (
    //OG ---
    // <View style={{ padding: 24 }}>
    //   <Text>Profile Screen </Text>
    // </View>

    // NEW Redner -- render singIn page / userID
    <View style={styles.container}>
      <Text style={styles.statusText}>{uid ? "Signed in" : "Signed out"}</Text>

      {uid && <Text style={styles.uidText}>UID: {uid}</Text>}

      <Button
        title={uid ? "Sign Out" : "Sign In (Anonymous)"}
        onPress={uid ? signOutUser : signInAnon}
      />
    </View>
  );
}

// ---- STYELS

const styles = StyleSheet.create({
  // contner
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12, // works in RN 0.71+ and Expo SDK 49+ (otherwise use margin)
  },
  // text--
  statusText: {
    fontSize: 18,
    fontWeight: "600",
  },
  uidText: {
    color: "white",
  },
  btn: {
    backgroundColor: "#666",
    borderRadius: 6,
  },
});
