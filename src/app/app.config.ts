import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// interceptor (FUNCTION style)
import { jwtInterceptor } from './interceptors/jwt.interceptor';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),

    // HTTP  CONFIG
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),

    importProvidersFrom(
      ReactiveFormsModule,
      FormsModule,  
      MatTableModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      MatCardModule,
      MatFormFieldModule,
      MatPaginatorModule
    )
  ]
};