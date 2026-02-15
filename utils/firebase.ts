
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
// 我们不再使用 firebase/storage，为了省钱/省配置，直接转 Base64 存数据库
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Collection } from "../types";
import { MOCK_COLLECTIONS, IMAGES } from "../constants";

const firebaseConfig = {
  apiKey: "AIzaSyBVAdSkaItlzSWV0p0pyxjyw7zpj9Fohz8",
  authDomain: "zjrank-fb024.firebaseapp.com",
  projectId: "zjrank-fb024",
  storageBucket: "zjrank-fb024.firebasestorage.app",
  messagingSenderId: "1065962404707",
  appId: "1:1065962404707:web:0c9fe10927c88c5416f156"
};

// Safe Initialization Logic
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
let db: any = null;

if (isConfigured) {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("🔥 Firebase initialized successfully");
    } catch (e) {
        console.error("Firebase init error:", e);
    }
} else {
    console.warn("⚠️ Firebase API Key not configured. Using Mock Data mode.");
}

const COLLECTION_NAME = "muse_collections";
const SETTINGS_COLLECTION = "settings";
const PROFILE_DOC = "user_profile";

/**
 * 获取用户配置 (头像等)
 */
export const getUserProfile = async (): Promise<{ avatar?: string } | null> => {
    if (!db) return null;
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as { avatar?: string };
        }
        return null;
    } catch (e) {
        console.error("Error fetching profile:", e);
        return null;
    }
};

/**
 * 保存用户配置
 */
export const saveUserProfile = async (avatarUrl: string) => {
    if (!db) return;
    try {
        // 使用 setDoc (merge: true) 确保文档不存在时创建，存在时更新
        await setDoc(doc(db, SETTINGS_COLLECTION, PROFILE_DOC), {
            avatar: avatarUrl,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error("Error saving profile:", e);
        throw e;
    }
};

/**
 * 监听数据库变化 (Real-time)
 */
export const subscribeToCollections = (callback: (data: Collection[]) => void) => {
  if (!db) {
      setTimeout(() => callback(MOCK_COLLECTIONS), 500);
      return () => {}; 
  }

  try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      
      return onSnapshot(q, (snapshot) => {
        const collections: Collection[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date();

          collections.push({
            id: doc.id,
            ...data,
            lastEdited: getTimeAgo(date)
          } as Collection);
        });
        callback(collections);
      }, (error) => {
          console.error("Firestore snapshot error:", error);
          callback(MOCK_COLLECTIONS); 
      });
  } catch (err) {
      console.error("Firestore query error:", err);
      callback(MOCK_COLLECTIONS);
      return () => {};
  }
};

/**
 * 图片压缩并转 Base64
 */
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                const width = Math.min(MAX_WIDTH, img.width);
                const height = img.height * (scaleSize < 1 ? scaleSize : 1);

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject("Canvas context unavailable");
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const uploadImageToStorage = async (file: File): Promise<string> => {
  if (!isConfigured) {
      console.warn("Firebase not configured. Returning random mock image.");
      return Math.random() > 0.5 ? IMAGES.sunset : IMAGES.milktea;
  }
  
  try {
      console.log("Compressing image for database storage...");
      const base64String = await compressImage(file);
      return base64String;
  } catch (e) {
      console.error("Image compression failed", e);
      return IMAGES.sunset;
  }
};

/**
 * 保存榜单 (新增)
 */
export const addNewCollection = async (newCollection: Omit<Collection, 'id' | 'lastEdited'>) => {
  if (!db) return;
  try {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...newCollection,
        createdAt: serverTimestamp()
      });
  } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
  }
};

/**
 * 更新榜单 (修改)
 */
export const updateCollection = async (id: string, updatedData: Partial<Collection>) => {
    if (!db) return;
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        // 移除 id 和 lastEdited 这种前端字段，只更新数据字段
        const { id: _, lastEdited: __, ...dataToSave } = updatedData as any;
        
        await updateDoc(docRef, {
            ...dataToSave,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
};

/**
 * 删除榜单
 */
export const deleteCollection = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "年前";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "月前";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "天前";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "小时前";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "分钟前";
  return "刚刚";
}
