import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationComponent } from '../organization/organization.component';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    OrganizationComponent,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() orgname: string = '';
  @Input() email: string = '';
  private apiUrl = 'http://localhost:3000'; // Update with your backend URL

  constructor(private router: Router, private  route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orgname = params['orgname'] || '';
      this.email = params['email'] || '';
      // Fetch channels based on orgname and email if needed
     
    });
  
    console.log('Organization Name:', this.orgname);
    console.log('Email:', this.email);
  }

  logout(): void {
    console.log('Fetched email:', this.email);

    // Call the API to remove the email
    this.http.post(`${this.apiUrl}/api/logout`, { email: this.email }).subscribe({
      next: response => {
        console.log('Logout successful:', response);
        alert("logout succccsfull");
        // Optionally, you can redirect the user after logout
        this.router.navigate(['/admin/login']); // or your desired route
      },
      error: err => {
        console.error('Logout failed:', err);
      }
    });
  }
}