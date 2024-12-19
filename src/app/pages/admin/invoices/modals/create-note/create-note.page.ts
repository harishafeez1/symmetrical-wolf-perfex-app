import { AfterContentChecked, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { NoteApiService } from 'src/app/services/note-api.service';

@Component({
  selector: 'app-create-note',
  templateUrl: './create-note.page.html',
  styleUrls: ['./create-note.page.scss'],
  providers: [DateTimePipe]
})
export class CreateNotePage implements OnInit{
  @Input() rel_type: any;
  @Input() rel_id: any;
  @Input() note: any;

  formGroup: UntypedFormGroup;
  submitting = false;
  isDateModalOpen = false;
  
  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private noteApi: NoteApiService,
    private dateTimePipe: DateTimePipe,
    private cdRef: ChangeDetectorRef
  ) { 
    
  }

  ngOnInit() {
    console.log('note =>', this.note);
    this.formGroup = this.fb.group({
      rel_type: [this.rel_type],
      rel_id: [this.rel_id],
      description: ['', Validators.required],
      contacted_indicator: [''],
      custom_contact_date: ['']
    });

    if(this.note) {
      this.formGroup.controls.description.setValue(this.note.description.replaceAll('<br />', ' ')); 
    }
  }
//   ngAfterContentChecked() : void {
//     this.cdRef.detectChanges();
// }

  close() {
    this.modalCtrl.dismiss();
  }

  createNote() {
    console.log(this.formGroup);
    let data:any = {};
    if(this.rel_type === 'lead'){
      data = {
        rel_type: this.formGroup.value.rel_type,
        rel_id: this.formGroup.value.rel_id,
        description: this.formGroup.value.description,
        contacted_indicator: this.formGroup.value.contacted_indicator,
        custom_contact_date: this.formGroup.value.custom_contact_date
      }
    }else{
      data = {
        rel_type: this.formGroup.value.rel_type,
        rel_id: this.formGroup.value.rel_id,
        description: this.formGroup.value.description
      }
    }
    this.submitting = true;
    this.noteApi.store(data).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:note_created'));
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

  updateNote() {
    this.submitting = true;
    this.noteApi.update(this.note.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:note_updated'));
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

  formatDate(value: any) {
    return this.dateTimePipe.transform(value, 'datetime');
  }
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
}
