import { apiClient } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  email_verified?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<{ user: User }>('/auth/me');
  return res.data.user;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, password });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/change-password', { currentPassword, newPassword });
}

export async function updateProfile(name: string): Promise<User> {
  const res = await apiClient.patch<{ user: User }>('/auth/profile', { name });
  return res.data.user;
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/auth/account');
}
