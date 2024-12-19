import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { EditorOption } from 'src/app/constants/editor';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { TemplateApiService } from 'src/app/services/template-api.service';

@Component({
  selector: 'app-create-template',
  templateUrl: './create-template.page.html',
  styleUrls: ['./create-template.page.scss'],
})
export class CreateTemplatePage implements OnInit {

  @Input() rel_id: any;
  @Input() rel_type: any;
  @Input() template: any;

  formGroup: UntypedFormGroup;
  isLoading = false;

  editorOption = EditorOption;

  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private templateApi: TemplateApiService
  ) { }

  ngOnInit() {

    console.log(this.rel_id, this.rel_type);

    this.formGroup = this.fb.group({
      rel_id: [this.rel_id],
      rel_type: [this.rel_type],
      name: ['', Validators.required],
      content: ['']
    });

    if (this.template) {
      this.formGroup.controls.name.setValue(this.template.name);
      this.formGroup.controls.content.setValue(this.template.content);
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createTemplate() {
    console.log(this.formGroup);
    this.isLoading = true;
    this.templateApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false; 
      }
    });
  }

  updateTemplate() {
    console.log(this.formGroup);
    this.isLoading = true;
    this.templateApi.update(this.template.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

}
