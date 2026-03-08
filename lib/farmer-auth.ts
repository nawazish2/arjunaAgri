'use client';

import type { User } from '@supabase/supabase-js';
import { isSupabaseEnabled, supabase } from './supabase';

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  village: string;
  state: string;
  district?: string;
  pincode?: string;
  language: string;
  email?: string;
}

export function normalizeIndianPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return '';
}

export function isValidIndianPhone(phone: string) {
  return normalizeIndianPhone(phone).length === 12;
}

export function phoneToHiddenEmail(phone: string) {
  const normalized = normalizeIndianPhone(phone);
  return normalized ? `phone-${normalized}@arjuna.local` : '';
}

const CACHE_KEYS = {
  farmerId: 'farmer_id',
  farmerName: 'farmer_name',
  farmerProfile: 'farmer_profile',
} as const;

export async function getAuthUser(): Promise<User | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

export async function isFarmerAuthenticated(): Promise<boolean> {
  if (isSupabaseEnabled && supabase) {
    return !!(await getAuthUser());
  }
  return !!localStorage.getItem(CACHE_KEYS.farmerId);
}

export function readCachedFarmerProfile(): FarmerProfile | null {
  const raw = localStorage.getItem(CACHE_KEYS.farmerProfile);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FarmerProfile;
  } catch {
    return null;
  }
}

export function writeCachedFarmerProfile(profile: FarmerProfile) {
  localStorage.setItem(CACHE_KEYS.farmerId, profile.id);
  localStorage.setItem(CACHE_KEYS.farmerName, profile.name);
  localStorage.setItem(CACHE_KEYS.farmerProfile, JSON.stringify(profile));
}

export function clearCachedFarmerProfile() {
  localStorage.removeItem(CACHE_KEYS.farmerId);
  localStorage.removeItem(CACHE_KEYS.farmerName);
  localStorage.removeItem(CACHE_KEYS.farmerProfile);
}

export async function getActiveFarmerId(): Promise<string | null> {
  if (isSupabaseEnabled && supabase) {
    const user = await getAuthUser();
    return user?.id ?? null;
  }
  return localStorage.getItem(CACHE_KEYS.farmerId);
}

export async function getActiveFarmerProfile(): Promise<FarmerProfile | null> {
  if (isSupabaseEnabled && supabase) {
    const user = await getAuthUser();
    if (!user) return null;

    const cached = readCachedFarmerProfile();
    const safeCached = cached?.id === user.id ? cached : null;
    const { data, error } = await supabase.from('farmers').select('*').eq('id', user.id).maybeSingle();
    if (error) throw error;
    if (!data) return safeCached;

    const profile: FarmerProfile = {
      ...(safeCached ?? {}),
      ...(data as Omit<FarmerProfile, 'email'>),
      id: user.id,
      email: user.email ?? safeCached?.email,
    };
    writeCachedFarmerProfile(profile);
    return profile;
  }

  return readCachedFarmerProfile();
}

export function subscribeToFarmerAuth(callback: (isLoggedIn: boolean) => void) {
  if (isSupabaseEnabled && supabase) {
    getAuthUser()
      .then((user) => callback(!!user))
      .catch(() => callback(false));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(!!session?.user);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }

  const onStorage = () => callback(!!localStorage.getItem(CACHE_KEYS.farmerId));
  callback(!!localStorage.getItem(CACHE_KEYS.farmerId));
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
