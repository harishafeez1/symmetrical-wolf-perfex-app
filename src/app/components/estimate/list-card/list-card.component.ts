import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController } from '@ionic/angular';
import { EstimatesHelper } from 'src/app/classes/estimates-helper';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { EstimateApiService } from 'src/app/services/estimate-api.service';
import { ViewPage as ViewEstimatePage } from 'src/app/pages/admin/estimates/view/view.page';
import { CreatePage as UpdateEstimatePage } from 'src/app/pages/admin/estimates/create/create.page';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
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
  selector: 'app-estimate-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit,OnDestroy {
  @Input() estimates: any = [];
  @Input() isModal = false;
  @Input() type = '';
  private get_estimate: Subscription;
  constructor(
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private router: Router,
    private estimateApi: EstimateApiService,
    public estimateHelper: EstimatesHelper,
    private sharedService: SharedService,
    private animationService: AnimationService,
  ) { }

  ngOnInit() {
    this.get_estimate = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_estimate') {
        const checkEstimate =  this.estimates.find(estimate => estimate.id == response.data.id);
        if(checkEstimate){
          this.estimates = this.estimates.map(estimate => {
            if (estimate.id === response.data.id) {
              return response.data;
            }
            return estimate;
          });
        }else{
          this.estimates.unshift(response.data);
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.get_estimate.unsubscribe();
  }
  async view(id: any, estimate: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: ViewEstimatePage,
        mode: 'ios',
        componentProps: {
          estimateInfo: estimate,
          estimateId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
      modal.onDidDismiss().then((modalFilters) => {
        console.log('modalFilters create =>', modalFilters);
        if (modalFilters.data) {
  
        }
      });
      return await modal.present();
    }else{
      const extras: NavigationExtras = {
        state: estimate
      };
      this.router.navigate(['admin/estimates/view', id], extras);
    }
  }

  async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdateEstimatePage,
        mode: 'ios',
        componentProps: {
         estimateId: id,
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
      this.navCtrl.navigateForward(['admin/estimates/edit/', id]);
    }
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.estimateApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.estimates.splice(index, 1); //remove from list
          itemSlide.close();
        }
      }, error: () => {}
    });
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

}
