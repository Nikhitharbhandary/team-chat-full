
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
@Component({
  selector: 'app-setting',
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
  
  
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent  implements OnInit{
  orgname: string = '';
  userEmail: string = ''; 
  
  constructor(private router: Router, private route: ActivatedRoute, private http:HttpClient) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orgname = params['orgname'] || ''; // Fetch and store email from URL
    });
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || ''; // Fetch and store email from URL
    });
  }
  theme = {
    darkMode: false
  };

  toggleDarkMode(): void {
    if (this.theme.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}

