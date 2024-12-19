import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ExpenseApiService } from 'src/app/services/expense-api.service';

@Component({
  selector: 'app-convert-to-invoice',
  templateUrl: './convert-to-invoice.page.html',
  styleUrls: ['./convert-to-invoice.page.scss'],
})
export class ConvertToInvoicePage implements OnInit {

  @Input() expense_id:any;
  formGroup: FormGroup;
  submitting = false;
  constructor(private modalCtrl: ModalController,
    private fb: UntypedFormBuilder,
    private router: Router,
    private expenseApi: ExpenseApiService) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      save_as_draft: ['1'],
      include_note: [false],
      include_name: [false]


    });
  }
  
  close() {
    this.modalCtrl.dismiss();
  }
  convertToInvoice(){
    this.formGroup.value.save_as_draft = this.formGroup.value.save_as_draft == '2' ? true : false; 
    console.log('this.formGroup.value =>', this.formGroup.value);
    this.submitting = true;
    this.expenseApi.convertToInvoice(this.expense_id, this.formGroup.value).subscribe({
      next: res => {
        if(res.status){
          this.close();
          this.router.navigate(['/admin/invoices/edit/' , res.insert_id]);
        }
        this.submitting = false;
      }, error: () => {this.submitting = false}
    });
  }

}
