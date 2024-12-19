import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeMarket } from '@capgo/native-market';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

import { AlertController, AlertOptions, IonicSafeString, Platform } from '@ionic/angular';
import { AppUpdate } from '../interfaces/app-update';
import { AuthenticationService } from './authentication.service';
import { TranslateService } from '@ngx-translate/core';

export const SUPPORTED_MODULE_VERSION = '1.3.0';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    public authService: AuthenticationService,
    private plt: Platform,
    private translate: TranslateService
  ) { }

  async checkForUpdate() {
    // console.log('checking for update');

    this.http.get('https://t29zrfey40.execute-api.us-east-1.amazonaws.com/app-update.json').subscribe({
      next: async (info: AppUpdate) => {
        if (info.app_maintenance_enabled == true) {
          this.presentAlert(info.app_maintenance_title, info.app_maintenance_msg);
        } else {
          if (!this.plt.is('desktop')) {
            if (info.app_update_enabled == true) {
              const appVersion = (await App.getInfo()).version;
              // 3.9.2
              const splitedVersion = appVersion.split('.');
              const serverVersion = info.current_app_version.split('.');
              console.log(splitedVersion, serverVersion);
              console.log('major update', (parseInt(serverVersion[0]) > parseInt(splitedVersion[0])), (parseInt(serverVersion[1]) > parseInt(splitedVersion[1])));
              console.log('minor update', (serverVersion[2] > splitedVersion[2]));
              console.log('server version: ', info.current_app_version);
              console.log('app version: ', appVersion);
              if (parseInt(serverVersion[0]) > parseInt(splitedVersion[0]) || parseInt(serverVersion[1]) > parseInt(splitedVersion[1])) {
                this.presentAlert(info?.major_update_title, info?.major_update_msg, info?.major_update_btn);
              } else if (this.version_compare(appVersion, info.current_app_version) == -1) {
                this.presentAlert(info?.minor_update_title, info?.minor_update_msg, info?.minor_update_btn, true);
              }
            }
          }
        }
      }
    });
  }

  openAppStoreEntry() {
    console.log('open Store');
    if (this.plt.is('android')) {
      NativeMarket.openStoreListing({
        appId: 'au.com.coldxpress'
      });
    } else {
      Browser.open({
        url: 'itms-apps://itunes.apple.com/app/id376771144',
        presentationStyle: 'popover'
      });
    }
  }

  async presentAlert(header, message, buttonText = '', allowClose = false, openCRM = false) {
    const buttons = [];

    if (buttonText != '') {
      buttons.push({
        text: buttonText,
        handler: () => {
          if (!openCRM) {
            this.openAppStoreEntry();
          } else {
            Browser.open({
              url: this.authService.BASE_URL,
              presentationStyle: 'popover'
            })
          }

          return false;
        }
      });
    }

    if (allowClose) {
      buttons.push({
        text: this.translate.instant('maybe_later'),
        role: 'cancel'
      });
    }

    const alertOptions: AlertOptions = {
      mode: 'ios',
      cssClass: 'updates-alert',
      subHeader: 'Updates',
      header,
      message: new IonicSafeString(message),
      buttons,
      backdropDismiss: allowClose
    };

    const alert = await this.alertCtrl.create(alertOptions);

    await alert.present();
  }

  version_compare(a: any, b: any) {
    if (a === b) {
      return 0;
    }

    var a_components = a.split(".");
    var b_components = b.split(".");

    var len = Math.min(a_components.length, b_components.length);

    // loop while the components are equal
    for (var i = 0; i < len; i++) {
      // A bigger than B
      if (parseInt(a_components[i]) > parseInt(b_components[i])) {
        return 1;
      }

      // B bigger than A
      if (parseInt(a_components[i]) < parseInt(b_components[i])) {
        return -1;
      }
    }

    // If one's a prefix of the other, the longer one is greater.
    if (a_components.length > b_components.length) {
      return 1;
    }

    if (a_components.length < b_components.length) {
      return -1;
    }

    // Otherwise they are the same.
    return 0;
  }

  checkModuleUpdate(settings) {
    const app_supported_version = SUPPORTED_MODULE_VERSION.split('.');
    const module_version = settings?.api_module_version.split('.');
    // console.log(app_supported_version, module_version);

    // console.log('major Module update', (parseInt(module_version[0]) < parseInt(app_supported_version[0])), (parseInt(module_version[1]) > parseInt(app_supported_version[1])));
    // console.log('minor Module update', (module_version[2] < app_supported_version[2]));
    // console.log('Module version: ', settings?.api_module_version);
    // console.log('app module version: ', SUPPORTED_MODULE_VERSION);
    if (parseInt(module_version[0]) < parseInt(app_supported_version[0])) {
      this.presentAlert('New Major Module Update', 'Your CRM is currently working on <b>MPC Mobile APP Connector ' + settings?.api_module_version + '</b> which is not compatible anymore with the current version of app please update your module to at-least <b>MPC Mobile APP Connector ' + SUPPORTED_MODULE_VERSION + '</b> or higher to keep using the Mobile APP.', 'Update Now', false, true);
    } else if (this.version_compare(settings?.api_module_version, SUPPORTED_MODULE_VERSION) == -1) {
      this.presentAlert('New Module update', 'Your CRM is currently working on <b>MPC Mobile APP Connector ' + settings?.api_module_version + '</b>.<br><br> Please update your module to the latest version <b>MPC Mobile APP Connector ' + SUPPORTED_MODULE_VERSION + '</b> or higher to get some bug fixes and/or new features<br><br><b>Note:</b> your app may crash on some point if you don\'t update the module.', 'Update Now', true, true);
    }
  }

}
