import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class MpcAlertService {

  constructor(private alertController: AlertController,
    private translate: TranslateService) { }

  async deleteAlertMessage(){
    const alert = await this.alertController.create({
      header: this.translate.instant('delete_item_header_text'),
      subHeader: this.translate.instant('delete_item_sub_header_text'),
      mode: 'ios',
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          handler: () => {
          },
        },
        {
          text: this.translate.instant('_delete'),
          role: 'confirm',
          handler: () => {
          },
        },
      ],
    });
  
    await alert.present();

    const result = await alert.onDidDismiss();

    if (result.role === 'cancel') {
      return false;
    } else if (result.role === 'confirm') {
      return true;
    }
  }
}
