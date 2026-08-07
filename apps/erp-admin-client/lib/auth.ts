import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    // We set the cookie. It can be read by Next.js middleware because it's not HttpOnly.
    // In a stricter prod environment, we would use HttpOnly cookies set by the backend.
    Cookies.set(TOKEN_KEY, token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return Cookies.get(TOKEN_KEY) || null;
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    Cookies.remove(TOKEN_KEY);
  }
};
