// import { MediaTypeOptions } from './../node_modules/expo-image-picker/src/ImagePicker.types'; // not ising 
import { MediaType } from './../node_modules/expo-media-library/src/MediaLibrary';
import { SpecWatchStreamClose } from "./../node_modules/@firebase/firestore/dist/firestore/test/unit/specs/spec_test_runner.d";
import { Camera, CameraView } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator"; // not using --
import * as FileSystem from "expo-file-system";
import React from "react";
// need to clean and update to new Expo-camera version and w/ only features i'll be using
// "Library" where it stores all camera fetures/ logic, reusabel compnentts


// define types for feature----
type TakePhotoOptions = {
    quality?: number;       // 0..1
    base64?: boolean;       // include base64 string
    exif?: boolean;         // include EXIF metadata if available
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

class CameraService {
  // libr.->  stores <CAmeraView ref> from screen
  private cameraRef: React.RefObject<CameraView> | null = null;

  //conxt <cameraView ref> from Screen
  setCamerRef(ref: React.RefObject<CameraView> | null) {
    this.cameraRef = ref;
  }

  // Request camera permissions
  async requestCameraPermissions() : Promise<PermissionResult> {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      //   const audioPermission = await Camera.requestMicrophonePermissionsAsync();

      const result = {
        camera: cameraPermission.status === "granted",
        // audio: audioPermission.status === "granted",
        canUseCamera: cameraPermission.status === "granted",
        // canRecord:
        //   cameraPermission.status === "granted" &&
        //   audioPermission.status === "granted",
      };
      console.log("📷 Camera permissions:", result);
      return result;
    } catch (error) {
      console.error("❌ Error requesting camera permissions:", error);
      return {
        camera: false,
        // audio: false,
        canUseCamera: false,
        // canRecord: false,
        // error: error.message,
      };
    }
  }
  // Request media library permissions
  async requestMediaLibraryPermissions() {
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
        canAccess: false,
        // error: error.message,
      };
    }
  }
  // Take a photo
  async takePhoto(options: TakePhotoOptions = {}) {
    if (!this.cameraRef) {
      throw new Error("Camera reference not available");
    }
    try {
      console.log("📸 Taking photo...");

      //   const photoOptions = {
      //     quality: options.quality ?? 0.8,
      //     base64: options.includeBase64 ?? false,
      //     exif: options.includeExif ?? false,
      //     skipProcessing: options.skipProcessing ?? false,
      //     ...options,
      //   };

      const photo = await this.cameraRef.current.takePictureAsync({
        quality: options.quality ?? 0.9,
        base64: options.base64 ?? false,
        exif: options.exif ?? true,
        skipProcessing: options.skipProcessing ?? false,
      });

    //   const photo = await this.cameraRef.takePictureAsync(photoOptions);

      console.log("✅ Photo captured:", photo.uri);

      // Process photo if requested
    //   if (options.resize || options.compress) {
    //     return await this.processImage(photo.uri, options);
    //   }
    //   return {
    //     uri: photo.uri,
    //     width: photo.width,
    //     height: photo.height,
    //     base64: photo.base64,
    //     exif: photo.exif,
    //   };
    // } catch (error) {
    //   console.error("❌ Error taking photo:", error);
    //   throw new Error(`Failed to take photo: ${error.message}`);
    // }
  }

//   // Record video --- skip ---- 
//   async startVideoRecording(options = {}) {
//     if (!this.cameraRef) {
//       throw new Error("Camera reference not available");
//     }
//     if (this.isRecording) {
//       throw new Error("Already recording");
//     }
//     try {
//       console.log("🎥 Starting video recording...");

//       const videoOptions = {
//         quality: options.quality || Camera.Constants.VideoQuality["720p"],
//         maxDuration: options.maxDuration || 60, // seconds
//         mute: options.mute || false,
//         ...options,
//       };
//       this.isRecording = true;
//       const video = await this.cameraRef.recordAsync(videoOptions);

//       console.log("✅ Video recorded:", video.uri);
//       return {
//         uri: video.uri,
//         duration: video.duration || 0,
//       };
//     } catch (error) {
//       console.error("❌ Error recording video:", error);
//       this.isRecording = false;
//       throw new Error(`Failed to record video: ${error.message}`);
//     }
//   }
//   // Stop video recording
//   async stopVideoRecording() {
//     if (!this.cameraRef || !this.isRecording) {
//       return null;
//     }
//     try {
//       console.log("⏹️ Stopping video recording...");
//       this.cameraRef.stopRecording();
//       this.isRecording = false;
//     } catch (error) {
//       console.error("❌ Error stopping video recording:", error);
//       this.isRecording = false;
//     }
//   }
  // Process image (resize, compress, format conversion)
//   async processImage(uri, options = {}) {
//     try {
//       console.log("🔄 Processing image:", uri);

//       const manipulatorOptions = [];
//       // Resize if requested
//       if (options.resize) {
//         manipulatorOptions.push({
//           resize: options.resize,
//         });
//       }
//       // Rotate if requested
//       if (options.rotate) {
//         manipulatorOptions.push({
//           rotate: options.rotate,
//         });
//       }
//       // Flip if requested
//       if (options.flip) {
//         manipulatorOptions.push({
//           flip: options.flip,
//         });
//       }
//       // Crop if requested
//       if (options.crop) {
//         manipulatorOptions.push({
//           crop: options.crop,
//         });
//       }
//       const saveOptions = {
//         compress: options.compress || 0.8,
//         format: options.format || ImageManipulator.SaveFormat.JPEG,
//         base64: options.includeBase64 || false,
//       };
//       const result = await ImageManipulator.manipulateAsync(
//         uri,
//         manipulatorOptions,
//         saveOptions
//       );
//       console.log("✅ Image processed:", result.uri);
//       return result;
//     } catch (error) {
//       console.error("❌ Error processing image:", error);
//       throw new Error(`Failed to process image: ${error.message}`);
//     }
//   }
  // Save media to device library
  // Save media to device library (iOS/Android)
   async saveToMediaLibrary(uri: string) {
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (perm.status !== "granted") {
        throw new Error("Media Library permission denied");
      }
  
      const asset = await MediaLibrary.createAssetAsync(uri);
      console.log("✅ Saved to media library:", asset.id);
      return asset; // { id, filename, uri, ... }
    } catch (error: any) {
      console.error("❌ Error saving to media library:", error);
      throw new Error(`Failed to save to media library: ${error?.message ?? "Unknown error"}`);
    }
  }
  // Pick image from library
  async pickImageFromLibrary(opts: {
    allowsEditing? :boolean;
    quality: number;
    includeBase64?: boolean;
  }={}){
    const res = await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ImagePicker.MediaType.Image, 
        allowsEditing: options.allowEditing?? false;
        
        quality: opts.quality ?? 1,
        
        
        base64: opts.includeBase64 ?? false,
        exif: true // a?k for metadata

    });
    if(res.canceled) return nulll;
    return res.assets?.[0] ?? null; //pic@metada
  }



  
    
  }
    

//   // Get media library albums
//   async getMediaLibraryAlbums() {
//     try {
//       const albums = await MediaLibrary.getAlbumsAsync({
//         includeSmartAlbums: true,
//       });
//       return albums.map((album) => ({
//         id: album.id,
//         title: album.title,
//         assetCount: album.assetCount,
//         type: album.type,
//       }));
//     } catch (error) {
//       console.error("❌ Error getting media library albums:", error);
//       throw new Error(`Failed to get albums: ${error.message}`);
//     }
//   }
  // Get file info
  async getFileInfo(uri) {
    try {
      const info = await FileSystem.getInfoAsync(uri);

      return {
        exists: info.exists,
        uri: info.uri,
        size: info.size,
        isDirectory: info.isDirectory,
        modificationTime: info.modificationTime,
      };
    } catch (error) {
      console.error("❌ Error getting file info:", error);
      return null;
    }
  }
  // Set camera reference
  setCameraRef(ref) {
    this.cameraRef = ref;
  }
  // Get camera status
  getCameraStatus() {
    return {
      isRecording: this.isRecording,
      hasReference: !!this.cameraRef,
     };
    } 
}
};
export default new CameraService();
