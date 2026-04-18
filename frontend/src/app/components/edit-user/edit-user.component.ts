import { Component } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    DashboardComponent
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent {
  orgname: string = '';
}
