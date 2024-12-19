import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController } from '@ionic/angular';
import { CreditNotesHelper } from 'src/app/classes/credit-notes-helper';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CreditNoteApiService } from 'src/app/services/credit-note-api.service';
import { ViewPage as ViewCreditNotePage } from 'src/app/pages/admin/credit_notes/view/view.page';
import { CreatePage as UpdateCreditNotePage } from 'src/app/pages/admin/credit_notes/create/create.page';
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
  selector: 'app-credit-note-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit,OnDestroy {

  @Input() credit_notes: any = [];
  @Input() isModal = false;
  @Input() page = '';
  private get_credit_note: Subscription;
  constructor(
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private router: Router,
    private creditNoteApi: CreditNoteApiService,
    private creditNoteHelper: CreditNotesHelper,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService,
    private animationService: AnimationService,
  ) { }

  ngOnInit() {
    this.get_credit_note = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_credit_note') {
        const checkCreditNote =  this.credit_notes.find(credit_note => credit_note.id == response.data.id || credit_note.credit_id == response.data.id);
        if(checkCreditNote){
          this.credit_notes = this.credit_notes.map(credit_note => {
            if (credit_note.id === response.data.id) {
              return response.data;
            }
            return credit_note;
          });
        }else{
          this.credit_notes.unshift(response.data);
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.get_credit_note.unsubscribe();
  }
  async view(id: any, credit_note: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: ViewCreditNotePage,
        showBackdrop: false,
        backdropDismiss: false,
        mode: 'ios',
        componentProps: {
          credit_note_info: this.page !== 'invoice' ?  credit_note : null,
          creditNoteId: this.page !== 'invoice' ? id  : credit_note.credit_id,
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
        state: credit_note
      };
      this.router.navigate(['admin/credit_notes/view', id], extras);
    }
  }

  async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdateCreditNotePage,
        mode: 'ios',
        componentProps: {
          creditNoteId: id,
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
      this.router.navigate(['admin/credit_notes/edit/', id]);
    }
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.creditNoteApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.credit_notes.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
    }
  }
  getStatusNameByStatusId(status) {
    return this.creditNoteHelper.get_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.creditNoteHelper.get_status_by_id(status).color;
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
