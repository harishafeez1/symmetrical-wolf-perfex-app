import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { SharedService } from 'src/app/services/shared.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    SharePipeModule,
    TranslateModule
  ],
  selector: 'app-lead-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit, OnDestroy {

  @Input() leads: any = [];
  @Input() isModal = false;
  private get_lead: Subscription;
  constructor(
    private navCtrl: NavController,
    public authService: AuthenticationService,
    private router: Router,
    private leadApi: LeadApiService,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService
  ) { }

  ngOnInit() {
    this.get_lead = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_lead') {
        const checkLead = this.leads.find(lead => lead.id == response.data.id);
        if (checkLead) {
          this.leads = this.leads.map(lead => {
            if (lead.id === response.data.id) {
              return response.data;
            }
            return lead;
          });
        } else {
          this.leads.unshift(response.data);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.get_lead.unsubscribe();
  }
  
  view(id: any, lead: any) {
    const extras: NavigationExtras = {
      state: lead
    };
    this.router.navigate(['admin/leads/view', id], extras);
    // this.router.navigateByUrl('/' + id);
  }

  edit(id: any) {
    this.router.navigate(['admin/leads/edit/', id]);
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.leadApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.leads.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
    }
  }

  getContrastYIQ(hexcolor) {
    hexcolor = hexcolor ? hexcolor.replace("#", "") : '';
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }

  adjustHexBrightness(hex: string, percent: number): string {
    const hash = '#';
    hex = hex ?? '#757575';
    
    if (hex.startsWith(hash)) {
      hex = hex.substring(1); // Remove leading hash if present
    }
  
    const isValidHex = /^[0-9A-Fa-f]{6}$/i.test(hex); // Check if hex has valid format
    if (!isValidHex) {
      throw new Error('Invalid HEX color format');
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
