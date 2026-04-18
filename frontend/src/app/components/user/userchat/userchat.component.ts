import { Component, EventEmitter, Output, HostListener, OnInit  } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute , Router} from '@angular/router';
import { HttpClient, HttpClientModule,HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, interval, Subscription } from 'rxjs';
import { UserheaderComponent } from '../userheader/userheader.component';
import { UsersidebarComponent } from '../usersidebar/usersidebar.component';
interface Message   {
  username: string;
  channelName: string;
  text: string;
  timestamp: Date; // Add timestamp field
  file?: string; // Adjusted to store file path as string

}


@Component({
  selector: 'app-userchat',
  standalone: true,
  imports: [
    UserheaderComponent,
    UsersidebarComponent,
    FormsModule,
    CommonModule,
    HttpClientModule,
    MatIconModule
    
  ],
  templateUrl: './userchat.component.html',
  styleUrls: ['./userchat.component.css']
})
export class UserchatComponent implements OnInit {
  channelName: string = 'user chat'; // Default channel name
  orgname: string = '';
  email:string='';
  messages: Message [] = [];
  filteredMessages: Message[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  noResults: boolean = false;
  showSearch: boolean = false;
  showOptionsPanel: boolean = false;
  invitedUsers: Message [] = [];
  username: string = ''; 
  fileToUpload: File | null = null; // Declare fileToUpload property
  private apiUrl = 'http://localhost:3000'; // Your API URL
    private objectUrl: string | null = null;
    private pollingSubscription: Subscription | null = null;



  constructor(private route: ActivatedRoute, private http: HttpClient, private router:Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['channelName']) {
        this.channelName = params['channelName'];
      }
      if (params['username']) {
        this.username = params['username'];
      }
      if (params['orgname']) {
        this.orgname = params['orgname'];
      }
      if (params['email']) {
        this.email = params['email']; // Store the email from the URL
    
      }
      
      this.fetchInvitedUsers();
      this.fetchMessages();
      this.startPolling();

    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // Stop polling on component destroy
    }
  }

  fetchInvitedUsers(): void {
    this.http.get<Message[]>(`${this.apiUrl}/invited-usersp`)
      .pipe(
        catchError(error => {
          console.error('Error fetching invited users:', error);
          return throwError('Could not fetch invited users');
        })
      )
      .subscribe(
        (data) => {
          this.invitedUsers = data.filter(user => user.channelName === this.channelName);
        // Add the admin user to the invitedUsers list
        this.invitedUsers.push({
          username: 'Admin',
          channelName: this.channelName,
          text: '',
          timestamp: new Date()
        });
      }
    );
  }

  fetchMessages(): void {
    this.http.get<Message[]>(`${this.apiUrl}/messages/${this.channelName}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching messages:', error);
          return throwError('Could not fetch messages');
        })
      )
      .subscribe(
        (data) => {
          this.messages = data.map(message => ({
            ...message,
            file: message.file ? `${this.apiUrl}/uploads/${message.file}` : ''
          }));
          this.filteredMessages = [...this.messages]; // Initialize filteredMessages
        }
      );
  }
  startPolling(): void {
    this.pollingSubscription = interval(5000) // Poll every 5 seconds
      .pipe(
        switchMap(() => this.http.get<Message[]>(`${this.apiUrl}/messages/${this.channelName}`))
      )
      .subscribe(
        (data) => {
          this.messages = data.map(message => ({
            ...message,
            file: message.file ? `${this.apiUrl}/uploads/${message.file}` : ''
          }));
          this.filteredMessages = [...this.messages];
        },
        error => {
          console.error('Error during polling:', error);
        }
      );
  }
  

  toggleOptionsPanel(): void {
    this.showOptionsPanel = !this.showOptionsPanel;
  }


  leaveChannel(): void {
    if (!confirm('Are you sure you want to leave the channel?')) return;

    this.http.post(`${this.apiUrl}/leave-channel`, { email: this.email })
      .pipe(
        catchError(error => {
          console.error('Error leaving channel:', error);
          alert('An error occurred while leaving the channel.');
          return throwError('Could not leave channel');
        })
      )
      .subscribe(
        (response) => {
          console.log('Left channel successfully:', response);
          alert('You have left the channel.');
          this. router.navigate(['']);
         
        }
      );
  }

     uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;

      const formData = new FormData();
      formData.append('file', file);

      this.http.post(`${this.apiUrl}/upload`, formData).subscribe(response => {
        console.log('File upload response:', response);
      }, error => {
        console.error('File upload error:', error);
      });
    }
  }

  triggerFileInput(): void {
    const fileInput: HTMLElement | null = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }
  downloadImage(file: any) {
    const url = this.getFileUrl(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.getFileName(file);
    link.click();
  }
  
 sendMessage(): void {
    if (this.newMessage.trim() || this.fileToUpload) {
      
      const message: Message = {
        username: this.username,
        channelName: this.channelName,
        text: this.newMessage.trim(),
        timestamp: new Date(),
        file: this.fileToUpload ? this.fileToUpload.name : ''
      };

      // Upload the file
      if (this.fileToUpload) {
        const formData = new FormData();
        formData.append('file', this.fileToUpload);
        this.http.post(`${this.apiUrl}/upload`, formData).subscribe(response => {
          console.log('File uploaded successfully:', response);
          this.fileToUpload = null; // Clear the file after upload
        });
      }

      this.http.post(`${this.apiUrl}/messages`, message).pipe(
        catchError(error => {
          console.error('Message sending error:', error);
          return throwError('Could not send message');
        })
      ).subscribe(() => {
        console.log('Message sent successfully');
        this.fetchMessages();
        this.newMessage = ''; // Clear the message input
      });

      
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
      this.filteredMessages = [...this.messages]; // Reset to all messages
      this.noResults = false;
    }
  }
  searchMessages(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredMessages = [...this.messages]; // Show all messages
      this.noResults = false;
      return;
    }
    
    const lowerCaseQuery = this.searchQuery.toLowerCase();
    this.filteredMessages = this.messages.filter(message =>
      message.text.toLowerCase().includes(lowerCaseQuery)
    );

    this.noResults = this.filteredMessages.length === 0;
  }

  highlightSearchTerm(text: string): string {
    if (!this.searchQuery.trim()) {
      return text;
    }
    const searchQuery = this.searchQuery.trim();
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

 isImage(fileName: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  }

  isVideo(fileName: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(fileName);
  }

  isDocument(fileName: string): boolean {
    return /\.(pdf|docx?|xlsx?)$/i.test(fileName);
  }

// Assuming 'message.file' contains just the filename, not the full URL
getFileUrl(fileName: string): string {
  // Check if the fileName already includes the full URL prefix
  if (fileName.startsWith(`${this.apiUrl}/uploads/`)) {
    fileName = fileName.substring(`${this.apiUrl}/uploads/`.length);
  }
  return fileName ? `${this.apiUrl}/uploads/${fileName}` : '';
}

getFileName(filePath: string): string {
  return filePath ? filePath.split('/').pop() || 'No file selected' : 'No file selected';
}
}