import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface Organization {
  orgname: string;
}

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    JsonPipe,
    HttpClientModule
  ],
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {
  userobj: Organization = {
    orgname: ''
  };
  organizations: Organization[] = [];
  organizationExists = false;
  userEmail: string = ''; // Variable to store the fetched email

   constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) { }

   ngOnInit(): void {
    // Fetch email from query parameters on component initialization
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || ''; // Fetch and store email from URL
      if (this.userEmail) {
        this.checkOrganizationStatus(this.userEmail);
      } else {
        console.error('Email not found in query parameters.');
        // Handle the scenario where email is missing from query params
      }
    });
  }
  checkOrganizationStatus(email: string): void {
    this.http.get<Organization[]>('http://192.168.43.178:3000/organization', { params: { email } })
      .subscribe(
        (data) => {
          if (data && data.length > 0) {
            this.organizations = data;
            this.organizationExists = true;
          }
        },
        (error) => {
          if (error.status !== 404) {
            console.error('Error checking organization status:', error);
          }
        }
      );
  }
  onSubmit(): void {
    if (!this.userobj.orgname) {
      alert('Organization name is required');
      return;
    }

 // Add email to userobj
 const requestBody = {
  ...this.userobj,
  email: this.userEmail
};

this.http.post<Organization>('http://192.168.43.178:3000/organization', requestBody)
  .subscribe(
    (data) => {
      console.log('Organization created:', data);
      alert('Organization created successfully');
      this.router.navigate(['/admin/dashboard', { orgname: data.orgname, email: this.userEmail }]);
    },
    (error) => {
      console.error('Error creating organization:', error);
      if (error.status === 400) {
        alert('Organization already exists.');
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  );
}
  gotoDashboard(orgname: string): void {
    this.router.navigate(['/admin/dashboard', { orgname ,email: this.userEmail}]);
  }
  deleteOrganization(orgname: string): void {
    if (confirm(`Are you sure you want to delete the organization: ${orgname}?`)) {
      this.http.delete(`http://192.168.43.178:3000/${orgname}`, { params: { email: this.userEmail } })
        .subscribe(
          () => {
            console.log(`Organization ${orgname} deleted successfully.`);
            this.organizations = this.organizations.filter(org => org.orgname !== orgname);
            if (this.organizations.length === 0) {
              this.organizationExists = false;
            }
            alert('Organization deleted successfully');
          },
          (error) => {
            console.error('Error deleting organization:', error);
            alert('An error occurred while deleting the organization. Please try again.');
          }
        );
    }
  }
}