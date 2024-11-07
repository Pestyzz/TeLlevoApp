import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const profileRedirect: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera un momento para asegurarte de que las señales se hayan actualizado
  await new Promise(resolve => setTimeout(resolve, 800));

  const currentUser = authService.currentUserSig();
  console.log('Current User:', currentUser); // Registro para depuración

  if (currentUser) {
    const activeProfile = authService.activeProfileSig();
    console.log('Active Profile:', activeProfile); // Registro para depuración

    // Evita redirigir si ya estás en la ruta correcta
    if (activeProfile === 'driver' && state.url !== '/main/map') {
      await router.navigate(['/main/map']);
      return false;
    }
  }
  return true;
};