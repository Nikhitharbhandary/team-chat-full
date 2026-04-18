import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
   
    FormsModule,
    
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userobj:User={
  firstName: '',
  lastName: '',
  email:'',
  password:  ''
  }

  constructor(private router: Router, private http: HttpClient ) {
   
  }
// onSubmit() {
//   if ( this.userobj.firstName && this.userobj.lastName && this.userobj.email && this.userobj.password) {
//     alert("Login successful");
//     this.router.navigate(['/dashboard']);
//   } else {
//     alert("Please fill in all the  Filed");
//   }
onSubmit(): void {
  if (!this.userobj.firstName || !this.userobj.lastName || !this.userobj.email || !this.userobj.password) {
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

  this.http.post<User>('http://192.168.43.178:3000/register', this.userobj)

    .subscribe(
      (data) => {
        console.log('User registered:', data);
        alert('Registration Successful');
        this.router.navigate(['/admin/login']);
      },
      (error) => {
        console.error('User Already Exist:', error);
        alert('User Already Exist.');
      }
    );
}
}

// onSubmit(): void {
//   if (this.userobj.firstName && this.userobj.lastName && this.userobj.email && this.userobj.password) {
//     this.http.post<User>('http://localhost:3000/register', this.userobj)
//       .subscribe(
//         (data) => {
//           console.log('User registered:', data);
//           alert("Registration Successfulllll");
//           this.router.navigate(['/dashboard']);
//         },
//         (error) => {
//           console.error('Error registering user:', error);
//           alert('Error registering user. Please try again.'); 
//         }
//       );
//   } else {
//     alert('Please fill in all fields.');
//   }
// }

// navigateToRegister() {
//   this.router.navigate(['/register']);
// }
