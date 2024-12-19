import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ModalController, NavController } from '@ionic/angular';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage as ViewContractPage } from '../view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { ContractHelper } from 'src/app/classes/contract-helper';
import { IonicSelectableComponent } from 'ionic-selectable';


@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  @ViewChild(IonContent) content: IonContent;
  contract_id = this.activatedRoute.snapshot.paramMap.get('id');
  @Input() contractId: any;
  @Input() type = '';
  customers = [];
  projects: any = [];

  isLoading = true;
  submitting = false;

  offset = 0;
  limit = 20;
  contract: any;

  formGroup: UntypedFormGroup;

  contractTypes = [];
  isEndDateModalOpen = false;
  isStartDateModalOpen = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private contractApi: ContractApiService,
    private customerApi: CustomerApiService,
    private contractHelper: ContractHelper,
    private modalCtrl: ModalController,
    private dateTimePipe: DateTimePipe,
    private projectApi: ProjectApiService
  ) { }

  getContract() {
    if (this.contract_id) {
      this.isLoading = true;
      this.contractApi.get(this.contract_id).subscribe({
        next: (res) => {
          // console.log(res);
          this.contract = res;
  
          this.formGroup.patchValue({
            trash: this.contract.trash == '1' ? true : false,
            not_visible_to_client: this.contract.not_visible_to_client == '1' ? true : false,
            subject: this.contract.subject,
            client: this.contract.client.userid,
            project_id: this.contract.project_id,
            datestart: this.contract.datestart ? this.dateTimePipe.transform(this.contract.datestart) : '',
            dateend: this.contract.dateend ? this.dateTimePipe.transform(this.contract.dateend) : '',
            contract_value: this.contract.contract_value,
            contract_type: this.contract.contract_type ? this.contract.contract_type.id : '',
            description: this.contract.description
          });
  
          this.loadApiData();
        }, error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loadApiData();
    }
  }

  loadApiData() {
     
    this.getCustomers();
    this.contractApi.getContractTypes().subscribe({
      next: (res : any) => {
        if(res.status != false){
          this.contractTypes = res;
        }
      }
    })
  }

  ngOnInit() {
    this.contract_id = this.contract_id ?? this.contractId;

    this.getContract();

    this.formGroup = this.fb.group({
      trash: [false],
      not_visible_to_client: [false],
      subject: ['', [Validators.required]],
      client: ['', [Validators.required]],
      project_id: [''],
      datestart: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      dateend: [''],
      contract_value: [''],
      contract_type: [''],
      custom_fields: this.fb.group({
        contracts: this.fb.group([])
      }),
      description: ['']
    });

  }
  ngOnDestroy(): void {
  }
 
  getCustomers(event: any = false) {
    this.customerApi.get('', '', this.offset, this.limit,{active: '1'}).subscribe({
      next: (res) => {
        this.customers.push(...res);
        this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
  
        if (this.contract) {
  
          this.formGroup.controls.client.setValue(this.contract.client.userid);
          this.projects = [];
          if (event == false) {
            const __event = {
              value:  this.contract.client.userid
            };
            this.getProjects(__event);
          }
        } 
  
        if (event && res.length !== this.limit) {
          event.component.disableInfiniteScroll();
        }
  
        if (event) {
          event.component.items = this.customers;
          event.component.endInfiniteScroll();
        }
  
        this.isLoading = false;
      }, error: () =>{
        this.isLoading = false; 
      }
    });
  }
  customerSelect(event: any) {
    this.projects = [];
    this.getProjects(event);
  }
 
  getProjects(event: any = false) {
    this.formGroup.controls.project_id.reset();
    this.projectApi.get('', '', null, null, {
      clientid: event.value
    }).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.projects.push(...response);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
  
          if (this.contract?.project_data) {
            this.formGroup.controls.project_id.setValue(this.contract.project_data?.id);
          }
        }
      }, error: () => {}
    });
  }

  createContract() {
    console.log(this.formGroup.value);
    const getRawValue = this.formGroup.getRawValue();
   
    this.submitting = true;
 
    this.contractApi.store(getRawValue).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/contracts/view/', res.insert_id]);
          } else {
            this._openContractViewModal(res.insert_id);
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () =>{
        this.submitting = false;
      }
    });
  }

  updateContract() {
    const getRawValue = this.formGroup.getRawValue();
    this.submitting = true;
    this.contractApi.update(this.contract_id, getRawValue).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/contracts/view/', this.contract_id]);
          } else {
            this._openContractViewModal(this.contract_id);
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () =>{
        this.submitting = false;
      }
    });
  }

  formatDate(value: any) {
    return this.dateTimePipe.transform(value);
  }
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }

  close(data = false, role = 'dismiss') {
    this.modalCtrl.dismiss(data, role);
  }

  async _openContractViewModal(contractId: any) {
    this.close(true, 'data');
    const modal = await this.modalCtrl.create({
      component: ViewContractPage,
      mode: 'ios',
      componentProps: {
        contractId: contractId,
        type: 'modal'
      }
    });
    modal.onDidDismiss().then((modalFilters) => {
      console.log('modalFilters create =>', modalFilters);
      if (modalFilters.data) {

      }
    });
    return await modal.present();
  }
  searchCustomers(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.customerApi.get('', searchText, 0, 20, { active: '1' }).subscribe( {
        next: (res: any) => {
          event.component.endSearch();
          if(res.status != false){
            event.component.items = res;
          }else{
            event.component.items = []
          }
        }, error: () =>{
          event.component.endSearch();
        }
      });
  }
  searchProjects(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.projectApi.get('', searchText, 0, 20).subscribe({
      next: (res: any) => {
        event.component.endSearch();
        if(res.status != false){
          event.component.items = res;
        }else{
          event.component.items = []
        }
      }, error : () => {
        event.component.endSearch();
      }
    });
  }

}
