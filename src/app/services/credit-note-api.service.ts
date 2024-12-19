import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { from, Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';

import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';

export var STORAGE_CREDIT_NOTE_KEY = '-credit_notes';

@Injectable({
  providedIn: 'root'
})
export class CreditNoteApiService {
  sort: Sorting = {
    sort_by: 'number',
    order: 'desc'
  };

  sorts = [
    {
      key: 'number',
      name: 'credit_note',
      default_order: 'desc'
    },
    {
      key: 'date',
      name: 'credit_note_date'
    },
    {
      key: 'company',
      name: 'client'
    },
    {
      key: 'status',
      name: 'credit_note_status'
    },
    {
      key: 'project_name',
      name: 'project'
    },
    {
      key: 'reference_no',
      name: 'reference'
    },
    {
      key: 'total',
      name: 'credit_note_amount'
    },
    {
      key: 'remaining_amount',
      name: 'credit_note_remaining_credits'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService
  ) {
    STORAGE_CREDIT_NOTE_KEY = this.authService.IDENTIFIER + STORAGE_CREDIT_NOTE_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/credit_notes/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/credit_notes/${id}`;
    }
    console.log('credit_noteStorage');
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res:any) => {
        if(id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_CREDIT_NOTE_KEY, res);
        }
       
        // console.log('loaded api credit_note: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  available_creditable_invoices(credit_note_id = ''): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/credit_notes/available_creditable_invoices/${credit_note_id}`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api available_creditable_invoices: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  apply_credits_to_invoices(credit_note_id = '', formData: any) {
    const form_data = new FormData();
    for (const key in formData) {
      form_data.append(`amount[${key}]`, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/credit_notes/apply_credits_to_invoices/' + credit_note_id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('credit_note inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any, creditNoteItems: any) {
    var form_data = new FormData();
   
    delete formData.select_item;
    delete formData.removed_items;

    formData.clientid = formData.clientid.userid;

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.credit_note) {
        if(typeof formData.custom_fields.credit_note[custom_field] == 'object') {
          for (let _index in formData.custom_fields.credit_note[custom_field]) {
            form_data.append('custom_fields[credit_note][' + custom_field + '][' + _index + ']', formData.custom_fields.credit_note[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[credit_note][' + custom_field + ']', formData.custom_fields.credit_note[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      if(key == 'project_id' && formData.project_id != null && formData.project_id != '') {
        form_data.append('project_id', formData.project_id.id);
      }else{
        form_data.append(key, formData[key]);
      }
    }

    for(var key in creditNoteItems) {
      if(creditNoteItems[key].taxrate != null) {
        creditNoteItems[key].taxname = [];
        for(const tax of creditNoteItems[key].taxrate) {
          form_data.append(`newitems[${key}][taxname][]`, `${tax.name}|${tax.taxrate}`);
        }
      }

      delete creditNoteItems[key].taxrate;

      form_data.append(`newitems[${key}][order]`, key);
      form_data.append(`newitems[${key}][description]`, creditNoteItems[key].description);
      form_data.append(`newitems[${key}][long_description]`, creditNoteItems[key].long_description);
      form_data.append(`newitems[${key}][qty]`, creditNoteItems[key].qty);
      form_data.append(`newitems[${key}][rate]`, creditNoteItems[key].rate);
      form_data.append(`newitems[${key}][unit]`, '');
    }
    
    return this.http.post<any>('/mpc_mobile_app_connector/v1/credit_notes', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('credit_note inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  storeRefund(id: number, formData: any) {
    var form_data = new FormData();
   
    for (var key in formData) {
      form_data.append(key, formData[key]);
    }
    
    return this.http.post('/mpc_mobile_app_connector/v1/credit_notes/create_refund/' + id, form_data).pipe(
      map(response => response),
      tap(response => {
        console.log('credit_note inserted: ', response);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  updateRefund(id: number, formData: any) {
    return this.http.put('/mpc_mobile_app_connector/v1/credit_notes/edit_refund/' + id, formData).pipe(
      map(response => response),
      tap(response => {
        console.log('edit refund: ', response);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(credit_note_id: any, formData: any, creditNoteItems: any) {
    delete formData.select_item;
    
    formData.clientid = formData.clientid.userid;

    if(formData.project_id !== null) {
      formData.project_id = formData.project_id.id;
    }

    for(var key in creditNoteItems) {
      if(creditNoteItems[key].taxrate != null) {
        creditNoteItems[key].taxname = [];
        for(const tax of creditNoteItems[key].taxrate) {
          creditNoteItems[key].taxname.push(`${tax.name}|${tax.taxrate}`);
        }
      }

      delete creditNoteItems[key].taxrate;
      creditNoteItems[key].order = key;
    }

    formData.newitems = creditNoteItems;
    formData.items = [];
    return this.http.put<any>('/mpc_mobile_app_connector/v1/credit_notes/' + credit_note_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('credit_note updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(credit_note_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/credit_notes/' + credit_note_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('credit_note deleted: ', res);
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

  getPDF(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/credit_notes/pdf/' + id + '?output_type=S').pipe(
      tap(res => {
        // console.log('loaded api credit note pdf: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  markAs(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/credit_notes/mark_credit_note_status/' + status + '/' + id).pipe(
      tap(res => {
        // console.log('loaded api credit note mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteCreditedInvoice(applied_credit_id, credit_note_id, applied_credit_invoice_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/credit_notes/delete_credit_note_applied_credit/' + applied_credit_id + '/' + credit_note_id + '/' + applied_credit_invoice_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('Credit Note Credited Invoice deleted: ', res);
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
  
  deleteRefund(refund_id, credit_note_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/credit_notes/delete_refund/' + refund_id + '/' + credit_note_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('Credit Note Refund deleted: ', res);
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

}
