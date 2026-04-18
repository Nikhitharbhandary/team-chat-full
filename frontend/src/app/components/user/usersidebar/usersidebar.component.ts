import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-usersidebar',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './usersidebar.component.html',
  styleUrl: './usersidebar.component.css'
})
export class UsersidebarComponent {
  @Input() orgname: string = '';
  @Input() channelName: string = '';
  @Input() username: string = '';
  @Input() email: string = '';
isSidebarVisible: boolean = false;

toggleSidebar() {
  this.isSidebarVisible = !this.isSidebarVisible;
}
}
