import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {

  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();


   if (!token) {
    router.navigate(['/login']);
    return false;
  }
  //   login
  if (!auth.isLoggedIn()) {
    auth.logout();
    return false;
  }

  const userRole = (auth.getUserRole() || '').toLowerCase();

  //  allowed roles from route
  const allowedRoles = (route.data?.['roles'] as string[] || [])
    .map(r => r.toLowerCase());
 console.log('ROLE:', userRole);
  console.log('ALLOWED:', allowedRoles);
  //  guard check
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    router.navigate(['/dashboard']);
    return false;

  }

  return true;
};