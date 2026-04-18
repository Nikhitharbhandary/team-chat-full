import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    JsonPipe,
    HttpClientModule
  ],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})
export class ForgotpasswordComponent {
  userobj = {
    email: '',
    newPassword: ''
  
  };
  message: string | undefined;

  private apiUrl = 'http://192.168.43.178:3000';
  constructor(private http: HttpClient, private router: Router) {}

 
  onSubmit() {
      // Password length validation
  if (this.userobj.newPassword.length < 6) {
    alert('Password must be at least 6 characters long');
    this.userobj.email = '';
    this.userobj.newPassword = '';
    return;
    
  }
    if (this.userobj.email && this.userobj.newPassword) {
      this.http.put(`${this.apiUrl}/update-user`, this.userobj)
        .subscribe(
          response => {
            this.message = 'Password updated successfully';
            setTimeout(() => {
              this.router.navigate(['/admin/login']);
            }, 2000); // Adjust the timeout as needed
          },
          error => {
            if (error.error && error.error.message) {
              this.message = error.error.message;
            } else {
              this.message = 'An error occurred. Please try again.';
              this.userobj.email = '';
              this.userobj.newPassword = '';
            }
            console.error('Error updating password:', error);
            this.userobj.email = '';
            this.userobj.newPassword = '';
          }
        );
    } else {
      this.message = 'Email and new password are required';
    }
  }
}

  
