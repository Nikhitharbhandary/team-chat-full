import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse  } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
interface People {
  email: string;
  password: string;
}

@Component({
  selector: 'app-userlogin',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    JsonPipe,
    HttpClientModule
  ],
  templateUrl: './userlogin.component.html',
  styleUrl: './userlogin.component.css'
})
export class UserloginComponent {
  userobj: People = {
    email: "",
    password: ""
  };
  channelName: string = '';
  orgname:string=" ";
  username: string = ''; 
  constructor(private router: Router, private http: HttpClient) { }
  
onSubmit(): void {
  if (!this.userobj.email || !this.userobj.password) {
    alert('Email and password are required');
    return;
  }
  this.http.post<{ message: string, channelName?: string ,username?: string, orgname?:string}>('http://localhost:3000/userlogin', this.userobj)
  .subscribe(
    (response) => {
      if (response.message === 'Login successful') {
        console.log('Login Successful', response);
        alert('Login Successful');

        this.channelName = response.channelName || 'Channel not found';
        this.orgname = response.orgname || 'Organization not found';
        this.username = response.username || 'Username not found';

 this.router.navigate(['/user/userdashboard', {email: this.userobj.email, channelName: this.channelName, username: this.username, orgname: this.orgname }]);
          } else {
            console.error('Invalid email or password');
            alert('Invalid email or password');
          }
        },
        (error: HttpErrorResponse) => {
          console.error('Error during login:', error);
          alert('Error during login. Please try again.');
        }
      );
  }
  
fetchChannelName(): void {
  const emailQueryParam = encodeURIComponent(this.userobj.email);
  this.http.get<{ channelName: string }>(`http://localhost:3000/invite?email=${emailQueryParam}`)
    .subscribe(
      (response) => {
        if (response && response.channelName) {
          this.channelName = response.channelName;
        } else {
          this.channelName = 'Channel not found';
        }
        console.log('Channel name fetched:', this.channelName);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching channel name:', error);
        this.channelName = 'Error fetching channel';
      }
    );
}
fetchorgName(): void {
  const emailQueryParam = encodeURIComponent(this.userobj.email);
  this.http.get<{ orgname: string }>(`http://localhost:3000/invite?email=${emailQueryParam}`)
    .subscribe(
      (response) => {
        if (response && response.orgname) {
          this.orgname = response.orgname;
        } else {
          this.orgname = 'orgname not found';
        }
        console.log('orgname  fetched:', this.orgname);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching orgname :', error);
        this.orgname = 'Error fetching orgname';
      }
    );
}


fetchUserName(): void {
  const emailQueryParam = encodeURIComponent(this.userobj.email);
  this.http.get<{ username: string }>(`http://localhost:3000/invite?email=${emailQueryParam}`)
    .subscribe(
      (response) => {
        if (response && response.username) {
          this.username = response.username;
        } else {
          this.username = 'username not found';
        }
        console.log('username name fetched:', this.username);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching username name:', error);
        this.channelName = 'Error fetching username';
      }
    );
}
navigateToRegister() {
this.router.navigate(['/user/userregister']);
}
navigateToForgotPassword() {
  this.router.navigate(['/user/ufp']);
}
}