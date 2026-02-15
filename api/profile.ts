import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// 初始化 Firebase Admin SDK
if (!admin.apps || admin.apps.length === 0) {
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
    // 这里不抛出错误，而是在 handler 中处理
  }
}

const PROFILE_DOC_ID = 'default_user';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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

    // GET: 获取用户资料
    if (method === 'GET') {
      const docRef = db.collection('users').doc(PROFILE_DOC_ID);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(200).json({ success: true, data: null });
      }

      return res.status(200).json({ success: true, data: doc.data() });
    }

    // POST: 保存用户资料
    if (method === 'POST') {
      const { avatar } = req.body;
      
      if (!avatar) {
        return res.status(400).json({ success: false, error: 'Avatar is required' });
      }

      const docRef = db.collection('users').doc(PROFILE_DOC_ID);
      await docRef.set({ avatar }, { merge: true });

      return res.status(200).json({ success: true, data: { avatar } });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Profile API Error:', error);
    
    // 返回更详细的错误信息用于调试
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      // 在非生产环境返回堆栈信息
      ...(process.env.VERCEL_ENV !== 'production' && { 
        stack: error instanceof Error ? error.stack : undefined 
      })
    });
  }
}
