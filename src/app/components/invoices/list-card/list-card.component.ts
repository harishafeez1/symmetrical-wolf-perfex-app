import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonRefresher, IonicModule, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { InvoiceApiService } from 'src/app/services/invoice-api.service';
import { CreatePage as UpdateInvoicePage } from 'src/app/pages/admin/invoices/create/create.page';
import { ViewPage as ViewInvoicePage } from 'src/app/pages/admin/invoices/view/view.page';
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
  selector: 'invoice-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit, OnDestroy {
  @Input() invoices = [];
  @Input() isModal = false;
  @Input() type = '';
  @Input() page = '';

  private get_invoice: Subscription;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    public invoiceHelper: InvoicesHelper,
    private invoiceApi: InvoiceApiService,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private sharedService: SharedService,
    private animationService: AnimationService,

  ) { }

  ngOnInit() {
    this.get_invoice = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_invoice') {
        const checkInvoice =  this.invoices.find(invoice => invoice.id == response.data.id);
        if(checkInvoice){
          this.invoices = this.invoices.map(invoice => {
            if (invoice.id === response.data.id) {
              return response.data;
            }
            return invoice;
          });
        }else{
          this.invoices.unshift(response.data);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.get_invoice.unsubscribe();
  }


  async view(id: any, invoice: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: ViewInvoicePage,
        mode: 'ios',
        componentProps: {
          invoiceId: id,
          invoiceInfo: this.page !== 'invoice' ? invoice : null,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
      modal.onDidDismiss().then((modalFilters) => {
        if (modalFilters.data) {
  
        }
      });
      return await modal.present();
      this.refresher.disabled = true;
    }else{      
      const extras: NavigationExtras = {
        state: invoice
      };
      this.router.navigate(['admin/invoices/view', id], extras);
    }
  }

  async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdateInvoicePage,
        mode: 'ios',
        componentProps: {
          invoiceId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
  
      modal.onDidDismiss().then((modalFilters) => {
        console.log('modal =>', modalFilters);
      });
      return await modal.present();

    }else{ 
      this.navCtrl.navigateForward(['admin/invoices/edit/', id]);
    }
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.invoiceApi.delete(id).subscribe({
      next: res => {
        if (res.status) {
          this.invoices.splice(index, 1); //remove from list
          itemSlide.close();
        }
      }, error: () =>{}
    });
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
