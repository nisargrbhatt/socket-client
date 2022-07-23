import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AuthData } from './auth-data.model';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

const BACKEND_URL = environment.apiUrls + '/api/v1/user/';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false;
  private token?: string;
  private tokenTimer: any;
  private userId: string | any;
  private userData: any;
  private authStatusListener = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackbarService: MatSnackBar
  ) {}

  getToken() {
    return this.token;
  }
  getUserId() {
    return this.userId;
  }
  getIsAuth() {
    return this.isAuthenticated;
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }
  getUserData() {
    return this.userData;
  }

  createUser(email: string, password: string, name: string) {
    const authData: AuthData = {
      email: email,
      password: password,
      name: name,
    };
    return this.http.post(BACKEND_URL + 'signup', authData).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (error) => {
        this.snackbarService.open(
          error?.error?.message ?? 'Something went wrong'
        );
        this.authStatusListener.next(false);
      }
    );
  }
  login(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password,
    };
    this.http
      .post<{ token: string; expiresIn: number; userId: string; user: any }>(
        BACKEND_URL + 'login',
        authData
      )
      .subscribe(
        (response) => {
          if (!response) {
            this.snackbarService.open('Something went wrong');
            return;
          }
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userData = response.user;
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(
              token,
              expirationDate,
              this.userId,
              this.userData
            );
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.snackbarService.open(
            error?.error?.message ?? 'Something went wrong'
          );
          this.authStatusListener.next(false);
        }
      );
  }
  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation?.userId ?? '';
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.userData = JSON.parse(authInformation?.userData as string);
    }
  }
  logout() {
    this.token = undefined;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = undefined;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    userData: any
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('userData', JSON.stringify(userData));
  }
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
  }
  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const userData = localStorage.getItem('userData');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      userData: userData,
    };
  }
}
