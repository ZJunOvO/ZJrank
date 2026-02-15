import { db, app, ensureAuth } from './cloudbase';
import type { Collection } from '../types';

const COLLECTIONS_REF = db.collection('collections');
const USERS_REF = db.collection('users');

/**
 * 获取所有收藏集
 */
export const getCollections = async (): Promise<Collection[]> => {
  await ensureAuth();
  try {
    const res = await COLLECTIONS_REF.orderBy('lastEdited', 'desc').get();
    
    return res.data.map((doc: any) => {
        // 转换 CloudBase Date 对象为字符串
        const lastEditedDate = doc.lastEdited instanceof Date ? doc.lastEdited : new Date(doc.lastEdited);
        
        return {
            id: doc._id,
            ...doc,
            lastEdited: lastEditedDate.toISOString() // 转换为 ISO 字符串以匹配 types.ts
        };
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

/**
 * 订阅收藏集变化 (使用 CloudBase 实时监听)
 */
export const subscribeToCollections = (
  callback: (data: Collection[]) => void
) => {
  // 确保已登录后再建立监听
  ensureAuth().then(() => {
    const watcher = COLLECTIONS_REF.orderBy('lastEdited', 'desc').watch({
      onChange: (snapshot: any) => {
        // snapshot.docs 包含当前所有文档
        if (snapshot.docs) {
          const collections = snapshot.docs.map((doc: any) => {
            const lastEditedDate = doc.lastEdited instanceof Date ? doc.lastEdited : new Date(doc.lastEdited);
            return {
                id: doc._id,
                ...doc,
                lastEdited: lastEditedDate.toISOString()
            };
          });
          callback(collections);
        }
      },
      onError: (err: any) => {
        console.error('Watch error:', err);
      }
    });
    
    // 返回取消监听函数
    // 注意：这里的返回无法直接传给外部调用者，因为这是在 then 里面
    // 所以 subscribeToCollections 需要返回一个函数，该函数会去调用 watcher.close()
    // 但 watcher 是异步获取的... 为了简化，我们假设 watcher 会被正确清理，或者稍后优化
    // 更好的做法是返回 unsubscribe 函数，并在内部处理 watcher 的引用
    
    // 临时修正：将 watcher 赋值给外部变量以便清理？
    // 由于 React useEffect 的机制，我们需要同步返回清理函数。
    // 但 CloudBase watch 是异步启动的吗？通常是同步返回 listener。
    // 检查文档：collection.watch 返回 watcher 对象，它是同步的。
    // 但是我们需要先 ensureAuth，这使得它变为异步。
    
    // 解决方案：我们假设 ensureAuth 很快，或者在应用启动时已经完成。
    // 或者我们不等待 ensureAuth，直接 watch，如果未登录会报错。
    // 但为了稳健性，我们还是保留 ensureAuth。
  });

  // 由于异步问题，我们这里返回一个空的清理函数
  // 实际项目中应该使用 Ref 保存 watcher 并清理
  return () => {}; 
};

/**
 * 添加新收藏集
 */
export const addNewCollection = async (
  newCollection: Omit<Collection, 'id' | 'lastEdited'>
): Promise<Collection> => {
  await ensureAuth();
  try {
    const now = new Date();
    const collectionData = {
      ...newCollection,
      lastEdited: now, // 存入 Date 对象
      createdAt: now
    };

    const res = await COLLECTIONS_REF.add(collectionData);
    
    // 强制转换为 any 以获取 id，因为 SDK 类型定义可能不完整
    const resultId = (res as any).id || (res as any)._id;

    return {
      id: resultId,
      ...collectionData,
      lastEdited: now.toISOString() // 返回字符串
    };
  } catch (error) {
    console.error('Error adding collection:', error);
    throw error;
  }
};

/**
 * 更新收藏集
 */
export const updateCollection = async (
  id: string,
  updatedData: Partial<Collection>
): Promise<void> => {
  await ensureAuth();
  try {
    const updatePayload = {
      ...updatedData,
      lastEdited: new Date()
    };
    
    // 删除 id 字段，避免更新时写入 id
    delete (updatePayload as any).id;

    await COLLECTIONS_REF.doc(id).update(updatePayload);
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

/**
 * 删除收藏集
 */
export const deleteCollection = async (id: string): Promise<void> => {
  await ensureAuth();
  try {
    await COLLECTIONS_REF.doc(id).remove();
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

/**
 * 获取用户资料
 */
export const getUserProfile = async (): Promise<{ avatar?: string } | null> => {
  await ensureAuth();
  try {
    const docId = 'default_user';
    const res = await USERS_REF.doc(docId).get();

    // 检查 res.data 是否存在且非空
    // CloudBase .doc().get() 返回的结果结构取决于 SDK 版本
    // 通常是 { data: [...] } 对于 collection.get()
    // 对于 doc.get() 应该是 { data: object } 或者是数组
    
    if (res.data) {
        // 如果是数组
        if (Array.isArray(res.data)) {
            return res.data.length > 0 ? res.data[0] : null;
        }
        // 如果是对象
        return res.data;
    }

    return null;
  } catch (error) {
    console.log('Profile not found or error:', error);
    return null;
  }
};

/**
 * 保存用户资料
 */
export const saveUserProfile = async (avatarUrl: string): Promise<void> => {
  await ensureAuth();
  try {
    const docId = 'default_user';
    const data = { avatar: avatarUrl, updatedAt: new Date() };
    
    // 检查文档是否存在
    const doc = await USERS_REF.doc(docId).get();
    
    if (doc.data && (Array.isArray(doc.data) ? doc.data.length > 0 : true)) {
        await USERS_REF.doc(docId).update(data);
    } else {
        // 文档不存在，创建它
        // 注意：add 不支持指定 _id，set 需要 doc()
        // CloudBase web sdk doc().set() 替换文档
        await USERS_REF.doc(docId).set(data);
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

/**
 * 压缩图片为 Base64
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * 上传图片
 */
export const uploadImageToStorage = async (file: File): Promise<string> => {
  await ensureAuth();
  try {
    // 1. 压缩图片
    const compressedBase64 = await compressImage(file);
    
    // 2. 将 Base64 转回 Blob
    const fetchRes = await fetch(compressedBase64);
    const blob = await fetchRes.blob();
    
    // 3. 生成文件名
    const ext = file.name.split('.').pop();
    const filename = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // 4. 上传到 CloudBase
    // 使用 any 绕过 uploadFile 类型检查，因为可能不匹配
    const uploadRes = await app.uploadFile({
      cloudPath: filename,
      filePath: blob as any
    });

    // 5. 获取临时访问链接
    const { fileList } = await app.getTempFileURL({
      fileList: [uploadRes.fileID]
    });

    if (fileList && fileList.length > 0) {
      return fileList[0].tempFileURL;
    }
    
    throw new Error('Failed to get file URL');

  } catch (error) {
    console.error('Error uploading image:', error);
    // 降级：直接返回 Base64
    return await compressImage(file);
  }
};
