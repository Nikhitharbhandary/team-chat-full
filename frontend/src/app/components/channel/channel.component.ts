
import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

import { CommonModule, JsonPipe } from '@angular/common';

interface Channel {
  channelname: string;
  emailid:string;
}

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    DashboardComponent,
 FormsModule,
    CommonModule,
    JsonPipe,
    HttpClientModule,
    SidebarComponent,
HeaderComponent
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.css'
})
export class ChannelComponent implements OnInit {
  userobj: Channel = {
    channelname: '',
    emailid: ""
  };
  channelExists = false;
  showBox = false;
  showChannelDetails = false;
  showContainer = true;
  private apiUrl = 'http://localhost:3000'; // Update to point to your local server

  channelVisibility: 'public' | 'private' = 'public'; // Default to public
  onSubmit() {
    if (!this.userobj.channelname) {
      alert('All fields are required');
      return;
    }
    this.showBox = true;
    this.showContainer = false; 
    
  };
  orgname: string = '';
  userEmail: string = ''; // Variable to store the fetched email
  constructor(private router: Router, private route: ActivatedRoute, private http:HttpClient) { }

  sendInvitation(): void {
    if (!this.userobj.emailid) {
      alert('Email and  are required');
      return;
    }
    this.http.post<{ message: string }>(`${this.apiUrl}/invite`, this.userobj)
    .subscribe(
      (response: any) => {
        if (response.message === 'Invite successful') {
          console.log('Invite Successful');
          alert('Invite Successful');
          this.router.navigate(['/admin/dashboard']);
        } else {
          console.error('Invite failed');
          alert('Invite failed');
        }
      },
      (error) => {
        console.error('Error during invite:', error);
        alert('Allready invited.');
      }
    );
}

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.orgname = params['orgname'] || ''; // Fetch and store email from URL
  });
  this.route.queryParams.subscribe(params => {
    this.userEmail = params['email'] || ''; // Fetch and store email from URL
    console.log("orgname=",this.orgname);
  });
}
  goBack() {
    this.showBox = false;
    this.showContainer = true;
  }
  skipForNow() {
    this.showChannelDetails=false;
  };
  createChannel(): void {
    if (!this.userobj.channelname || !this.userEmail) {
      alert('All fields are required');
      return;
    }

    // Add email to userobj
    const requestBody = {
      ...this.userobj,
      email: this.userEmail, // Ensure this field is correctly named
      orgname:this.orgname
    };

    this.http.post<Channel>(`http://192.168.43.178:3000/channel`, requestBody)
      .subscribe(
        (data) => {
          console.log('Channel created:', data);
          alert('Channel created successfully');
          this.showChannelDetails = true;
          this.showBox = false;
        },
        (error) => {
          console.error('Error creating channel:', error);
          if (error.status === 400) {
            alert('Channel already exists.');
          } else {
            alert('An error occurred. Please try again.');
          }
        }
      );
  }
}