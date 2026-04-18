import { Component,OnInit } from '@angular/core';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { PeopleComponent } from '../people/people.component';
import { ActivatedRoute } from '@angular/router';
import { OrganizationComponent } from '../organization/organization.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    PeopleComponent,
    OrganizationComponent

  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  orgname: string = '';
  email: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.orgname = this.route.snapshot.paramMap.get('orgname') || '';
    this.email = this.route.snapshot.paramMap.get('email') || '';
    // console.log('Orgname:', this.orgname); // Debug log
    // console.log('Email:', this.email); // Debug log
  }
}