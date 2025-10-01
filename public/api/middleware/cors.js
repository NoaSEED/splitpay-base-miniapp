export const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://splitpay-base-miniapp.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};



