import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SubscriptionApiService } from 'src/app/services/subscription-api.service';
import { CreatePage as UpdateSubscriptionPage } from '../../../pages/admin/subscriptions/create/create.page';
import { ViewPage as ViewSubscriptionPage } from '../../../pages/admin/subscriptions/view/view.page';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriptionsHelper } from 'src/app/classes/subscriptions-helper';
import { AnimationService } from 'src/app/services/animation.service';
@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    SharePipeModule,
    TranslateModule
  ],
  selector: 'subscription-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit,OnDestroy {
  @Input() subscriptions = [];
  @Input() isModal = false;
  private get_subscription: Subscription;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private subscriptionApi: SubscriptionApiService,
    public authService: AuthenticationService,
    private modalCtrl: ModalController,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService,
    public subscriptionHelper: SubscriptionsHelper,
    private animationService: AnimationService,
  ) { }

  ngOnInit() {
    this.get_subscription = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_subscription') {
        const checkSubscription =  this.subscriptions.find(subscription => subscription.id == response.data.id);
        if(checkSubscription){
          this.subscriptions = this.subscriptions.map(subscription => {
            if (subscription.id === response.data.id) {
              return response.data;
            }
            return subscription;
          });
        }else{
          this.subscriptions.unshift(response.data);
        }
      }
    });
   }
   ngOnDestroy(): void {
    this.get_subscription.unsubscribe();
  }

  async view(id: any, subscription: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: ViewSubscriptionPage,
        mode: 'ios',
        componentProps: {
          subscriptionInfo: subscription,
          subscriptionId: id,
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
    }else{
      const extras: NavigationExtras = {
        state: subscription
      };
      this.router.navigate(['admin/subscriptions/view', id], extras);
    }
  }

  async edit(id: any) {
    if (this.isModal) {
      const modal = await this.modalCtrl.create({
        component: UpdateSubscriptionPage,
        mode: 'ios',
        componentProps: {
          subscriptionId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    } else {
      this.router.navigate(['admin/subscriptions/edit/', id]);
    }
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.subscriptionApi.delete(id).subscribe({
        next: (res:any) => {
          console.log('subscription res =>', res);
          if (res.status === true) {
            this.subscriptions.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: (err: any) => {
          console.log('subscription err =>', err);
        }
      });
    }
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
