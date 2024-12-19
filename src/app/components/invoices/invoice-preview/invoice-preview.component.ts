import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    SharePipeModule,
    TranslateModule
  ],
  selector: 'app-invoice-preview',
  templateUrl: './invoice-preview.component.html',
  styleUrls: ['./invoice-preview.component.scss'],
})
export class InvoicePreviewComponent implements OnInit {
  @Input() invoice: any;
  settings: any;
  total_paid:Number;
  tags = [];
  constructor(private settingHelper: SettingsHelper) {
    this.settingHelper.settings.subscribe((response) => {
      console.log(response);
      this.settings = response;
    });
  }

  ngOnInit() {
    console.log('invoice component =>', this.invoice)
    // if(this.invoice){
      // this.total_paid = this.getTotalPaid(this.invoice?.total, this.invoice?.total_left_to_pay);
    // }
    // this.tags = (this.invoice.tags && this.invoice.tags.length) ? this.invoice.tags.split(',') : []; 
  }

  showDiscount(invoice) {
    if (invoice?.discount_percent) {
      return invoice.discount_percent != 0 ? '(' + parseInt(invoice.discount_percent) + '%)' : '';
    }
    return '';
  }
  getTotalPaid(total, due_amount){
    const paidAmount = (total ? Number(total) : 0 ) - (due_amount ?  Number(due_amount) : 0);
    // console.log('paidAmount =>', paidAmount);
    return paidAmount;
  }
}
