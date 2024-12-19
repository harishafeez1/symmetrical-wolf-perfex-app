import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Subscription } from 'rxjs';
import { CommonApiService } from 'src/app/services/common-api.service';
import { format, parseISO } from 'date-fns';
import { ContactApiService } from 'src/app/services/contact-api.service';
import { TicketApiService } from 'src/app/services/ticket-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage as ViewTicketPage } from '../view/view.page';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AnimationService } from 'src/app/services/animation.service';
import { EditorOption } from 'src/app/constants/editor';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {
  @Input() ticketId: any;
  @Input() type = '';
  @ViewChild('portComponent', { static: true }) portComponent: IonicSelectableComponent;
  ticket_id = this.activatedRoute.snapshot.paramMap.get('id');
  is_contact = true;
  formGroup: UntypedFormGroup;

  editorOption = EditorOption;

  ticket: any;

  isLoading = true;
  submitting = false;

  departments = [];
  staffs = [];
  priorities = [];
  services = [];
  contacts = [];

  commonApiSubscription: Subscription;
  files: File[] = [];
  userId:any;

  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private ticketApi: TicketApiService,
    private staffApi: StaffApiService,
    private contactApi: ContactApiService,
    private router: Router,
    private modalCtrl: ModalController,
    public authService: AuthenticationService,
    private animationService: AnimationService,
  ) {
  }

  getTicket() {

    if (this.ticket_id) {
      this.isLoading = true;
      this.ticketApi.get(this.ticket_id).subscribe({
        next: (res: any) => {
          this.ticket = res;
          this.formGroup.patchValue({
            subject: this.ticket.subject,
            name: this.ticket.from_name,
            email: this.ticket.ticket_email,
            department: this.ticket.department,
            cc: this.ticket.cc,
            assigned: this.ticket.assigned,
            service: this.ticket.service,
            message: this.ticket.message
          });
  
          if (this.ticket.contactid != 0) {
            const contactid = {
              id: this.ticket.contactid,
              full_name: this.ticket.user_firstname + ' ' + this.ticket.user_lastname,
              email: this.ticket.email
            };
            this.contacts.push(contactid);
  
            this.formGroup.get('contactid').setValue(contactid);
            this.formGroup.get('name').setValue(this.ticket.user_firstname + ' ' + this.ticket.user_lastname);
            this.formGroup.get('email').setValue(this.ticket.email);
            this.formGroup.get('name').disable();
            this.formGroup.get('email').disable();
          } else {
            this.is_contact = false;
            this.formGroup.get('name').enable();
            this.formGroup.get('email').enable();
          }
  
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
    this.ticketApi.getDepartments().subscribe({
      next: (departments: any) => {
        if (departments?.status !== false) {
          this.departments = departments;
  
          if (this.ticket) {
            this.formGroup.controls.department.setValue(this.ticket.department);
          }
        }
      }
    });

    this.ticketApi.getPriorities().subscribe({
      next: (priorities: any) => {
        this.priorities = priorities;
        this.formGroup.controls.priority.setValue("2");
  
        if (this.ticket) {
          this.formGroup.controls.priority.setValue(this.ticket.priority);
        }
      }
    });

    this.ticketApi.getServices().subscribe({
      next: (services: any) => {
        if (services?.status !== false) {
          this.services = services;
  
          if (this.ticket) {
            this.formGroup.controls.service.setValue(this.ticket.service);
          }
        }
      }
    });

    this.staffApi.get().subscribe({
      next: (staffs: any) => {
        this.staffs = staffs;
  
        if (this.ticket) {
          this.formGroup.controls.assigned.setValue(this.ticket.assigned);
        }
      }
    });
    this.contactApi.get().subscribe({
      next: (res: any) => {
        if(res.static != false){
          this.contacts = res;
        }
      }
    });
  }

  switchContact() {
    this.is_contact = !this.is_contact;

    if (this.is_contact) {
      this.formGroup.controls.contactid.addValidators(Validators.required);
      this.formGroup.get('name').disable();
      this.formGroup.get('email').disable();
    } else {
      this.formGroup.controls.contactid.removeValidators(Validators.required);
      this.formGroup.get('name').enable();
      this.formGroup.get('email').enable();
    }
    this.formGroup.get('contactid').updateValueAndValidity();
  }

  ngOnInit() {
    this.ticket_id = this.ticket_id ?? this.ticketId;
    this.getTicket();
    const userInfo = this.authService.auth ? this.authService.auth?.data : {};
    this.formGroup = this.fb.group({
      subject: ['', [Validators.required]],
      name: [{
        value: '',
        disabled: true
      }, [Validators.required]],
      contactid: ['', [Validators.required]],
      email: [{
        value: '',
        disabled: true
      }, [Validators.required, Validators.email]],
      department: ['', [Validators.required]],
      cc: ['', [Validators.email]],
      assigned: [userInfo? userInfo?.staffid : ''],
      priority: [''],
      service: [''],
      message: [''],
      custom_fields: this.fb.group({
        tickets: this.fb.group([])
      })
    });
  }

  contactSelected(event: any) {
    console.log(event);
    this.formGroup.controls.name.setValue(event.value.full_name);
    this.formGroup.controls.email.setValue(event.value.email);
  }

  contactSearch(event: { component: IonicSelectableComponent, text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    // Close any running subscription.
    if (this.commonApiSubscription) {
      this.commonApiSubscription.unsubscribe();
    }

    if (!text) {
      // Close any running subscription.
      if (this.commonApiSubscription) {
        this.commonApiSubscription.unsubscribe();
      }

      // event.component.items = [];
      event.component.endSearch();
      return;
    }

    this.commonApiSubscription = this.contactApi.get('', text).subscribe({
      next: (response: any) => {
        // Subscription will be closed when unsubscribed manually.
        if (this.commonApiSubscription.closed) {
          return;
        }
  
        if (response?.status === false) {
          event.component.items = [];
        } else {
          event.component.items = response;
        }
  
        event.component.endSearch();
      }
    });
  }

  updateTicket() {
    this.submitting = true;
    this.ticketApi.update(this.ticket_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/tickets/view/', this.ticket_id]);
          } else {
            this._openTicketViewModal(this.ticket_id);
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  createTicket() {
    this.submitting = true;
    this.formGroup.value.attachments = this.files;
    this.ticketApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.router.navigate(['/admin/tickets/view/', res.insert_id]);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {

      }
    });
  }

  formatDate(value: string ) {
    return format(parseISO(value), 'yyyy-MM-dd');
  }

  close(data = false, role = 'dismiss') {
    this.modalCtrl.dismiss(data, role);
  }

  async _openTicketViewModal(ticketId: any) {
    this.close(true, 'data');
    const modal = await this.modalCtrl.create({
      component: ViewTicketPage,
      mode: 'ios',
      componentProps: {
        ticketId: ticketId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });
    modal.onDidDismiss().then((modalFilters) => {
      console.log('modalFilters create =>', modalFilters);
      if (modalFilters.data) {

      }
    });
    return await modal.present();
  }

  onSelect(event) {
    console.log(event);
    if(event.rejectedFiles.length > 0){
      this.mpcToast.show(`You can't upload files of this type`, 'danger');
      return;
    }
    if (event.addedFiles.length > 0) {
      let fileSizeUp = [];
      for(let file of event.addedFiles){
        var fileSizeInBytes = file.size;
        var fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
        if (fileSizeInMB > 2) {
          fileSizeUp.push(file.name);
        } 
      }
      if(fileSizeUp.length > 0){
        this.mpcToast.show(`${fileSizeUp.join(', ')} file size must be less than or equal to 2MB.`, 'danger');
        return;
      }
      
  }
    this.files.push(...event.addedFiles);
  }
  
  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
  searchStaffs(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.staffApi.get('', searchText, 0, 20).subscribe({
      next: (res: any) => {
        event.component.endSearch();
        if(res.status != false){
          event.component.items = res;
        }else{
          event.component.items = []
        }
      }, error: () => {
        event.component.endSearch();
      }
    });
  }
}
