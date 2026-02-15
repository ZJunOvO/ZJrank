import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 诊断端点 - 检查环境变量是否正确配置
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const envVarExists = !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const envVarLength = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.length || 0;
    
    let decodedValid = false;
    let parseError = null;
    
    if (envVarExists) {
      try {
        const decoded = Buffer.from(
          process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!,
          'base64'
        ).toString('utf-8');
        
        // 尝试解析 JSON
        JSON.parse(decoded);
        decodedValid = true;
      } catch (error) {
        parseError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'unknown',
      checks: {
        envVarExists,
        envVarLength,
        decodedValid,
        parseError,
        // 只显示前后几个字符,不泄露完整密钥
        envVarPreview: envVarExists 
          ? `${process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!.substring(0, 20)}...${process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!.substring(envVarLength - 20)}`
          : null
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
