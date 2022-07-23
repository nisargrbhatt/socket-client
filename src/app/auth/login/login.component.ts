import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  isLoading = false;

  form: FormGroup;
  constructor(public authService: AuthService, private router: Router) {
    this.form = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.email, Validators.required],
      }),
      password: new FormControl('', {
        validators: [Validators.required],
      }),
    });
  }

  ngOnInit(): void {
    this.subs.sink = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
        if (authStatus) {
          this.router.navigate(['/']);
        }
      });
  }

  onLogin() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.login(this.form.value.email, this.form.value.password);
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
