import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private logoutTimer: any;

  constructor(private router: Router) {}

  loginSuccess(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

    this.startAutoLogout(token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUserRole(): string {
    return (localStorage.getItem('role') || '').toLowerCase();
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout() {
    localStorage.clear();

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.router.navigate(['/login']);
  }

  // AUTO LOGOUT
  startAutoLogout(token: string) {

    console.log("AUTO LOGOUT STARTED");

    try {
      const payload: any = JSON.parse(atob(token.split('.')[1]));

      if (!payload.exp) {
        console.warn('No exp in token');
        return;
      }

      const expiryTime = payload.exp * 1000 - Date.now();

      if (expiryTime <= 0) {
        this.logout();
        return;
      }

      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
      }

      this.logoutTimer = setTimeout(() => {
        console.log('TOKEN EXPIRED →  LOGOUT');
        this.logout();
      }, expiryTime);

    } catch (error) {
      console.error('Invalid token format', error);
      this.logout();
    }
  }

  // TOKEN EXPIRY CHECK
  isTokenExpired(token: string): boolean {
    try {
      const payload: any = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  }
}