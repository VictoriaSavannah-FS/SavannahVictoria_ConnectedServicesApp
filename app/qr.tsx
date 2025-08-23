// app/qr.tsx
import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function QRScreen() {
  // def. states/stoer datsa
  const [permission, requestPermission] = useCameraPermissions();
  const [lastScan, setLastScan] = useState<{
    type: string;
    data: string;
  } | null>(null);
  const [scanning, setScanning] = useState(true); //start scan
  // cameraService ---
  const cameraRef = useRef<CameraView>(null);

  // Effet --- to fetvh perms + render resutls
  useEffect(() => {
    // chek if grnadted=> IF not -> ask again...
    if (!permission?.granted) requestPermission();
  }, [permission?.granted]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>
          We need camera permission to scan QR codes.
        </Text>
      </View>
    );
  }

  const onBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanning) return;
    setScanning(false);
    setLastScan({ type, data });
    // simple demo behavior
    Alert.alert("QR Scanned", data, [
      { text: "Scan Again", onPress: () => setScanning(true) },
      { text: "OK" },
    ]);
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        // Only scan QR (you can include others if you want)
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      <View style={styles.result}>
        <Text style={styles.title}>Last Scan</Text>
        <Text style={styles.text}>
          {lastScan ? `${lastScan.type}: ${lastScan.data}` : "—"}
        </Text>
        {Platform.OS === "web" && (
          <Text style={styles.note}>
            Note: QR scanning on web depends on browser camera support.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  result: { padding: 16, backgroundColor: "#fff" },
  title: { fontWeight: "700", marginBottom: 4 },
  text: { color: "#333" },
  note: { marginTop: 6, fontSize: 12, color: "#666" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  msg: { padding: 16, textAlign: "center" },
});
