import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.darkMode.asObservable();

  constructor() {
    const saved = localStorage.getItem('theme');
    this.setTheme(saved === 'dark');
  }

  toggleTheme() {
    this.setTheme(!this.darkMode.value);
  }

  setTheme(isDark: boolean) {
    this.darkMode.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    //  toggle  :
    document.body.classList.toggle('dark-mode', isDark);
  }
}