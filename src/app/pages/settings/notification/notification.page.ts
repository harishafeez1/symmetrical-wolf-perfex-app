import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Device } from '@capacitor/device';
import { NavController, ToastController } from '@ionic/angular';
import { NOTIFICATION_TOKEN } from 'src/app/services/fcm.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { NotificationApiService } from 'src/app/services/notification-api.service';
import { SettingApiService } from 'src/app/services/setting-api.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  formGroup: FormGroup;
  notifications: any;
  isLoading = false;
  device_id: string;

  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private mpcToast: MpcToastService,
    private settingApi: SettingApiService
  ) {
    // this.getNotifications();
  }

  getNotifications() {
    this.isLoading = true;
    this.settingApi.get('notification', this.device_id).subscribe({
      next: (response: any) => {
        this.notifications = response.data;
        const controls = [];
        for (let key in response.data) {
          if (this.formGroup.controls[key]) {
            console.log(response.data[key]);
            controls[key] = response.data[key];
          }
        }
        this.formGroup.patchValue(controls);
  
        this.loadApiData();
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  loadApiData() {
    
  }

  async ngOnInit() {
    this.formGroup = this.fb.group({
      ticket_notification: [true],
      invoice_notification: [true],
      task_notification: [true],
      lead_notification: [true],
      proposal_notification: [true],
      project_notification: [true]
    });

    const device = await Device.getId();
    this.device_id = device?.identifier;

    this.getNotifications();
  }

  updateSetting(event: any = false) {
    console.log(event);
    this.settingApi.update('notification', this.device_id, this.formGroup.value).subscribe({
      next: (response: any) => {
        if (!response.status) {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }
}
