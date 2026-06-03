import { Component, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';

declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressBarModule
  ]
})
export class LoginComponent implements AfterViewInit {

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  captchaError = false;
  widgetId: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});
  }

  //  Render CAPTCHA 
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (typeof grecaptcha !== 'undefined') {
        const element = document.querySelector('.g-recaptcha');

        if (element && !element.hasChildNodes()) {
          this.widgetId = grecaptcha.render(element, {
            sitekey: '6Le8uOcsAAAAAK4I-uz6CM63xCmtg4GYHMYPZror'
          });
        }
      } else {
        console.error('reCAPTCHA not loaded');
      }
    }, 500);
  }

  // LOGIN
  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const captchaToken = grecaptcha.getResponse(this.widgetId);

    if (!captchaToken) {
      this.captchaError = true;
      return;
    }

    this.captchaError = false;
    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    this.http.post<any>('http://localhost:5000/api/auth/login', {
     email,
      password,
      captcha: captchaToken
    }).subscribe({
      next: (res) => {

        this.isLoading = false;

        if (!res.token) {
          this.loginForm.setErrors({ invalid: true });
          return;
        }


  localStorage.setItem('token', res.token);
  localStorage.setItem('role', res.role);
 const employeeId = res.employeeId || '';
const userName = res.userName || '';
  localStorage.setItem('employeeId', res.employeeId);
localStorage.setItem('userName', userName);
localStorage.setItem('email', res.user?.email || '');


        // Save token + role
        this.authService.loginSuccess(res.token, res.role);

        //  Reset captcha
        grecaptcha.reset(this.widgetId);

        //  Role-based navigation
       this.router.navigate(['/dashboard']);
      },
      error: (err) => {

        this.isLoading = false;
        this.captchaError = false;

        this.loginForm.setErrors({ invalid: true });

        grecaptcha.reset(this.widgetId);
      }
    });
  }
}
