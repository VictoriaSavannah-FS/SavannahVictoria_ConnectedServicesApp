// // app/qr.tsx
// import { useEffect, useRef, useState } from "react";
// import { View, Text, StyleSheet, Alert, Platform } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";

// export default function QRScreen() {
//   // def. states/stoer datsa
//   const [permission, requestPermission] = useCameraPermissions();
//   const [lastScan, setLastScan] = useState<{
//     type: string;
//     data: string;
//   } | null>(null);
//   const [scanning, setScanning] = useState(true); //start scan
//   // cameraService ---
//   const cameraRef = useRef<CameraView>(null);

//   // Effet --- to fetvh perms + render resutls
//   useEffect(() => {
//     // chek if grnadted=> IF not -> ask again...
//     if (!permission?.granted) requestPermission();
//   }, [permission?.granted]);

//   if (!permission) return <View />;
//   if (!permission.granted) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.msg}>
//           We need camera permission to scan QR codes.
//         </Text>
//       </View>
//     );
//   }

//   const onBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
//     if (!scanning) return;
//     setScanning(false);
//     setLastScan({ type, data });
//     // simple demo behavior
//     Alert.alert("QR Scanned", data, [
//       { text: "Scan Again", onPress: () => setScanning(true) },
//       { text: "OK" },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView
//         ref={cameraRef}
//         style={styles.camera}
//         // Only scan QR (you can include others if you want)
//         barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
//         onBarcodeScanned={onBarcodeScanned}
//       />
//       <View style={styles.result}>
//         <Text style={styles.title}>Last Scan</Text>
//         <Text style={styles.text}>
//           {lastScan ? `${lastScan.type}: ${lastScan.data}` : "—"}
//         </Text>
//         {Platform.OS === "web" && (
//           <Text style={styles.note}>
//             Note: QR scanning on web depends on browser camera support.
//           </Text>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000" },
//   camera: { flex: 1 },
//   result: { padding: 16, backgroundColor: "#fff" },
//   title: { fontWeight: "700", marginBottom: 4 },
//   text: { color: "#333" },
//   note: { marginTop: 6, fontSize: 12, color: "#666" },
//   center: { flex: 1, alignItems: "center", justifyContent: "center" },
//   msg: { padding: 16, textAlign: "center" },
// });

// app/qr.tsx
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
// pull in my qr helper fns (decode raw string -> friendly info)
import { decodeQR, DecodedQR } from "../services/qrService";

export default function QRScreen() {
  // --- ST8 & refs ---
  // camera perm hook (expo handles the OS ask)
  const [permission, requestPermission] = useCameraPermissions();

  // store the last raw scan result (just type+data)
  const [lastScan, setLastScan] = useState<{
    type: string;
    data: string;
  } | null>(null);
  // store decoded (human-readable info)
  const [decoded, setDecoded] = useState<DecodedQR | null>(null);

  // scanning toggle (true = scanning is live / false = paused)
  const [scanning, setScanning] = useState(true);

  // ref to actual camera component
  const cameraRef = useRef<CameraView>(null);

  // --- side effect ---
  useEffect(() => {
    // if no perms yet... ask user
    if (!permission?.granted) requestPermission();
  }, [permission?.granted]);

  // edge case: if hook not ready yet
  if (!permission) return <View />;

  // if user denied perms -> show msg
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>
          Hey there... We still need camera permission to scan QR codes.
        </Text>
      </View>
    );
  }

  // --- handler: open decoded results in right app (web/email/phone) ---
  const handleOpenAction = (item: DecodedQR) => {
    try {
      if (item.type === "url") {
        // open in browser (make sure http added if missing)
        Linking.openURL(
          item.value.startsWith("http") ? item.value : `https://${item.value}`
        );
      } else if (item.type === "email") {
        Linking.openURL(`mailto:${item.value}`);
      } else if (item.type === "phone") {
        Linking.openURL(`tel:${item.value}`);
      }
    } catch (e) {
      Alert.alert("Oops", "Couldn't open that.");
    }
  };

  // --- handler: when camera sees a QR code ---
  const onBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanning) return; // skip if paused
    setScanning(false); // stop scanning after 1 result (no spam flood)
    setLastScan({ type, data }); // store raw

    // decode raw -> friendly info (url/email/etc)
    setDecoded(decodeQR(data));
  };

  return (
    <View style={styles.container}>
      {/* actual camera view that does scanning */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        // restrict to QR only (not all barcodes)
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        // scanning only runs if scanning==true
        onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
      />

      {/* --- Result box under camera --- */}
      <View style={styles.result}>
        <Text style={styles.title}>Decoded Result</Text>

        {/* if we decoded smth -> show it, else show dash */}
        {decoded ? (
          <View>
            <Text style={styles.text}>Type: {decoded.type.toUpperCase()}</Text>
            <Text style={styles.text}>
              {decoded.label}: {decoded.value || "—"}
            </Text>

            {/* action btn (open in browser, dial phone, etc) */}
            {(decoded.type === "url" ||
              decoded.type === "email" ||
              decoded.type === "phone") && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleOpenAction(decoded)}
              >
                <Text style={styles.actionBtnText}>
                  {decoded.type === "url"
                    ? "Open Website"
                    : decoded.type === "email"
                    ? "Send Email"
                    : "Call Number"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.text}>—</Text>
        )}

        {/* raw scan value (for debug) */}
        <Text style={[styles.title, { marginTop: 12 }]}>Raw Scan</Text>
        <Text style={styles.text}>
          {lastScan ? `${lastScan.type}: ${lastScan.data}` : "—"}
        </Text>

        {/* btn to stop/resume scanning */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#FF3B30" }]}
          onPress={() => setScanning((cur) => !cur)}
        >
          <Text style={styles.actionBtnText}>
            {scanning ? "Stop Scanning" : "Resume Scanning"}
          </Text>
        </TouchableOpacity>

        {/* lil note on web fallback */}
        {Platform.OS === "web" && (
          <Text style={styles.note}>
            Note: QR scanning on web depends on browser camera support.
          </Text>
        )}
      </View>
    </View>
  );
}

// --- styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  result: { padding: 16, backgroundColor: "#fff" },
  title: { fontWeight: "700", marginBottom: 4 },
  text: { color: "#333" },
  note: { marginTop: 6, fontSize: 12, color: "#666" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  msg: { padding: 16, textAlign: "center" },
  actionBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  actionBtnText: { color: "white", fontWeight: "600" },
});
