import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// 初始化 Firebase Admin SDK
if (!admin.apps.length) {
  let credential;
  
  // 优先使用环境变量中的 Base64 编码的服务账号密钥
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccountJson = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf-8');
    credential = admin.credential.cert(JSON.parse(serviceAccountJson));
  } else {
    // 本地开发或部署时使用文件
    const serviceAccount = require('../zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json');
    credential = admin.credential.cert(serviceAccount);
  }
  
  admin.initializeApp({ credential });
}

const db = admin.firestore();
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
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
