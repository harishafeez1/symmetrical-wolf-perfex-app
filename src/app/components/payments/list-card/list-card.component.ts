import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController } from '@ionic/angular';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { PaymentApiService } from 'src/app/services/payment-api.service';
import { ViewPage as ViewPaymentPage} from 'src/app/pages/admin/payments/view/view.page';
import { CreatePage as UpdatePaymentPage } from 'src/app/pages/admin/payments/create/create.page';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    SharePipeModule,
    TranslateModule
  ],
  selector: 'app-payment-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit,OnDestroy {

  @Input() payments = [];
  @Input() isModal = false;
  private get_payment: Subscription;
  constructor(
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private router: Router,
    private paymentApi: PaymentApiService,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService,
    private animationService: AnimationService,
  ) { }

  ngOnInit() {
    this.get_payment = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_payment') {
        this.payments = this.payments.map(payment => {
          if (payment.id === response.data.id) {
            return response.data;
          }
          return payment;
        });
      }
    });

  }
  ngOnDestroy(): void {
    this.get_payment.unsubscribe();
  }
  async view(id: any, payment: any) {
    if(this.isModal) {
      const modal = await this.modalCtrl.create({
        component: ViewPaymentPage,
        mode: 'ios',
        componentProps: {
          paymentInfo: payment,
          paymentId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
      modal.onDidDismiss().then((modalFilters) => {
        console.log('modalFilters create =>', modalFilters);
        if(modalFilters.data){
         
        }
      });
      return await modal.present();
        
      } else {
    const extras: NavigationExtras = {
      state: payment
    };
    this.router.navigate(['admin/payments/view', id], extras);
  }
  }
 async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdatePaymentPage,
        mode: 'ios',
        componentProps: {
          paymentId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
  
      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    }else{
    this.navCtrl.navigateForward(['admin/payments/edit/', id]);
    }
  }
  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.paymentApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.payments.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
    }
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
