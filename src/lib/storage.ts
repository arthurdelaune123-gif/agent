import { initialListings, type Listing } from '../data';

export type StoredUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  favoriteSport?: string;
  clubName?: string;
};

const usersKey = 'villagio-users';
const listingsKey = 'villagio-listings';
const favoritesKey = 'villagio-favorites';
const sessionKey = 'villagio-session';

const hasWindow = typeof window !== 'undefined';

const read = <T,>(key: string, fallback: T): T => {
  if (!hasWindow) return fallback;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : fallback;
};

const write = <T,>(key: string, value: T) => {
  if (!hasWindow) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getUsers = () => read<StoredUser[]>(usersKey, []);

export const saveUser = (user: StoredUser) => {
  const users = getUsers();
  write(usersKey, [...users, user]);
};

export const getListings = () => {
  const stored = read<Listing[]>(listingsKey, initialListings);
  if (!hasWindow || window.localStorage.getItem(listingsKey)) return stored;
  write(listingsKey, initialListings);
  return initialListings;
};

export const saveListings = (listings: Listing[]) => write(listingsKey, listings);

export const getFavorites = () => read<number[]>(favoritesKey, []);
export const saveFavorites = (favorites: number[]) => write(favoritesKey, favorites);

export const getSession = () => read<string | null>(sessionKey, null);
export const setSession = (email: string | null) => write(sessionKey, email);
