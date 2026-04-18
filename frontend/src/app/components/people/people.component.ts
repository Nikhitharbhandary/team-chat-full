import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

import { CommonModule, JsonPipe } from '@angular/common';
interface Invite {
  emailid:string;
  channelname: string;
  invitedBy: string;
  orgname:string;
  
}

@Component({
  selector: 'app-people',
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
  templateUrl: './people.component.html',
  styleUrl: './people.component.css'
})
export class PeopleComponent implements OnInit {
  userobj: Invite = {
    emailid: "",
    channelname:"",
     invitedBy: '',
     orgname:""

    
  };
  orgname: string = '';
  email: string = '';
  channels: string[] = [];
  private apiUrl = 'http://localhost:3000'; // Update to point to your local server


  constructor(private router: Router,private route: ActivatedRoute, private http:HttpClient) { }
  
  onSubmit(): void {
    const { emailid, invitedBy, orgname } = this.userobj;
    const checkUrl = `${this.apiUrl}/invite/check`; // Endpoint to check if invite exists

      // Check if the email is already invited to the channel
      this.http.post<{ exists: boolean }>(checkUrl, {
        emailid: emailid,
   
        orgname: orgname,
      }).subscribe(
        (response) => {
          if (response.exists) {
            alert('This email is already invited to  this organization.');
          } else {
            this.sendInvitation();
          }
        },
        (error) => {
          console.error('Failed to check invite:', error);
          alert("Failed to check invitation. Check console for details.");
        }
      );
    }

    sendInvitation()
    {
    const { emailid, channelname, invitedBy,orgname  } = this.userobj;
    const apiUrl = `${this.apiUrl}/invite`;
  
    this.http.post(apiUrl, { email: emailid, channelName: channelname, invitedBy: invitedBy,orgname:orgname }, { responseType: 'text' }).subscribe(
      (response) => {
        console.log('Invitation sent successfully!', response);
        alert("Invitation sent successfully!");
        this.userobj.emailid = '';
        this.userobj.channelname = '';
      },
      (error) => {
        console.error('Failed to send invitation:', error);
        alert("Failed to send invitation! Check console for details.");
      }
    );
  }
    
  ngOnInit(): void {
    // Consolidate queryParams subscription
    this.route.queryParams.subscribe(params => {
      this.orgname = params['orgname'] || ''; // Fetch and store orgname from URL
      this.email = params['email'] || ''; // Fetch and store email from URL
      this.userobj.invitedBy = this.email; // Set invitedby to the email from URL
      this.userobj.orgname = this.orgname; // Set orgname in userobj

      if (this.orgname && this.email) {
        this.fetchChannels(); // Fetch channels only if both orgname and email are available
      } else {
        console.error('Organization name or email is missing.');
      }
    });
  }

  
  fetchChannels(): void {
    // Ensure both orgname and email are available before making the request
    if (!this.orgname || !this.email) {
      console.error('Organization name or email is missing.');
      return;
    }

    // Pass orgname and email as query parameters
    this.http.get<{ channelname: string }[]>(`${this.apiUrl}/channels`, {
      params: { orgname: this.orgname, email: this.email }
    }).subscribe(
      (data) => {
        this.channels = data.map(channel => channel.channelname);
      },
      (error) => {
        console.error('Failed to fetch channels:', error);
      }
    );
  }
}