import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { IonContent, ModalController } from '@ionic/angular';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { BASE_URL_KEY } from 'src/app/guards/base-url.guard';
import { AUTH_DATA } from 'src/app/services/authentication.service';
import { ChatService } from 'src/app/services/chat.service';
import { DatabaseService } from 'src/app/services/database.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { StorageService } from 'src/app/services/storage.service';

export var THREAD_DATA = 'thread-data';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  messages = [
    /* { sender: 'me', text: 'Hello!', time: '12:00 PM' },
    { sender: 'them', text: 'Hi, how are you?', time: '12:01 PM' },
    { sender: 'me', text: 'I am good, thanks!', time: '12:02 PM' } */
  ];
  newMessage = '';
  isMessageLoading = false;
  isLoading = false;
  myImageUrl = 'assets/images/user-placeholder.jpg';
  theirImageUrl = 'assets/images/icon.png';
  threadID: string = '';
  user_data: any;
  siteURL: string = '';
  apiUrl: string = '';
  secretKey: string = '';
  constructor(private modalCtrl: ModalController, private chatApi: ChatService,
    private mpcToast: MpcToastService,
    private storage: StorageService,
    private settingHelper: SettingsHelper,
    private databaseService: DatabaseService
  ) { 
   
  }
  async ngOnInit() {
    // this.initDatabase();
    const plt = Capacitor.getPlatform();
    await this.generateThreadPath();
    await this.getUserData();
        
    this.databaseService.chat.subscribe(async c =>{
      this.messages =  (plt !== 'web') ?  c.values : c;
      console.log('message 1 =>', this.messages);
      if(!this.messages.length){
        const info = await Preferences.get({ key: AUTH_DATA });
        const user_data = JSON.parse(info.value);
        const startMessage = `Hi ${user_data.data.firstname}, what can i do for you today?`;
        this.receiveMessage(startMessage);
      }else{
        this.scrollToBottom();
      }
      
    });
  }
  async generateThreadPath(){
    const CRM_CONNECTIONS = await this.storage.getObject(BASE_URL_KEY);
    if (CRM_CONNECTIONS != null) {
      for (let connection of CRM_CONNECTIONS) {
        if (connection.active == true) {
          THREAD_DATA = connection.identifier + 'thread-data';
        }
      }
    }
  }
  async getUserData() {
    const token = await Preferences.get({ key: AUTH_DATA });
    this.user_data = JSON.parse(token.value);
    console.log('THREAD_DATA =>', THREAD_DATA);
    const thread = await Preferences.get({ key: THREAD_DATA });
    const thread_data = JSON.parse(thread.value);
    console.log('thread_data =>', thread_data);
        const currentDate = new Date();
        const dayDifference = this.calculateDayDifference(currentDate.toISOString(), thread_data ? thread_data.date : currentDate.toISOString());
        console.log('dayDifference =>', dayDifference);
        if(dayDifference > 6){
          Preferences.remove({key: THREAD_DATA });
          this.threadID = '';
          this.databaseService.removeChat();
          // this.databaseService.chat.next([]);
        }else{
          this.threadID = thread_data ? thread_data.thread_id : '';
        }
    const _storage = await this.storage.getObject(BASE_URL_KEY);
    if (_storage !== null) {
      const findAccount = _storage.find(s => s.active == true);
      this.siteURL = findAccount ? findAccount.url + '/'  : '';
      this.apiUrl = this.siteURL + 'mpc_ai_chatbot/';
    }
    this.settingHelper.settings.subscribe((response) => {
      console.log(response);
      const settings = response;
      this.secretKey = settings.secret_key;
    });
   /*  const startMessage = `Hi ${this.user_data.data.firstname}, what can i do for you today?`;
    this.receiveMessage(startMessage); */
    if(!this.threadID){
      this.getThreadID();
    }
  }

  
  calculateDayDifference(date1, date2) {
    // Parse the dates and set them to UTC midnight to avoid timezone issues
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);

    console.log('firstDate =>', firstDate, ' : secondDate =>', secondDate);
    
    const utcFirstDate = Date.UTC(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());
    const utcSecondDate = Date.UTC(secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate());

    // Calculate the difference in time (milliseconds)
    const timeDifference =  utcFirstDate - utcSecondDate;
    
    // Convert milliseconds to days
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const dayDifference = Math.floor(timeDifference / millisecondsPerDay);

    return dayDifference;
}

  async initDatabase(){
   await this.databaseService.initializePlugin();
  }
  /*  sendMessage() {
 
     if (this.newMessage.trim()) {
       this.messages.push({
         sender: 'me',
         text: this.newMessage,
         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
       });
       this.newMessage = '';
       this.scrollToBottom();
       this.isMessageLoading = true;
       // Simulate receiving a response
       setTimeout(() => {
         this.receiveMessage();
         this.isMessageLoading = false;
       }, 1000);
     }
   } */

  
  

  getThreadID() {
    this.isLoading = true;
    this.chatApi.start().subscribe({
      next: (res: any) => {
        if (res.thread_id) {
          this.threadID = res.thread_id;
          const data = {
            thread_id: res.thread_id,
            date: new Date()
          }
          Preferences.set({ key: THREAD_DATA, value: JSON.stringify(data) })
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        sender: 'me',
        message: this.newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.databaseService.addChat('me', this.newMessage);
      this.scrollToBottom();
      this.isMessageLoading = true;
      this.chatApi.chat(this.threadID, this.newMessage, this.user_data, this.siteURL, this.secretKey, this.apiUrl).subscribe({
        next: (res: any) => {
          if (res.response) {
            this.receiveMessage(res.response);
            this.isMessageLoading = false;
          } else {
            this.mpcToast.show(res.message, 'danger');
          }
        }
      });
      this.newMessage = '';
    }
  }
  receiveMessage(msg: string) {
    this.messages.push({
      sender: 'them',
      message: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.databaseService.addChat('them', `${msg}`);
    this.scrollToBottom();
  }
  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom(100);
    }, 100);
  }
  close() {
    this.modalCtrl.dismiss();
  }
  formatInvoiceSummary(summary: string): string {
    // Convert newlines to <br> tags
    return summary.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*?)<br>/g, '<h3>$1</h3>');
  }

}
