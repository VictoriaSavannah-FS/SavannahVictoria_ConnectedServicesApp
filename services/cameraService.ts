import { Asset } from "./../node_modules/expo-media-library/build/MediaLibrary.d";
import React from "react";
import { Camera, CameraView } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator"; // not using --
import * as FileSystem from "expo-file-system";
// import { MediaType } from "expo-image-picker"; //API

// "Library" where it stores all camera fetures/ logic, reusabel compnentts

// define types for feature----
type TakePhotoOptions = {
  quality?: number; // 0..1
  base64?: boolean; // include base64 string
  exif?: boolean; // include EXIF metadata if available (where loca.gps/timestamp)
  skipProcessing?: boolean;
};

type PermissionResult = {
  camera: boolean;
  canUseCamera: boolean;
};

type MediaPermResult = {
  granted: boolean;
  canSave: boolean;
};

// File/Metada types  ---
export type FileInfoResults = {
  exists: boolean;
  uri: string;
  size: number | null;
  isDirectory: boolean | null;
  modificationTime: number | null;
};

class CameraService {
  // libr.->  stores <CAmeraView ref> from screen
  private cameraRef: React.RefObject<CameraView | null> | null = null;

  //conxt <cameraView ref> from Screen
  setCameraRef(ref: React.RefObject<CameraView | null> | null) {
    this.cameraRef = ref;
  }

  // ---- Request camera permissions
  async requestCameraPermissions(): Promise<PermissionResult> {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();

      const result = {
        camera: cameraPermission.status === "granted",
        canUseCamera: cameraPermission.status === "granted",
      };
      console.log("📷 Camera permissions:", result);
      return result;
    } catch (error) {
      console.error("❌ Error requesting camera permissions:", error);
      return {
        camera: false,
        canUseCamera: false,
      };
    }
  }

  //-----  Request media library permissions
  async requestMediaLibraryPermissions(): Promise<MediaPermResult> {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      const result = {
        granted: permission.status === "granted",
        canSave: permission.status === "granted",
        canAccess: permission.status === "granted",
      };
      console.log("📱 Media library permissions:", result);
      return result;
    } catch (error) {
      console.error("❌ Error requesting media library permissions:", error);
      return {
        granted: false,
        canSave: false,
      };
    }
  }
  //----- Take a photo
  async takePhoto(options: TakePhotoOptions = {}) {
    if (!this.cameraRef?.current) {
      throw new Error("Camera reference not available");
    }
    const photo = await this.cameraRef.current.takePictureAsync({
      quality: options.quality ?? 0.9,
      base64: options.base64 ?? false,
      exif: options.exif ?? true, //NEED for loc+gps/timesetamps
      skipProcessing: options.skipProcessing ?? false,
    });
    console.log("📸 Taking photo...");
    return photo;
  }

  //---  Save media to device library

  async saveToMediaLibrary(uri: string) {
    // check if Permissinoin stil valid ---

    const perm = await MediaLibrary.requestPermissionsAsync();
    if (perm.status !== "granted") {
      const req = await MediaLibrary.requestPermissionsAsync();
      if (req.status !== "granted") {
        throw new Error("Media Library permission denied");
      }
    }
    const asset = await MediaLibrary.createAssetAsync(uri);
    console.log("✅ Saved to media library:", asset.id);
    return asset;
  }

  // ---- Pick image from library + aks for EXIF / metada
  async pickImageFromLibrary(
    opts: {
      allowsEditing?: boolean;
      quality?: number;
      includeBase64?: boolean;
    } = {}
  ) {
    const res = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images, // depreceated
      //   mediaTypes: [MediaType.IMAGE],
      //   mediaTypes: [ImagePicker.MediaType.IMAGE],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: opts.allowsEditing ?? false,
      quality: opts.quality ?? 1,
      base64: opts.includeBase64 ?? false,
      exif: true, // a?k for metadata
    });
    if (res.canceled) return null; //when X retn null
    // “If res.assets exists, give me the first element ([0]), otherwise return undefined
    const asset = res.assets?.[0] ?? null;
    if (asset) console.log("Picked image:", asset.uri); // retunr img
    return asset; //pic@metada
  }
  // -----  Get file info
  async getFileInfo(uri: string) {
    try {
      const info = await FileSystem.getInfoAsync(uri);

      if (!info.exists) {
        return {
          exists: false,
          uri: info.uri,
          size: null,
          isDirectory: null,
          modificationTime: null,
        };
      }

      return {
        exists: true,
        uri: info.uri,
        size: info.size ?? null,
        isDirectory: info.isDirectory ?? null,
        modificationTime: info.modificationTime ?? null,
      };
    } catch (error) {
      console.error("❌ Error getting file info:", error);
      return null;
    }
  }
}
export default new CameraService();
