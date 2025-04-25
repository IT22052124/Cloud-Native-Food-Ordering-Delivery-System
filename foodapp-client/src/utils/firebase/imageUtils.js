// firebase/imageUtils.js
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../../firebaseConfig";

// Convert image URI to Blob
export const uriToBlob = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("Error converting URI to Blob:", error);
    throw error;
  }
};

// Upload image to Firebase Storage
export const uploadImageToFirebase = async (uri, userId) => {
  try {
    // Create a unique filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `profile_${userId}_${timestamp}.jpg`;
    const storageRef = ref(storage, `profile_images/${filename}`);

    // Convert the image to a blob and upload
    const blob = await uriToBlob(uri);
    const snapshot = await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Clean up
    blob.close();

    return {
      success: true,
      downloadURL,
      path: snapshot.ref.fullPath,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteImageFromFirebase = async (imagePath) => {
  try {
    if (!imagePath) return;

    // Create a reference to the file
    const storageRef = ref(storage, imagePath);

    // Delete the file
    await deleteObject(storageRef);

    return {
      success: true,
      message: "Image deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
