import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { CreateReminderPage } from 'src/app/pages/admin/invoices/modals/create-reminder/create-reminder.page';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    SharePipeModule
  ],
  selector: 'app-reminder-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit {
  @Input() reminders = [];
  @Output() reminderUpdateResponse = new EventEmitter<boolean>(false)
  constructor(public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private reminderApi: ReminderApiService,
    private mpcAlert: MpcAlertService) { }

  ngOnInit() {}

  async addEditReminder(reminder: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateReminderPage,
      breakpoints: [0, 0.25, 0.5, 0.75, 0.90, 1.0],
      initialBreakpoint: 1.0,
      mode: 'ios',
      componentProps: {
        rel_type: reminder.rel_type,
        rel_id: reminder.rel_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.reminderUpdate(true);
       
      }
    });
    return await modal.present();
  }


  async deleteReminder(id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.reminderApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.reminders.splice(index, 1); //remove from list
          }
        }, error: () => {}
      });
    }
  }

  reminderUpdate(value: boolean){
    this.reminderUpdateResponse.emit(value)
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

}
