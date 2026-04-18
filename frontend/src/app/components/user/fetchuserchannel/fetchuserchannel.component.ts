import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule ,ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-fetchuserchannel',
  standalone: true,
  imports: [
    CommonModule,
     RouterModule,
     HttpClientModule,
    
  ],
  templateUrl: './fetchuserchannel.component.html',
  styleUrl: './fetchuserchannel.component.css'
})
export class FetchuserchannelComponent implements OnInit {
  userEmail: string = ''; // Variable to store the fetched email
  channels: string[] = [];
  orgname: string = '';
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orgname = params['orgname'] || '';
      this.userEmail = params['email'] || '';
      console.log("gotanda",this.userEmail);
      // Fetch channels based on orgname and email if needed
      this.fetchuserChannels();
    });
  }

  fetchuserChannels(): void {
    this.http.get<{ channelname: string }[]>(`http://192.168.43.178:3000/channels`, {
      params: { email: this.userEmail, orgname: this.orgname }
    }).subscribe(
      (data) => {
        this.channels = data.map(channel => channel.channelname);
      },
      (error) => {
        console.error('Error fetching channels:', error);
      }
    );
  }



  gotoChannel(channelName: string): void {
    this.router.navigate(['/admin/adminchat', { channelName, orgname:this.orgname, email:this.userEmail }]);
  }
}