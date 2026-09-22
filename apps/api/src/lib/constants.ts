export const DEV_OTP = '123456';

const LOCAL_WEB_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

export function webOrigins() {
  const fromEnv = (process.env.WEB_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production') {
    return fromEnv.length ? fromEnv : LOCAL_WEB_ORIGINS;
  }

  return [...new Set([...fromEnv, ...LOCAL_WEB_ORIGINS])];
}
