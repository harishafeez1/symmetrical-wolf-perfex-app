import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { TaskApiService } from 'src/app/services/task-api.service';

@Component({
  selector: 'app-copy-task',
  templateUrl: './copy-task.page.html',
  styleUrls: ['./copy-task.page.scss'],
})
export class CopyTaskPage implements OnInit {
  @Input() task_id: any;
  formGroup: UntypedFormGroup;
  submitting = false;
  taskStatus : any = [];
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private mpcToast: MpcToastService,
    private fb: UntypedFormBuilder,
    public taskHelper: TasksHelper,
    public taskApi: TaskApiService,
  ) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      copy_task_assignees: [false],
      copy_task_followers: [false],
      copy_task_checklist_items: [false],
      copy_task_attachments: [false],
      copy_task_status: [2]

    });
    this.taskStatus = this.taskHelper.get_statuses();
  }
  duplicatedTask(){
    this.formGroup.value.copy_from = this.task_id;
    console.log('formGroup =>', this.formGroup.value);
    this.submitting = true;
    this.taskApi.duplicatedTask(this.formGroup.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          this.modalCtrl.dismiss(true);
          this.router.navigate(['/admin/tasks/view/' + response?.new_task_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }
  close() {
    this.modalCtrl.dismiss(false);
  }
}
