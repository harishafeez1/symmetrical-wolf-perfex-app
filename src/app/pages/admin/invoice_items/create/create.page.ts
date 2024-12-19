import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { CommonApiService } from 'src/app/services/common-api.service';
import { format, parseISO } from 'date-fns';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { ItemApiService } from 'src/app/services/item-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit,OnDestroy {
  item_id = this.activatedRoute.snapshot.paramMap.get('id');
  isLoading = true;
  submitting = false;
  formGroup: UntypedFormGroup;
  base_currency: any;
  currencies: any;
  item: any;

  item_groups = [];
  taxes = [];
  private currency$: Subscription;
  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private currencyApi: CurrencyApiService,
    private itemApi: ItemApiService,
    private commonApi: CommonApiService,
  ) {
  }

  getItem() {

    if (this.item_id !== null) {
      this.isLoading = true;
      this.itemApi.get(this.item_id).subscribe({
        next: (res: any) => {
          console.log(res);
          this.item = res;
          this.formGroup.patchValue({
            description: this.item.description,
            long_description: this.item.long_description,
            rate: this.item.rate,
            unit: this.item.unit
          });
  
          this.loadApiData();
          this.isLoading = false;
        }, error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loadApiData();
    }
  }

  loadApiData() {
    this.currency$ = this.currencyApi.getCurrenciesData().subscribe(async res => {
      if (!res) {
        this.currencyApi.get().subscribe({
          next: response => {
            this.currencyApi.setCurrenciesData(response);
          }
        });
      } else {
        this.currencies = await res;
        for (let currency of this.currencies) {
          if (currency.isdefault == 1) {
            this.base_currency = currency;
            continue;
          }
          this.formGroup.addControl('rate_currency_' + currency.id, this.fb.control(''));
  
          if(this.item) {
            this.formGroup.controls['rate_currency_' + currency.id].setValue(this.item['rate_currency_' + currency.id]);
          }
        }
  
        if (this.item) {
          // this.formGroup.controls.currency.setValue(this.item.currency);
        }
      }
    })

    this.itemApi.getGroups().subscribe({
      next: (response: any) => {
        if(response.status !== false) {
          this.item_groups = response;
          
          if(this.item) {
            this.formGroup.controls.group_id.setValue(this.item.group_id);
          }
        }
      }
    });

    this.commonApi.tax_data().subscribe({
      next: (response: any) => {
        if(response.status !== false) {
          this.taxes = response;
        }
  
        if (this.item) {
          if (this.item.taxid) {
            const tax = {
              id: this.item.taxid,
              name: this.item.taxname,
              taxrate: this.item.taxrate
            };
            this.formGroup.controls.tax.setValue(tax);
          }
  
          if (this.item.taxid_2) {
            const tax2 = {
              id: this.item.taxid_2,
              name: this.item.taxname_2,
              taxrate: this.item.taxrate_2
            };
  
            this.formGroup.controls.tax2.setValue(tax2);
          }
        }
      }
    });
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      description: ['', [Validators.required]],
      long_description: [''],
      rate: [''],

      tax: [''],
      tax2: [''],
      unit: [''],
      group_id: [''],
      custom_fields: this.fb.group({
        items: this.fb.group([])
      })
    });
    this.getItem();
  }
  ngOnDestroy(): void {
    this.currency$.unsubscribe();
  }
  
  updateItem() {
    this.submitting = true;
    this.itemApi.update(this.item_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:invoice_item_created'));
          this.nav.navigateRoot('/admin/invoice_items');
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  createItem() {
    this.submitting = true;
    this.itemApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:invoice_item_updated'));
          this.nav.navigateRoot('/admin/invoice_items');
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  formatDate(value: string) {
    return format(parseISO(value), 'yyyy-MM-dd');
  }
}
