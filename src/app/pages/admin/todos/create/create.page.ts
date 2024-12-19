import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { TodoApiService } from 'src/app/services/todo-api.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {
  @Input() todo: any;

  formGroup: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private todoApi: TodoApiService
  ) { 
    
  }

  ngOnInit() {
   
    console.log(this.todo);

    this.formGroup = this.fb.group({
      description: ['', Validators.required]
    });

    if(this.todo) {
      this.formGroup.controls.description.setValue(this.todo.description); 
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createTodo() {
    console.log(this.formGroup);
    this.submitting = true;
    this.todoApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:todo_created'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  updateTodo() {
    console.log(this.formGroup);
    this.submitting = true;
    this.todoApi.update(this.todo.todoid, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:todo_updated'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }
}
