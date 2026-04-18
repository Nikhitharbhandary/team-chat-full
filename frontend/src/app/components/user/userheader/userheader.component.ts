import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { OrganizationComponent } from '../../organization/organization.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-userheader',
  standalone: true,
  imports: [
    OrganizationComponent,
    HttpClientModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './userheader.component.html',
  styleUrl: './userheader.component.css'
})
export class UserheaderComponent {
  @Input() orgname: string = '';
  @Input() username: string = '';
  @Input() channelName: string = '';

  //manage profle
  @Input() name: string = '';
  @Input() phone: string = '';
  @Input() email: string = '';
  @Input() address: string = '';
  @Input() dob: string = '';

  // userEmail: string | null = null;
  editableName: string = '';
  editablePhone: string = '';
  editableEmail: string = '';
 editableAddress: string = '';  // Fixed the property name here
  editableDob: string = '';      // Fixed the property name here
  showProfile: boolean = false;
  private apiUrl = 'http://localhost:3000'; // Update with your backend URL
  
  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.orgname = params.get('orgname') || 'dashboard';
      this.username = params.get('username') || 'dashboard';
      this.channelName = params.get('channelName') || 'dashboard';
      this.email = params.get('email') || 'dashboard';
      console.log("orgname:", this.orgname, "username=", this.username, 'channelname=', this.channelName, 'email=', this.email);

      // Fetch user profile details
      this.fetchUserProfile(this.email);
    });
  }

  fetchUserProfile(email: string): void {
    this.http.get<any>(`${this.apiUrl}/userprofile?email=${email}`).subscribe(
      (user) => {
        this.name = user.name;
        this.phone = user.phone;
        this.address = user.address;
        this.dob = user.dob;
        this.editableName = this.name;
        this.editablePhone = this.phone;
        this.editableAddress = this.address;
        this.editableDob = this.dob;
      },
      (error) => {
        console.error('Error fetching user profile:', error);
        alert('Error fetching user profile. Please try again.');
      }
    );
  }

  toggleProfile(event: Event): void {
    event.preventDefault();
    this.showProfile = !this.showProfile;
  }

  saveProfile(): void {
    const updatedProfile: any = {
      email: this.email, // Ensure this is included
      name: this.editableName,
      phone: this.editablePhone,
      address: this.editableAddress,
      dob: this.editableDob
    };

    // Remove any empty fields if necessary
    Object.keys(updatedProfile).forEach(key => {
      if (updatedProfile[key] === '' || updatedProfile[key] === null) {
        delete updatedProfile[key];
      }
    });

    if (Object.keys(updatedProfile).length === 0) {
      alert('No changes detected.');
      return;
    }

    this.http.put<any>(`${this.apiUrl}/updateProfile`, updatedProfile, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe(
      (response) => {
        console.log('Profile saved:', response);
        alert('Profile saved successfully');
        this.showProfile = false; 
      },
      (error) => {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
      }
    );
  }

  cancelEdit(): void {
    this.editableName = this.name;
    this.editablePhone = this.phone;
    this.editableAddress = this.address;
    this.editableDob = this.dob;
    this.showProfile = false;
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