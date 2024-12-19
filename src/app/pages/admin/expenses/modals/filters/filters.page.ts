import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EstimatesHelper } from 'src/app/classes/estimates-helper';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { ProposalsHelper } from 'src/app/classes/proposals-helper';
import { CommonApiService } from 'src/app/services/common-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
})
export class FiltersPage implements OnInit {
  @Input() appliedFilters: any;
  expense_categories: any;
  expense_months = [];
  expense_status = [
    {
      id: 'billable',
      name: 'expenses_list_billable'
    },
    {
      id: 'non-billable',
      name: 'expenses_list_non_billable'
    },
    {
      id: 'invoiced',
      name: 'expenses_list_invoiced'
    },
    {
      id: 'unbilled',
      name: 'expenses_list_unbilled'
    },
    {
      id: 'recurring',
      name: 'expenses_list_recurring'
    }
  ];
  payments:any = [];

  filters: UntypedFormGroup;

  constructor(
    private commonApi: CommonApiService,
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private translate: TranslateService
  ) { 
    
  }

  ngOnInit() {
    this.translateExpenseMonth();
    this.commonApi.expense_category().subscribe({
      next: (response: any) => {
        this.expense_categories = response;
      }
    });
    this.commonApi.payment_mode().subscribe({
      next: (response: any) => {
        this.payments = response;
      }
    });
    console.log(this.appliedFilters);

    this.filters = this.fb.group({
      expense_categories: [this.appliedFilters.expense_categories],
      expense_months: [this.appliedFilters.expense_months],
      paymentmode: [this.appliedFilters.paymentmode]
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  resetFilters() {
    this.appliedFilters.expense = [];
    this.filters.reset();
  }

  applyFilters() {
  this.filters.value.expense = this.appliedFilters.expense;
    this.modalCtrl.dismiss(this.filters.value);
  }
  isAppliedStatus(expense) {
    if(this.appliedFilters?.expense && this.appliedFilters.expense.find(exp => exp == expense.id)) {
      return true;
    }
    return false;
  }
  applyStatusFilter(expense) {
    if(!this.appliedFilters?.expense) {
      this.appliedFilters.expense = [];
    }

    if(this.appliedFilters?.expense && this.appliedFilters.expense.find(exp => exp == expense.id)) {
      for(let i in this.appliedFilters.expense) {
        if(this.appliedFilters.expense[i] == expense.id) {
          this.appliedFilters.expense.splice(i, 1);
        }
      }  
    } else {
      this.appliedFilters.expense.push(expense.id);
    }
  } 
  translateExpenseMonth(){
    const itemsMonth = [
      {
        id: 1,
        name: 'January'
      },
      {
        id: 2,
        name: 'February'
      },
      {
        id: 3,
        name: 'March'
      },
      {
        id: 4,
        name: 'April'
      },
      {
        id: 5,
        name: 'May'
      },
      {
        id: 6,
        name: 'June'
      },
      {
        id: 7,
        name: 'July'
      },
      {
        id: 8,
        name: 'August'
      },
      {
        id: 9,
        name: 'September'
      },
      {
        id: 10,
        name: 'October'
      },
      {
        id: 11,
        name: 'November'
      },
      {
        id: 12,
        name: 'December'
      },
    ]
    this.expense_months = itemsMonth.map(item => ({
      ...item,
      name: this.translate.instant(item.name)
    }));
  }
}
