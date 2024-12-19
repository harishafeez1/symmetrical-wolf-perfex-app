import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { CustomFieldApiService } from 'src/app/services/custom-field-api.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharePipeModule,
    TranslateModule
  ],
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss'],
  providers: [DateTimePipe]
})
export class CustomFieldsComponent implements OnInit {
  @Input() custom_field!: any;
  @Input() type!: any;
  @Input() typeid!: any;
  @Input() form!: UntypedFormGroup;

  custom_fields = [];

  constructor(
    private fb: UntypedFormBuilder,
    private customFieldApi: CustomFieldApiService,
    private dateTimePipe: DateTimePipe
  ) {}

  get isValid() {
    return this.form.get('custom_fields.' + this.type).valid;
  }

  get fieldTo() {
    return this.form.get('custom_fields.' + this.type) as UntypedFormGroup;
  }

  openModal(field_id, date: any = false, datetime = false) {
    window['isDateModalOpen' + field_id] = !window['isDateModalOpen' + field_id];

    if (date) {
      this.fieldTo.get(field_id).setValue(this.dateTimePipe.transform(date.detail.value));
    }

    if (datetime) {
      this.fieldTo.get(field_id).setValue(this.dateTimePipe.transform(date.detail.value, 'datetime'));
    }
  }

  isModalOpen(field_id) {
    return window['isDateModalOpen' + field_id];
  }

  changeCheckbox(field_id, index, option, event) {
    // console.log(event);
    if(event.detail.checked) {
      let __option = [];
      __option[index] = option;
      this.fieldTo.get(field_id).patchValue(__option);
    }
  }

  ngOnInit(): void {
    this.customFieldApi.get((this.typeid !== null ? this.typeid : ''), this.type).subscribe({
      next: (response:any) => {
        console.log('customer field response =>', response);
        if(response.status !== false){
          for(let custom_field of response) {
            if(custom_field.type == 'checkbox') {
              let _options = [];
              for(let option in custom_field?.options) {
                let selected_value = custom_field.value.includes(custom_field?.options[option]) == false ? false : custom_field?.options[option];
                if(custom_field.required == 1) {
                  _options[option] = [selected_value, [Validators.required]];
                  continue;
                }
                _options[option] = [selected_value];
              }
    
              this.fieldTo.addControl(custom_field.custom_field_id, this.fb.group(_options));
            } else {
              
              if(custom_field.required == 1) {
                if(custom_field.type === 'date_picker' || custom_field.type === 'date_picker_time'){
                  this.fieldTo.addControl(custom_field.custom_field_id, new UntypedFormControl(custom_field.type === 'date_picker' ? this.dateTimePipe.transform(custom_field.value) : this.dateTimePipe.transform(custom_field.value, 'datetime'), [Validators.required]))
                }else{
                  this.fieldTo.addControl(custom_field.custom_field_id, new UntypedFormControl(custom_field.value, [Validators.required]))
                }
              } else {
                console.log('customer field custom_field false =>', custom_field);
                if(custom_field.type === 'date_picker' || custom_field.type === 'date_picker_time'){
                  this.fieldTo.addControl(custom_field.custom_field_id, new UntypedFormControl(custom_field.type === 'date_picker' ? this.dateTimePipe.transform(custom_field.value) : this.dateTimePipe.transform(custom_field.value, 'datetime')))
                }else{
                  this.fieldTo.addControl(custom_field.custom_field_id, new UntypedFormControl(custom_field.value))
                }
              }
            }
          }
          this.custom_fields = response;
        }
      }, error: () => {}
    });
  }
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
  formatDate(value: any) {
    return this.dateTimePipe.transform(value);
  }
}
