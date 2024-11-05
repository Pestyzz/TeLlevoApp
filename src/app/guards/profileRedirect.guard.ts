import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const profileRedirect: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await new Promise(resolve => setTimeout(resolve, 100));

  const currentUser = authService.currentUserSig();
  if (currentUser) {
    const activeProfile = authService.activeProfileSig();
    if (activeProfile === 'driver') {
      router.navigate(['/main/map']);
    }
    return false;
  }
  return true;
};
