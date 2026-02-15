import type { Collection } from '../types';

// API 基础 URL - 在生产环境使用 Vercel Functions
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

/**
 * 获取所有收藏集
 */
export const getCollections = async (): Promise<Collection[]> => {
  try {
    const response = await fetch(`${API_BASE}/collections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch collections');
    }

    // 转换 Firestore Timestamp 为 Date
    return result.data.map((collection: any) => ({
      ...collection,
      lastEdited: collection.lastEdited?._seconds 
        ? new Date(collection.lastEdited._seconds * 1000)
        : new Date(collection.lastEdited)
    }));
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

/**
 * 订阅收藏集变化 (使用轮询模拟实时更新)
 */
export const subscribeToCollections = (
  callback: (data: Collection[]) => void,
  pollInterval: number = 5000 // 默认 5 秒轮询一次
) => {
  let intervalId: NodeJS.Timeout;
  let lastData: string = '';

  const poll = async () => {
    try {
      const collections = await getCollections();
      const currentData = JSON.stringify(collections);
      
      // 只在数据变化时触发回调
      if (currentData !== lastData) {
        lastData = currentData;
        callback(collections);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  // 立即执行一次
  poll();
  
  // 开始轮询
  intervalId = setInterval(poll, pollInterval);

  // 返回取消订阅函数
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

/**
 * 添加新收藏集
 */
export const addNewCollection = async (
  newCollection: Omit<Collection, 'id' | 'lastEdited'>
): Promise<Collection> => {
  try {
    const response = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection: newCollection }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add collection');
    }

    return {
      ...result.data,
      lastEdited: result.data.lastEdited?._seconds 
        ? new Date(result.data.lastEdited._seconds * 1000)
        : new Date(result.data.lastEdited)
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
  try {
    const response = await fetch(`${API_BASE}/collections`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, updates: updatedData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update collection');
    }
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

/**
 * 删除收藏集
 */
export const deleteCollection = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/collections?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete collection');
    }
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

/**
 * 获取用户资料
 */
export const getUserProfile = async (): Promise<{ avatar?: string } | null> => {
  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch profile');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

/**
 * 保存用户资料
 */
export const saveUserProfile = async (avatarUrl: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatar: avatarUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save profile');
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

        // 设置最大尺寸
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

        // 压缩为 JPEG，质量 0.7
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
 * 上传图片 (实际上是压缩并返回 Base64)
 */
export const uploadImageToStorage = async (file: File): Promise<string> => {
  return await compressImage(file);
};
