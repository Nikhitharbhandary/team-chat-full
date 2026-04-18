import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-usermanage',
  standalone: true,
  imports: [
    DashboardComponent,
 FormsModule,
    CommonModule,
    JsonPipe,
    HttpClientModule,
    SidebarComponent,
HeaderComponent,
RouterModule
  ],
  templateUrl: './usermanage.component.html',
  styleUrl: './usermanage.component.css'
})
export class UsermanageComponent implements OnInit   {
  orgname: string = '';
  email: string = ''; // Add this to store the email from the URL
  channels: string[] = [];
  users: any[] = [];
  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute) {}
 

  ngOnInit(): void {
    // Extract orgname and email from the URL
    this.route.queryParams.subscribe(params => {
      this.orgname = params['orgname'] || '';
      this.email = params['email'] || '';
      this.fetchUsers();
      this.fetchChannels();
    });
  }


  fetchChannels(): void {
    const apiUrl = `${this.apiUrl}/channels?orgname=${this.orgname}&email=${this.email}`;
    this.http.get<{ channelname: string }[]>(apiUrl).subscribe(
      (data) => {
        this.channels = data.map(channel => channel.channelname);
      },
      (error) => {
        console.error('Error fetching channels:', error);
      }
    );
  }
  fetchUsers(): void {
    const apiUrl = `${this.apiUrl}/invited-users?orgname=${this.orgname}&email=${this.email}`;
    this.http.get(apiUrl).subscribe(
      (data: any) => {
        this.users = data;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }
  
  toggleEdit(user: any) {
    // Implement toggleEdit logic here
    user.editing = !user.editing; // Example toggle logic
  }

  
  saveUser(user: any): void {
    console.log('Saving user:', user);
  
    this.http.put(`${this.apiUrl}/users/${user.id}`, {
      username: user.username,
      phone: user.phone,
      email: user.email,
      channelName: user.channelName // Include channelName
    }).subscribe(
      (response) => {
        user.editing = false; // Turn off editing mode after saving
        console.log('User updated successfully:', response);
        alert("User updated successfully");
      },
      (error) => {
        console.error('Error updating user:', error);
        alert("Error updating user");
      }
    );
  }
  

  cancelEdit(user: any): void {
    user.editing = false; // Cancel edit mode for user
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${this.apiUrl}/users/${userId}`).subscribe(
        (response) => {
          console.log('User deleted successfully:', response);
          alert('User deleted successfully');
          // Remove the user from the local array after successful deletion
          this.users = this.users.filter(user => user.id !== userId);
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }
}  

