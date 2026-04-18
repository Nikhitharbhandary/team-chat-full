import { Component, EventEmitter, Output, HostListener, OnInit  } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule , HttpErrorResponse} from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, interval, Subscription } from 'rxjs';
interface Message   {
  username: string;
  channelName: string;
  text: string;
  timestamp: Date; // Add timestamp field
  file?: string; // Adjusted to store file path as string
}

@Component({
  selector: 'app-adminchat',
  standalone: true,
  imports: [
    SidebarComponent,
HeaderComponent,
FormsModule,
CommonModule,
HttpClientModule,
MatIconModule

  ],
  templateUrl: './adminchat.component.html',
  styleUrl: './adminchat.component.css'
})
export class AdminchatComponent implements OnInit {
  channelName: string = 'Admin Chat'; // Default channel name
  orgname: string = '';
  userEmail: string = '';
  messages: Message [] = [];
  filteredMessages: Message[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  noResults: boolean = false;
  showSearch: boolean = false;
  showOptionsPanel: boolean = false;
  invitedUsers: Message [] = [];
  private apiUrl = 'http://192.168.43.178:3000'; // Your API URL
  fileToUpload: File | null = null; // Declare fileToUpload property
  private objectUrl: string | null = null;
  private pollingSubscription: Subscription | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['channelName']) {
        this.channelName = params['channelName'];
        this.orgname = params['orgname'] || '';
        this.userEmail = params['email'] || '';
        this.fetchInvitedUsers();
        this.fetchMessages();
        this.startPolling();
        console.log("orgname:",this.orgname);
        console.log("email:",this.userEmail);
       
      }
    });
  }
  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // Stop polling on component destroy
    }
  }



  fetchInvitedUsers(): void {
    this.http.get<Message[]>(`http://192.168.43.178:3000/invited-users`, {
      params: { channelName: this.channelName, orgname: this.orgname, email: this.userEmail }
    })
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
    this.http.get<Message[]>(`http://192.168.43.178:3000/messages/${this.channelName}`)
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
        switchMap(() => this.http.get<Message[]>(`http://192.168.43.178:3000/messages/${this.channelName}`))
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

  
  toggleOptionsPanel(): void {
    this.showOptionsPanel = !this.showOptionsPanel;
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
        username: 'Admin',
        channelName: this.channelName,
        text: this.newMessage.trim(),
        timestamp: new Date(),
        file: this.fileToUpload ? this.fileToUpload.name : ''
      };

      // Upload the file
      if (this.fileToUpload) {
        const formData = new FormData();
        formData.append('file', this.fileToUpload);
        this.http.post(`http://192.168.43.178:3000/upload`, formData).subscribe(response => {
          console.log('File uploaded successfully:', response);
          this.fileToUpload = null; // Clear the file after upload
        });
      }

      this.http.post(`http://192.168.43.178:3000/messages`, message).pipe(
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