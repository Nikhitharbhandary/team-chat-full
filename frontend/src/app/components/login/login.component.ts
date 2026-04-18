import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

interface User {
  email: string;
  password: string;
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    JsonPipe,
    HttpClientModule
   
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  userobj: User = {
    email: "",
    password: ""
  };

constructor(private router: Router, private http: HttpClient) {
   
}

onSubmit(): void {
  if (!this.userobj.email || !this.userobj.password) {
    alert('Email and password are required');
    return;
  }

  this.http.post<User>('http://192.168.43.178:3000/login', this.userobj)
    .subscribe(
      (response: any) => {
        if (response.message === 'Login successful') {
          console.log('Login Successful');
          alert('Login Successful');
          this.router.navigate(['/admin/organization'], { queryParams: { email: this.userobj.email } });
        } else {
          console.error('Invalid email or password');
          alert('Invalid email or password');
        }
      },
      (error) => {
        console.error('Error during login:', error);
        alert('Error during login. Please try again.');
      }
    );
}

navigateToRegister() {
  this.router.navigate(['/admin/register']);
}
navigateToForgotPassword() {
  this.router.navigate(['/admin/forgotpassword']);
}
}