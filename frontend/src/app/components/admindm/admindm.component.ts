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
  name: string;
  text: string;
  timestamp: Date; // Add timestamp field
  file?: string; // Adjusted to store file path as string
}

@Component({
  selector: 'app-admindm',
  standalone: true,
  imports: [
    SidebarComponent,
HeaderComponent,
FormsModule,
CommonModule,
HttpClientModule,
MatIconModule
  ],
  templateUrl: './admindm.component.html',
  styleUrl: './admindm.component.css'
})
export class AdmindmComponent implements OnInit {
  name: string = 'default'; // Add username property
  channelName: string = '' // Default channel name
  orgname: string = '';
  userEmail: string = '';
  messages: Message [] = [];
  filteredMessages: Message[] = [];
  newMessage: string = '';
   private objectUrl: string | null = null;

  searchQuery: string = '';
  noResults: boolean = false;
  showSearch: boolean = false;
  showOptionsPanel: boolean = false;
  invitedUsers: Message [] = [];
  private apiUrl = 'http://192.168.43.178:3000'; // Your API URL
  fileToUpload: File | null = null; // Declare fileToUpload property
  private pollingSubscription: Subscription | null = null;


  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['name']) {
        this.channelName = params['channelName'];
        this.orgname = params['orgname'] || '';
        this.userEmail = params['email'] || '';
        this.name = params['name'] || 'default'; // Default fallback if 'name' is not provided
      console.log("orgname:",this.orgname);
        this.fetchMessages();
        this.startPolling();
       
      }
    });
    
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  
  }


 
  fetchMessages(): void {
    const senderReceiver = [this.name, 'Admin'].sort().join('');
    this.http.get<Message[]>(`${this.apiUrl}/usermessages?senderReceiver=${senderReceiver}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching messages:', error);
          return [];
        })
      )
      .subscribe(data => {
        this.messages = data.map(message => ({
          ...message,
          file: message.file ? `${this.apiUrl}/uploads/${message.file}` : ''
        }));
        this.filteredMessages = [...this.messages];
      });
  }

  startPolling(): void {
    const senderReceiver = [this.name, 'Admin'].sort().join('');
    const url = `${this.apiUrl}/usermessages?senderReceiver=${senderReceiver}`;
    console.log('Polling URL:', url);
  
    this.pollingSubscription = interval(5000)
      .pipe(
        switchMap(() => this.http.get<Message[]>(url)),
        catchError(error => {
          console.error('Error during polling:', error);
          return throwError('Polling error');
        })
      )
      .subscribe(data => {
        this.messages = data.map(message => ({
          ...message,
          file: message.file ? `${this.apiUrl}/uploads/${message.file}` : ''
        }));
        this.filteredMessages = [...this.messages];
        console.log('Poll response ED:', data); // Log the data received
      });
  }
  
  toggleOptionsPanel(): void {
    this.showOptionsPanel = !this.showOptionsPanel;
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
  sendMessage(): void {
    if (this.newMessage.trim() !== '' || this.fileToUpload) {
       const message: Message = {
        username: 'Admin',
        name:this.name,
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
