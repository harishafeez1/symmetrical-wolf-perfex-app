import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PermissionStatus, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { NavController, Platform } from '@ionic/angular';
import { BASE_URL_KEY } from '../guards/base-url.guard';
import { AuthenticationService } from './authentication.service';
import { NotificationApiService } from './notification-api.service';
import { StorageService } from './storage.service';
// export var NOTIFICATION_TOKEN = '';
export var NOTIFICATION_TOKEN = 'ebtZq4JkRm-3JCv0o8OAmv:APA91bElyiyp2VK_oKb6WR-2xBMbApOb46hWCtElPsUAXe_U0rWkLRe57cqprDxlazWoMuDpum2xjH73hwgKwJqjTbAU1WELRUZUfqMtxsKSC-7VtD1x6426Lx9vEObEgzN4oe-DB3aT';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  tokenRegistrationEvent: any;
  
  accounts = [];

  constructor(
    private router: Router,
    private storage: StorageService,
    public authService: AuthenticationService,
    private notificationApi: NotificationApiService,
    private platform: Platform,
    private zone: NgZone
  ) { }

  initPush() {
    console.log('initPush Capacitor.getPlatform() =>', Capacitor.getPlatform());
    this.platform.ready().then(async () => {
      if (Capacitor.getPlatform() !== 'web') {
        this.registerPush();
      }
    });
  }

  async registerPush() {

    PushNotifications.checkPermissions().then(async (permission) => {
      if (permission.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
      } else if (permission.receive === 'prompt') {
        await PushNotifications.requestPermissions();
      } else {
        console.log('no permission found');
      }
    });

    if (!this.tokenRegistrationEvent) {
      this.tokenRegistrationEvent = async (token: Token) => {
        const device_info = await Device.getInfo();
        const device_id = await Device.getId();
        console.log(device_id);
        NOTIFICATION_TOKEN = token.value;
        this.notificationApi.storeDevice({
          token: token.value,
          device_id: device_id?.identifier,
          additional_data: JSON.stringify(device_info)
        }).subscribe({
          next: (response: any) => {
            console.log(response);
          }
        });
        console.log('My token: ' + JSON.stringify(token));
      };
      await PushNotifications.addListener('registration', this.tokenRegistrationEvent);

      await PushNotifications.addListener('registrationError', err => {
        console.error('Registration error: ', err.error);
      });

      await PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push notification received: ', notification);
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification.actionId, notification);
        const _notification = notification.notification.data;
        console.log('Action performed: ' + JSON.stringify(notification));
        this.platform.ready().then(async () => {
          if (_notification?.action_url) {
            if (_notification?.domain != this.authService.BASE_URL) {
              this.accounts = await this.storage.getObject(BASE_URL_KEY);

              await this.switchAccount({
                url: _notification?.domain,
                identifier: _notification?.identifier
              });
            }
            console.log(_notification?.action_url.indexOf('#taskid='));

            let ACTION_URL = _notification?.action_url.replace('#taskid=', 'tasks/view/');
            ACTION_URL = ACTION_URL?.replace('#leadid=', 'leads/view/');
            ACTION_URL = ACTION_URL?.replace('proposals/list_proposals/', 'proposals/view/');
            ACTION_URL = ACTION_URL?.replace('invoices/invoice/', 'invoices/view/');
            ACTION_URL = ACTION_URL?.replace('invoices/list_invoices/', 'invoices/view/');
            
            this.navigateTo(`/admin/${ACTION_URL}`);
            
            if (_notification?.action_url.indexOf('#taskid=') != -1) {
              window.dispatchEvent(new CustomEvent('admin:task_updated'));
            }
          }
        });
      });
    }
  }

  async switchAccount(account) {
    for (let _account in this.accounts) {
      this.accounts[_account].active = false;
      if (this.accounts[_account].identifier == account.identifier) {
        this.accounts[_account].active = true;
      }
    }

    await this.storage.setObject(BASE_URL_KEY, this.accounts);
    this.authService.BASE_URL = account.url;
    this.authService.IDENTIFIER = account.identifier;
    await this.authService.loadAuthData();
    window.dispatchEvent(new CustomEvent('admin:account_switched'));
  }

  navigateTo(url: string): void {
    this.zone.run(() => {
      this.router.navigateByUrl(url);
    });
  }
}