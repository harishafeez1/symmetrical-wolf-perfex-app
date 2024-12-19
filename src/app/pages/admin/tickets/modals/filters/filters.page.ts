import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { TicketApiService } from 'src/app/services/ticket-api.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
})
export class FiltersPage implements OnInit {

  @Input() appliedFilters: any;
  filters: UntypedFormGroup;

  staffs: any = [];
  statuses:any = [];

  constructor(
    private ticketApi: TicketApiService,
    private staffApi: StaffApiService,
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController
  ) { 
    
  }

  ngOnInit() {

    this.filters = this.fb.group({
      assigned: [this.appliedFilters.assigned]
    });

    this.ticketApi.getStatuses().subscribe({
      next: (response: any) => {
        this.statuses = response;
      }
    });

    this.staffApi.get().subscribe({
      next: response => {
        this.staffs = response;
      }
    });

    console.log(this.appliedFilters);
  }

  isAppliedStatus(ticket_id: any) {
    if(this.appliedFilters?.status && this.appliedFilters.status.includes(ticket_id)) {
      return true;
    }
    return false;
  }

  applyStatusFilter(ticket_id) {
    if(!this.appliedFilters?.status) {
      this.appliedFilters.status = [];
    }

    if(this.appliedFilters.status.includes(ticket_id)) {
      console.log(this.appliedFilters.status, ticket_id);
      for(let i in this.appliedFilters.status) {
        if(this.appliedFilters.status[i] == ticket_id) {
          this.appliedFilters.status.splice(i, 1);
        }
      }
      
    } else {
      this.appliedFilters.status.push(ticket_id);
    }
  } 

  close() {
    this.modalCtrl.dismiss();
  }

  resetFilters() {
    this.filters.reset();
    this.appliedFilters.status = [];
    this.appliedFilters.assigned = [];
  }

  applyFilters() {
    this.filters.value.status = this.appliedFilters.status;
    this.filters.value.assigned = (this.filters.value.assigned ?? []);
    this.modalCtrl.dismiss(this.filters.value);
  }

}
