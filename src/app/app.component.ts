import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { google } from 'googleapis';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
declare const gapi: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'care';




  constructor(private userService: UserService, private http: HttpClient) {}
  users!: any[];
  private calendarId = 'primary';
  ngOnInit(): void {
    this.userService.getAllMember().subscribe((data) => {
      console.log(data);

      this.users = data;
    });

    console.log('Loading Google Calendar API client...');
    gapi.load('client:auth2', () => {
      gapi.client.init({

        clientId: '885100642580-e3vgiqs1arrhdvudckce7q7jckio618f.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar',
        
      }).then(() => {
        console.log('Google Calendar API client loaded');
        const auth2 = gapi.auth2.getAuthInstance();
        console.log("auth2",auth2);
        
        auth2.signIn().then(() => {
          console.log('User signed in');
        });
      }).catch((err: any) => {
        console.error('Error initializing Google Calendar API client', err);
      });
    });
    
  }
  createEvent() {
    debugger
    const event = {
      'summary': 'Test Event',
      'start': {
        'dateTime': '2023-09-10T09:00:00',
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'dateTime': '2023-010-10T17:00:00',
        'timeZone': 'America/Los_Angeles'
      },
      'reminders': {
        'useDefault': true
      }
    };
    gapi.client.calendar.events.insert({
      calendarId: this.calendarId,
      resource: event,
    }).then((response: any) => {
      console.log('Event created: ', response.result);
    }).catch((err: any) => {
      console.error('Error creating event: ', err);
    });
  }

  generatePdf() {
    var data = [];
    var sr = 1;
    var headerArray = [
      { text: 'id ', bold: true },
      { text: 'name ', bold: true },
      { text: 'user ', bold: true },
    ];
    data.push(headerArray);

    this.users.forEach((e) => {
      data.push([
        { text: e.id, bold: false },
        { text: e.name, bold: false },
        { text: e.email, bold: false },
      ]);
    });

    let docDefinition = {
      content: [
        {
          text: 'Hospital Name: ' + 'shree clinic',

          style: {
            color: 'red',
            fontSize: 30, 
            margin:100,
            bold: true,
            
    
          },
        },
       
        {
          text: 'Dr Name: ' + 'Deepak sir',

          style: 'sectionHeader',
        },
        {
          text: 'City: ' + 'Pune',

          style: 'sectionHeader',
        },
        {
          text: 'Addresss: ' + 'hinjewadi ',

          style: 'sectionHeader',
        },
      ],
    };
    pdfMake.createPdf(docDefinition).download('user.pdf');
  }

  sendEmailWithPdf(pdf: Blob, email: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const body = {
      email: email,
      pdf: pdf,
    };

    return this.http.post('/api/send-email', body, { headers: headers });
  }

  onSendEmail() {
    var data = [];
    var sr = 1;
    var headerArray = [
      { text: 'id ', bold: true },
      { text: 'name ', bold: true },
      { text: 'user ', bold: true },
    ];
    data.push(headerArray);

    this.users.forEach((e) => {
      data.push([
        { text: e.id, bold: false },
        { text: e.name, bold: false },
        { text: e.email, bold: false },
      ]);
    });

    let docDefinition = {
      content: [
        {
          text: 'Hospital Name: ' + 'shre clinic',

          style: 'sectionHeader',
        },
        {
          text: 'City: ' + 'Pune',

          style: 'sectionHeader',
        },
        {
          text: 'Dr name: ' + 'Deepak sir',

          style: 'sectionHeader',
        },
        {
          style: 'tableMargins',
          layout: 'noBorders',
          table: {
            body: data,
            widths: ['auto', 90, 90, 90, 90, 90, 90, 90, 90, 90],
          },
        },
      ],
    };
    pdfMake.createPdf(docDefinition).getBlob((pdf) => {
      this.sendEmailWithPdf(pdf, 'prashantdeokar0121@gmail.com').subscribe(
        (response) => {
          console.log('Email sent successfully!');
        },
        (error) => {
          console.error('Error sending email:', error);
        }
      );
    });
  }
  
  addEvent() {
   
  }
}
