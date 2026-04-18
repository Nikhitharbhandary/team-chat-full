import { Component,OnInit } from '@angular/core';


import { ActivatedRoute } from '@angular/router';


import { PeopleComponent } from '../../people/people.component';
import { OrganizationComponent } from '../../organization/organization.component';
import { UserheaderComponent } from '../userheader/userheader.component';
import { UsersidebarComponent } from '../usersidebar/usersidebar.component';


@Component({
  selector: 'app-userdashboard',
  standalone: true,
  imports: [
    UserheaderComponent,
    UsersidebarComponent,
    PeopleComponent,
    OrganizationComponent

  ],
  templateUrl: './userdashboard.component.html',
  styleUrl: './userdashboard.component.css'
})
export class UserdashboardComponent  implements OnInit{
  orgname: string = '';
  channelName: string = '';
  username: string = '';
  email: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.orgname = this.route.snapshot.paramMap.get('orgname')!;
    this.channelName = this.route.snapshot.paramMap.get('channelName')!;
    this.username = this.route.snapshot.paramMap.get('username')!;
    this.email = this.route.snapshot.paramMap.get('email')!;
  }
}
