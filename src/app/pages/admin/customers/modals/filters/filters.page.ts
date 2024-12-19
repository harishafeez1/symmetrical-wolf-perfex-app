import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EstimatesHelper } from 'src/app/classes/estimates-helper';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { ProposalsHelper } from 'src/app/classes/proposals-helper';
import { CustomerApiService } from 'src/app/services/customer-api.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
})
export class FiltersPage implements OnInit {
  @Input() appliedFilters: any;
  groups: any = [];
  filters: UntypedFormGroup;
  invoiceStatuesList:any = [];
  estimateStatuesList:any = [];
  projectStatuesList:any = [];
  proposalStatuesList:any = [];
  status:any = [];
  constructor(
    private customerApi: CustomerApiService,
    private proposalsHelper: ProposalsHelper,
    private invoicesHelper: InvoicesHelper,
    private estimatesHelper: EstimatesHelper,
    private projectsHelper: ProjectsHelper,
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private translate: TranslateService
  ) { 
    
  }

  ngOnInit() {
    
    this.translateStatus();
    this.translateInvoiceStatues();
    this.translateEstimateStatues();
    this.translateProjectStatues();
    this.translateProposalStatues();
    this.customerApi.get_groups().subscribe({
      next: (response: any) => {
        this.groups = response;
      }
    });
    console.log(this.appliedFilters);

    this.filters = this.fb.group({
      active: [this.appliedFilters?.active ? this.appliedFilters.active : 'all'],
      groups_in: [this.appliedFilters.groups_in],
      invoice_statuses: [this.appliedFilters.invoice_statuses],
      estimate_statuses: [this.appliedFilters.estimate_statuses],
      project_statuses: [this.appliedFilters.project_statuses],
      proposal_statuses: [this.appliedFilters.proposal_statuses],
    });
    // this.invoiceStatuesList = this.invoicesHelper.get_statuses_list();
    // this.estimateStatuesList = this.estimatesHelper.get_statuses_list();
    // this.projectStatuesList = this.projectsHelper.get_project_statuses();
    // this.proposalStatuesList = this.proposalsHelper.get_statuses_list();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  resetFilters() {
    this.filters.reset();
    // this.filters.patchValue({

    // })
    this.filters.controls.active.setValue('all');
  }

  applyFilters() {
    console.log('this.filters.value) =>', this.filters.value);
    this.modalCtrl.dismiss(this.filters.value);
  }
  translateStatus(){
    const itemTabs = [
      {id: 1, name: 'all', value: 'all'},
      {id: 2, name: 'active', value: '1'},
      {id: 3, name: 'inactive', value: '0'},
    ];
    this.status = itemTabs.map(item => ({
      ...item,
      name: this.translate.instant(item.name)
    }));
  }
  translateInvoiceStatues(){
    const itemTabs = this.invoicesHelper.get_statuses_list();
    this.invoiceStatuesList = itemTabs.map(item => ({
      ...item,
      name: this.translate.instant(item.name)
    }));
  }
  translateEstimateStatues(){
    const itemTabs = this.estimatesHelper.get_statuses_list();
    this.estimateStatuesList = itemTabs.map(item => ({
      ...item,
      name: this.translate.instant(item.name)
    }));
  }
  translateProjectStatues(){
    const itemTabs = this.projectsHelper.get_project_statuses();
    this.projectStatuesList = itemTabs.map(item => ({
      ...item,
      name: this.translate.instant(item.name)
    }));
  }
  translateProposalStatues(){
    const itemTabs = this.proposalsHelper.get_statuses_list();
    this.proposalStatuesList = itemTabs.map(item => ({
      ...item,
      name: this.translate.instant(item.name)
    }));
  }

}
