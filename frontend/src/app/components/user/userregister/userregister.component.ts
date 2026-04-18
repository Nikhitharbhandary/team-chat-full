import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface People {
  name: string;
  phone: string;
  address:string;
  dob:string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-userregister',
  standalone: true,
  imports: [
    FormsModule,
    
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './userregister.component.html',
  styleUrl: './userregister.component.css'
})
export class UserregisterComponent {
  userobj:People={
    name: '',
    phone: '',
    address:'',
    dob:'',
    email:'',
    password:  ''
    }
    constructor(private router: Router, private http: HttpClient ) {}
    onSubmit(): void {
      if (!this.userobj.name || !this.userobj.phone || !this.userobj.address || !this.userobj.dob || !this.userobj.email || !this.userobj.password) {
        alert('All fields are required');
        return;
      }
    
      // Basic email validation
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailPattern.test(this.userobj.email)) {
        alert('Please enter a valid email address');
        return;
      }
    
      // Password length validation
      if (this.userobj.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
    
      this.http.post<People>('http://localhost:3000/userregister', this.userobj)
        .subscribe(
          (data) => {
            console.log('User registered:', data);
            alert('Registration Successful');
            this.router.navigate(['/user/userlogin']);
          },
          (error) => {
            console.error('User Already Exist:', error);
            alert('User Already Exist.');
          }
        );
    }
}
