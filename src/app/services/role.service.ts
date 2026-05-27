import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoleService {

  getRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }
}