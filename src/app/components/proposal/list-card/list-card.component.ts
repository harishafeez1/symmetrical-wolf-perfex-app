import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController } from '@ionic/angular';
import { ProposalsHelper } from 'src/app/classes/proposals-helper';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { ViewPage as ViewProposalPage} from 'src/app/pages/admin/proposals/view/view.page';
import { CreatePage as UpdateProposalPage} from 'src/app/pages/admin/proposals/create/create.page';
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
  selector: 'app-proposal-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit,OnDestroy {

  @Input() proposals = [];
  @Input() isModal = false;
  private get_proposal: Subscription;
  constructor(
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private router: Router,
    private proposalApi: ProposalApiService,
    public proposalHelper: ProposalsHelper,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService,
    private animationService: AnimationService,
  ) { }

  ngOnInit() {
    this.get_proposal = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_proposal') {
        const checkProposal =  this.proposals.find(proposal => proposal.id == response.data.id);
        if(checkProposal){
          this.proposals = this.proposals.map(proposal => {
            if (proposal.id === response.data.id) {
              return response.data;
            }
            return proposal;
          });
        }else{
          this.proposals.unshift(response.data);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.get_proposal.unsubscribe();
  }

  async view(id: any, proposal: any) {
    if(this.isModal) {
      const modal = await this.modalCtrl.create({
        component: ViewProposalPage,
        mode: 'ios',
        componentProps: {
          proposalInfo:proposal,
          proposalId: id,
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
        
      } else {
    const extras: NavigationExtras = {
      state: proposal
    };
    this.router.navigate(['admin/proposals/view', id], extras);
  }
  }
  async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdateProposalPage,
        mode: 'ios',
        componentProps: {
          proposalId: id,
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
    this.navCtrl.navigateForward(['admin/proposals/edit/', id]);
    }
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.proposalApi.delete(id).subscribe({
        next: res => {
          if (res.status) {
            this.proposals.splice(index, 1); //remove from list
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
