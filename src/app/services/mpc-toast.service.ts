import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MpcToastService {
  private myToast: any;

  constructor(public toastController: ToastController) { }

  async show(messageData: string, color = 'success', duration = 3000) {
    console.log('messageData =>', messageData);
    if (this.myToast) {
      this.hide();
    }
    const message = this.sanitizeMessage(messageData);
    console.log('message =>', message);
    this.myToast = await this.toastController.create({
      message: message,
      duration: duration,
      cssClass: 'mpc-toast mpc-toast-' + color,
      animated: true,
      mode: 'ios',
      buttons: [
        {
          text: '',
          icon: 'close-outline',
          role: 'cancel'
        }
      ],
      icon: 'alert-circle-outline'
    });
    this.myToast.present();
  }

  hide() {
    this.myToast = this.myToast.dismiss();
  }

  async showConnection(message: string, connected = false, color = 'success', duration = 3000 ) {
    if (this.myToast) {
      this.hide();
    }
    this.myToast = await this.toastController.create({
      message: message,
      duration: duration,
      // cssClass: 'mpc-toast mpc-toast-' + color,
      animated: true,
      mode: 'ios',
      icon: connected ? '/assets/icon/wifi-outline.svg' : '/assets/icon/wifi-off.svg'
    });
    this.myToast.present();
  }
  private sanitizeMessage(messageData: string): string {
    // Use a regular expression to remove any HTML tags from the message data
    return messageData.replace(/(<([^>]+)>)/gi, '');
  }
}
