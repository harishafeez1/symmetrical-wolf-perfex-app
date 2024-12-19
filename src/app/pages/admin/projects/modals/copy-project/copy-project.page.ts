import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';

@Component({
  selector: 'app-copy-project',
  templateUrl: './copy-project.page.html',
  styleUrls: ['./copy-project.page.scss'],
  providers: [DateTimePipe]
})
export class CopyProjectPage implements OnInit {
  @Input() project:any;
  formGroup: FormGroup;
  submitting = false;
  isLoading = false;
  customers = [];
  statuses = [];
  isDeadlineModalOpen = false;
  isDateModalOpen = false;
  constructor(private modalCtrl: ModalController,
    private fb: UntypedFormBuilder,
    private dateTimePipe: DateTimePipe,
    private customerApi: CustomerApiService,
    private projectHelper: ProjectsHelper,
    private projectApi: ProjectApiService,
    private router: Router) { }

  ngOnInit() {
    this.statuses = this.projectHelper.get_project_statuses();
    this.formGroup = this.fb.group({
      tasks: [true],
      tasks_include_checklist_items: [true],
      task_include_assignees: [true],
      task_include_followers: [true],
      milestones:[true],
      members: [true],
      copy_project_task_status:[],
      start_date: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      deadline: [''],
      name: [this.project ? this.project.name : '', [Validators.required]],
      clientid_copy_project: ['', [Validators.required]],
    });
    if(this.project){
      this.formGroup.controls.copy_project_task_status.setValue(this.project.status ? Number(this.project.status) : 2);
    }
    this.getCustomers();
  }
  getCustomers() {
    this.customerApi.get('', '', null, null,{active: '1'}).subscribe({
      next: (res) => {
        this.customers.push(...res);
        this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
  
        if (this.project && this.project.clientid != 0) {
          this.formGroup.controls.clientid_copy_project.setValue(this.project.clientid);
        }
  
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }
  close() {
    this.modalCtrl.dismiss();
  }
  copyProject(){
    this.submitting = true;
    this.projectApi.copy(this.project.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if(res.status){
          this.close();
          this.router.navigate(['/admin/projects/view/' , res.insert_id]);
        }
        this.submitting = false;
      }, error: () => {this.submitting = false;}
    });
  }
  formatDate(value: any) {
    return this.dateTimePipe.transform(value);
  }
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
}
