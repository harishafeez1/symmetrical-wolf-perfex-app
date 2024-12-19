import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController } from '@ionic/angular';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TicketApiService } from 'src/app/services/ticket-api.service';
import { CreatePage as UpdateTicketPage } from 'src/app/pages/admin/tickets/create/create.page';
import { ViewPage as ViewTicketPage } from 'src/app/pages/admin/tickets/view/view.page';
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
  selector: 'app-ticket-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit,OnDestroy {

  @Input() tickets = [];
  @Input() isModal = false;
  private get_ticket: Subscription;
  constructor(
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private router: Router,
    private ticketApi: TicketApiService,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService,
    private animationService: AnimationService,
  ){}

  ngOnInit() {
    this.get_ticket = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_ticket') {
        const checkTicket =  this.tickets.find(ticket => ticket.ticketid == response.data.ticketid);
        if(checkTicket){
          this.tickets = this.tickets.map(ticket => {
            if (ticket.ticketid === response.data.ticketid) {
              return response.data;
            }
            return ticket;
          });
        }else{
          this.tickets.unshift(response.data);
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.get_ticket.unsubscribe();
  }
  async view(id: any, ticket: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: ViewTicketPage,
        mode: 'ios',
        componentProps: {
          ticketInfo: ticket,
          ticketId: id,
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
        state: ticket
      };
      this.router.navigate(['admin/tickets/view', id], extras);
    }
  }

  async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdateTicketPage,
        mode: 'ios',
        componentProps: {
          ticketId: id,
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
      this.router.navigate(['admin/tickets/edit/', id]);
    }
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.ticketApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.tickets.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () =>{}
      });
    }
  }

  adjustHexBrightness(hex: string, percent: number): string {
    const hash = '#';
    
    if (hex.startsWith(hash)) {
      hex = hex.substring(1); // Remove leading hash if present
    }
  
    const isValidHex = /^[0-9A-Fa-f]{6}$/i.test(hex); // Check if hex has valid format
    if (!isValidHex) {
      return 'rgb(148 147 147)';
    }
  
    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);
  
    const hexToRgb = (hex: string): number[] =>
      [0, 2, 4].map(offset => parseInt(hex.substr(offset, 2), 16));
  
    const rgbToHex = (r: number, g: number, b: number): string =>
      [r, g, b]
        .map(value => clamp(value, 0, 255).toString(16).padStart(2, '0'))
        .join('');
  
    const rgb = hexToRgb(hex);
    const adjustedRgb = rgb.map(value =>
      percent > 0
        ? Math.min(Math.round(value + (255 - value) * percent), 255)
        : Math.max(Math.round(value + (value * percent)), 0)
    );
  
    const newHex = rgbToHex(adjustedRgb[0], adjustedRgb[1], adjustedRgb[2]);
  
    return hash + newHex;
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

}
