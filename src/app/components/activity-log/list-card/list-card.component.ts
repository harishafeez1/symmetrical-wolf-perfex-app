import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { EstimateApiService } from 'src/app/services/estimate-api.service';
import { InvoiceApiService } from 'src/app/services/invoice-api.service';
import { MiscApiService } from 'src/app/services/misc-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    SharePipeModule
  ],
  selector: 'app-activity-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit {
  @Input() activities: any = [];
  @Input() isType = '';
  constructor( public authService: AuthenticationService,
    private miscApi: MiscApiService,
    private invoiceApi: InvoiceApiService,
    private estimateApi: EstimateApiService,
    private mpcAlert: MpcAlertService) { }

  ngOnInit() {}

  async deleteActivity(id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.miscApi.deleteSaleActivity(id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.activities.splice(index, 1); //remove from list
          }
        }, error: () => {}
      });
    }
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

}
