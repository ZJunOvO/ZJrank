import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// 初始化 Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // 必须使用环境变量
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set');
    }

    const serviceAccountJson = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf-8');
    
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    // 这里不抛出错误，而是在 handler 中处理，以免整个函数崩溃无法返回 JSON
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 检查是否初始化成功
    if (!admin.apps.length) {
      throw new Error('Firebase Admin SDK not initialized. Check server logs for details.');
    }

    const db = admin.firestore();
    const { method } = req;

    // GET: 获取所有收藏集
    if (method === 'GET') {
      const collectionsRef = db.collection('collections');
      const snapshot = await collectionsRef.orderBy('lastEdited', 'desc').get();
      
      const collections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return res.status(200).json({ success: true, data: collections });
    }

    // POST: 创建新收藏集
    if (method === 'POST') {
      const { collection } = req.body;
      
      if (!collection) {
        return res.status(400).json({ success: false, error: 'Collection data is required' });
      }

      const newCollection = {
        ...collection,
        lastEdited: admin.firestore.Timestamp.now()
      };

      const docRef = await db.collection('collections').add(newCollection);
      
      return res.status(201).json({ 
        success: true, 
        data: { id: docRef.id, ...newCollection }
      });
    }

    // PUT: 更新收藏集
    if (method === 'PUT') {
      const { id, updates } = req.body;
      
      if (!id || !updates) {
        return res.status(400).json({ success: false, error: 'ID and updates are required' });
      }

      const updatedData = {
        ...updates,
        lastEdited: admin.firestore.Timestamp.now()
      };

      await db.collection('collections').doc(id).update(updatedData);
      
      return res.status(200).json({ 
        success: true, 
        data: { id, ...updatedData }
      });
    }

    // DELETE: 删除收藏集
    if (method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Collection ID is required' });
      }

      await db.collection('collections').doc(id).delete();
      
      return res.status(200).json({ success: true, message: 'Collection deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    
    // 返回更详细的错误信息用于调试
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      // 在非生产环境返回堆栈信息，或如果显式开启调试
      ...(process.env.VERCEL_ENV !== 'production' && { 
        stack: error instanceof Error ? error.stack : undefined 
      })
    });
  }
}
