import React, { useRef, useState, useEffect } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
// imrpot camServices
import cameraService from "../services/cameraService";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  // const [picture, takePicture] = useState<CameraType>("Say Cheese!");
  // use cameraRef from services ----
  const cameraRef = useRef<CameraView>(null);
  // fetch latest img metadet
  const [lastUri, setLastUri] = useState<string | null>(null);

  // useRefe into servixe@mount x1
  useEffect(() => {
    cameraService.setCameraRef(cameraRef);
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera...
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // ----- Toogle Cam
  // (same as toggleCameraFacing — keeping comment but using the single function above)

  // ----- take Picture ---
  const takePicture = async () => {
    // triger /btn + response
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // cameSrevce fetch
      const photo = await cameraService.takePhoto({
        quality: 0.9,
        exif: true,
      });
      setLastUri(photo.uri); //update state

      // save to lilrabry - iOS
      if (Platform.OS === "web") {
        Alert.alert("Captured", "Photo captured - but not saved on web.");
      } else {
        await cameraService.saveToMediaLibrary(photo.uri);
        Alert.alert("Saved", "Yay! Your photo was saved to your library!");
      }
      // // Web fallback --
      // async function saveWebFallback(uri: string, filename = `photo-${Date.now()}.jpg`) {
      //   // Browser-only download
      //   const res = await fetch(uri);
      //   const blob = await res.blob();
      //   const url = URL.createObjectURL(blob);
      //   const a = document.createElement("a");
      //   a.href = url;
      //   a.download = filename;
      //   document.body.appendChild(a);
      //   a.click();
      //   a.remove();
      //   URL.revokeObjectURL(url);
      // }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ?? "FAiled to take and save photo..."
      );
    }
  };

  // -- chooes from lib..
  const pickFromLib = async () => {
    try {
      // call camService -- pickIamgefromLib + parms
      const asset = await cameraService.pickImageFromLibrary({
        allowsEditing: true,
        quality: 0.9,
        includeBase64: false,
      });
      if (asset) setLastUri(asset.uri); //update data /stte
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "failed to pick image...");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef} // << wire the ref so CameraService can call takePictureAsync
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>

          {/* Take Picture---  */}
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Picture</Text>
          </TouchableOpacity>

          {/* Choose Photo  --- */}
          <TouchableOpacity style={styles.button} onPress={pickFromLib}>
            <Text style={styles.text}>Choose Picture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Phot URI / metada dispay --- */}
      {lastUri ? (
        <View style={{ alignItems: "center", padding: 12 }}>
          {/* reder image */}
          <Image
            source={{ uri: lastUri }}
            style={{ width: 100, height: 100, borderRadius: 8 }}
          />
          {/* Text/metad info */}
          <Text numberOfLines={1} style={styles.uri}>
            {lastUri}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    backgroundColor: "red",
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  uri: {
    marginTop: 6,
    fontSize: 12,
    color: "#555",
    width: "90%",
  },
});
