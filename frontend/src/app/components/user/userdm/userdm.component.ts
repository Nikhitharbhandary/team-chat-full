import { Component, EventEmitter, Output, HostListener, OnInit  } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute , Router} from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, interval, Subscription } from 'rxjs';
import { UserheaderComponent } from '../userheader/userheader.component';
import { UsersidebarComponent } from '../usersidebar/usersidebar.component';
interface Message   {
  username: string;
  name: string;
  text: string;
  timestamp: Date; // Add timestamp field
  file?: string; // Adjusted to store file path as string
}


@Component({
  selector: 'app-userdm',
  standalone: true,
  imports: [
    UserheaderComponent,
    UsersidebarComponent,
    FormsModule,
    CommonModule,
    HttpClientModule,
    MatIconModule
  ],
  templateUrl: './userdm.component.html',
  styleUrl: './userdm.component.css'
})
export class UserdmComponent  implements OnInit {
  name: string = 'Admin'; // Add username property
  channelName: string = '' // Default channel name
  orgname: string = '';
  username: string = '';
  email:string='';
  messages: Message [] = [];
  filteredMessages: Message[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  noResults: boolean = false;
  showSearch: boolean = false;
  showOptionsPanel: boolean = false;
  invitedUsers: Message [] = [];
  private apiUrl = 'http://localhost:3000'; // Your API URL
  fileToUpload: File | null = null; // Declare fileToUpload property
   private objectUrl: string | null = null;
   private pollingSubscription: Subscription | null = null;
  constructor(private route: ActivatedRoute, private http: HttpClient, private router:Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Fetch parameters from queryParams
      this.username = params['username'] || '';
      this.channelName = params['channelName'] || '';
      this.orgname = params['orgname'] || '';
      this.email = params['email']; // Store the email from the URL
      if (this.username && this.name) {
        this.fetchMessages(); // Fetch messages when component initializes
        this.startPolling();
      } else {
        console.warn('Username or name is missing in query parameters');
      }
    });
  }
  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // Stop polling on component destroy
    }
  }


  fetchMessages(): void {
    const senderReceiver = [ 'Admin',this.username].sort().join('');
    this.http.get<Message[]>(`${this.apiUrl}/usermessages?senderReceiver=${senderReceiver}`)
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
    const senderReceiver = [ 'Admin',this.username].sort().join('');
    this.pollingSubscription = interval(5000) // Poll every 5 seconds
      .pipe(
        switchMap(() => this.http.get<Message[]>(`${this.apiUrl}/usermessages?senderReceiver=${senderReceiver}`))
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

sendMessage(): void {
    if (this.newMessage.trim() !== '' || this.fileToUpload) {
       const message: Message = {
        username: this.username,
        name:'Admin',
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
      this.http.post(`${this.apiUrl}/usermessages`, message).pipe(
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
downloadImage(file: any) {
  const url = this.getFileUrl(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = this.getFileName(file);
  link.click();
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