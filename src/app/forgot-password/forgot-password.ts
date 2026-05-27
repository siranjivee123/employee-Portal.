import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class ForgotPasswordComponent {

  userId = '';

  //  OTP 
  otpArray = new FormArray(
    Array.from({ length: 6 }, () => new FormControl(''))
  );

  newPassword = '';
  confirmPassword = '';

  timer = 60;
  canResend = false;

  constructor(private http: HttpClient, private router: Router) {}

  //  SEND OTP 
  sendOtp(stepper: any) {

    if (!this.userId) {
      alert('Enter Employee ID');
      return;
    }

    this.http.post('http://localhost:5000/api/auth/send-otp', {
      userId: this.userId
    }).subscribe({
      next: () => {

        // reset OTP 
        this.otpArray.reset(['', '', '', '', '', '']);

        stepper.next();
        this.startTimer();

        alert('OTP sent successfully');

      },
      error: () => alert('Failed to send OTP')
    });
  }

  //  TIMER 
  startTimer() {

    this.timer = 60;
    this.canResend = false;

    const interval = setInterval(() => {

      this.timer--;

      if (this.timer === 0) {
        clearInterval(interval);
        this.canResend = true;
      }

    }, 1000);
  }

  //GET OTP 
  getOtp(): string {
    return this.otpArray.value.join('');
  }

  // VERIFY OTP 
  verifyOtp(stepper: any) {

    const otp = this.getOtp();

    if (otp.length !== 6) {
      alert('Enter 6-digit OTP');
      return;
    }

    this.http.post('http://localhost:5000/api/auth/verify-otp', {
      userId: this.userId,
      otp
    }).subscribe({
      next: () => {
        stepper.next();
        alert('OTP verified');
      },
      error: () => alert('Invalid OTP')
    });
  }

  //  RESET PASSWORD 
  resetPassword() {

  if (this.newPassword !== this.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  this.http.post('http://localhost:5000/api/auth/reset-password', {
    userId: this.userId.trim(),
    newPassword: this.newPassword
  }).subscribe({
    next: (res: any) => {
      alert(res.message || 'Password updated successfully');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      console.log("FULL ERROR:", err);
      console.log("BACKEND MESSAGE:", err.error);

      alert(err.error?.message || "Error updating password");
    }
  });
}
  // OTP INPUT 
  handleOtpInput(event: any, index: number) {

    const input = event.target;
    let value = input.value;

    value = value.replace(/\D/g, '').slice(-1);

    this.otpArray.at(index).setValue(value);

    input.value = value;

    if (value && index < 5) {
      const next = document.querySelectorAll('.otp-boxes input')[index + 1] as HTMLElement;
      next?.focus();
    }
  }

  handleBackspace(event: any, index: number) {

    if (!event.target.value && index > 0) {
      const prev = document.querySelectorAll('.otp-boxes input')[index - 1] as HTMLElement;
      prev?.focus();
    }
  }

  //   OTP 
  onPaste(event: ClipboardEvent) {

    event.preventDefault();

    const paste = event.clipboardData?.getData('text')
      .replace(/\D/g, '')
      .slice(0, 6) || '';

    this.otpArray.reset(['', '', '', '', '', '']);

    paste.split('').forEach((num, i) => {
      this.otpArray.at(i).setValue(num);
    });
  }
}



