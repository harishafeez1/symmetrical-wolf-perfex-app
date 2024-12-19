import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
export var STORAGE_EXPENSE_KEY = '-expenses';

@Injectable({
  providedIn: 'root'
})
export class ExpenseApiService {
  sort: Sorting = {
    sort_by: 'date',
    order: 'desc'
  };

  sorts = [
    {
      key: 'category_name',
      name: 'expense_dt_table_heading_category'
    },
    {
      key: 'amount',
      name: 'expense_amount'
    },
    {
      key: 'expense_name',
      name: 'expense_name'
    },
    {
      key: 'file_name',
      name: 'expense_receipt'
    },
    {
      key: 'date',
      name: 'expense_dt_table_heading_date',
      default_order: 'desc'
    },
    {
      key: 'project_name',
      name: 'project'
    },
    {
      key: 'company',
      name: 'expense_dt_table_heading_customer'
    },
    {
      key: 'invoiceid',
      name: 'invoice'
    },
    {
      key: 'reference_no',
      name: 'reference'
    },
    {
      key: 'paymentmode',
      name: 'expense_dt_table_heading_payment_mode'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService
  ) {
    STORAGE_EXPENSE_KEY = this.authService.IDENTIFIER + STORAGE_EXPENSE_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/expenses/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/expenses/${id}`;
    }
    console.log('expenseStorage');
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res:any) => {
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_EXPENSE_KEY, res);
        }

        // console.log('loaded api expense: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();

    if (formData.clientid !== null) {
      formData.clientid = formData.clientid?.userid;
    }
    if (formData.project_id !== null) {
      formData.project_id = formData.project_id.id;
    }

    if (formData.tax !== null) {
      formData.tax = formData.tax.id;
    }

    if (formData.tax2 !== null) {
      formData.tax2 = formData.tax2.id;
    }

    delete formData.select_item;
    delete formData.removed_items;

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.expenses) {
        if (typeof formData.custom_fields.expenses[custom_field] == 'object') {
          for (let _index in formData.custom_fields.expenses[custom_field]) {
            form_data.append('custom_fields[expenses][' + custom_field + '][' + _index + ']', formData.custom_fields.expenses[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[expenses][' + custom_field + ']', formData.custom_fields.expenses[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      if (key == 'amount') {
        formData[key] = formData[key].toFixed(2);
      }

      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/expenses', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('expense inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(id: any, formData: any) {
    delete formData.select_item;

    if (formData.clientid !== null) {
      formData.clientid = formData.clientid.userid;
    }

    if (formData.project_id !== null) {
      formData.project_id = formData.project_id.id;
    }

    if (formData.tax !== null) {
      formData.tax = formData.tax.id;
    }

    if (formData.tax2 !== null) {
      formData.tax2 = formData.tax2.id;
    }

    return this.http.put<any>('/mpc_mobile_app_connector/v1/expenses/' + id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('expense updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/expenses/' + id).pipe(map(res => res),
      tap((res: any) => {
        console.log('expense deleted: ', res);
        if (res.status) {
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  addAttachment(id, file: any) {
    var form_data = new FormData();
    form_data.append('file', file);

    return this.http.post<any>('/mpc_mobile_app_connector/v1/expenses/attachment/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('expense attachment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteAttachment(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/expenses/attachment/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('expense attachment deleted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  copy(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/expenses/copy/' + id).pipe(
      tap(res => {
        // console.log('loaded api expense copy: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  convertToInvoice(id:any,formData:any){
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/expenses/convert_to_invoice/${id}?save_as_draft=${formData.save_as_draft}&include_name=${formData.include_name}&include_note=${formData.include_note}`).pipe(
      tap(res => {
        // console.log('loaded api expense copy: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

}
