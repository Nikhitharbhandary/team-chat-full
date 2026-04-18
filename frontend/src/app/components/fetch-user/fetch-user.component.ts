import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule ,ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-fetch-user',
  standalone: true,
  imports: [
    CommonModule,
     RouterModule,
     HttpClientModule,
     HeaderComponent,
     SidebarComponent
  ],
  templateUrl: './fetch-user.component.html',
  styleUrl: './fetch-user.component.css'
})
export class FetchUserComponent implements OnInit {
  userEmail: string = ''; // Variable to store the fetched email
  users: string[] = [];   // Array to store usernames
  orgname: string = '';
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Extract orgname and email from the URL
    this.route.queryParams.subscribe(params => {
      this.orgname = params['orgname'] || '';
      this.userEmail = params['email'] || '';
      this.fetchUser();
    });
  }

  fetchUser():  void {
    this.http.get<{ name: string }[]>(`http://192.168.43.178:3000/uusername`, {
      params: { email: this.userEmail, orgname: this.orgname }
    }).subscribe(
      (data) => {
        this.users = data.map(user => user.name);
      },
      (error) => {
        console.error('Error fetching channels:', error);
      }
    );
  }
  

  gotoUser(name: string): void {
    this.router.navigate(['/admin/admindm', {name , orgname:this.orgname, email:this.userEmail }]);
  }
}

