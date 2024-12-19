import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { from, Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';

import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';

export var STORAGE_INVOICE_KEY = '-invoices';

@Injectable({
  providedIn: 'root'
})
export class InvoiceApiService {
  sort: Sorting = {
    sort_by: 'number',
    order: 'desc'
  };

  sorts = [
    {
      key: 'number',
      name: 'invoice',
      default_order: 'desc'
    },
    {
      key: 'total',
      name: 'invoice_table_amount_heading'
    },
    {
      key: 'total_tax',
      name: 'invoice_total_tax'
    },
    {
      key: 'date',
      name: 'invoice_payments_table_date_heading'
    },
    {
      key: 'company',
      name: 'client'
    },
    {
      key: 'project_name',
      name: 'project'
    },
    {
      key: 'tags',
      name: 'tags'
    },
    {
      key: 'duedate',
      name: 'invoice_dt_table_heading_duedate'
    },
    {
      key: 'status',
      name: 'invoice_dt_table_heading_status'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService,
  ) {
    STORAGE_INVOICE_KEY = this.authService.IDENTIFIER + STORAGE_INVOICE_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}) {
    let API_URL = `/mpc_mobile_app_connector/v2/invoices/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v2/invoices/${id}`;
    }
    console.log('invoiceStorage');
    return this.http.get(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_INVOICE_KEY, res);
        }

        // console.log('loaded api invoice: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getPDF(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/invoices/pdf/' + id + '?output_type=S').pipe(
      tap(res => {
        // console.log('loaded api invoice pdf: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getInvoiceActivity(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/invoices/activity/${id}`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api invoice activity: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any, invoiceItems: any) {
    var form_data = new FormData();

    for(let mode of formData.allowed_payment_modes) {
      form_data.append(`allowed_payment_modes[]`, `${mode}`);
    }
    
    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.invoice) {
        if(typeof formData.custom_fields.invoice[custom_field] == 'object') {
          for (let _index in formData.custom_fields.invoice[custom_field]) {
            form_data.append('custom_fields[invoice][' + custom_field + '][' + _index + ']', formData.custom_fields.invoice[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[invoice][' + custom_field + ']', formData.custom_fields.invoice[custom_field]);
        }
      }
    }
   
    for (var key in formData) {
      if(key == 'clientid') {
        form_data.append('clientid', formData.clientid.userid);
      } else if(key == 'project_id' && formData.project_id !== null && formData.project_id != '') {
        form_data.append('project_id', formData.project_id.id);
      }

      if(['select_item', 'allowed_payment_modes', 'custom_fields', 'clientid', 'project_id'].includes(key)) {
        continue;
      }

      form_data.append(key, formData[key]);
    }

    for (var key in invoiceItems) {
      if (invoiceItems[key].taxrate != null) {
        invoiceItems[key].taxname = [];
        for (const tax of invoiceItems[key].taxrate) {
          form_data.append(`newitems[${key}][taxname][]`, `${tax.name}|${tax.taxrate}`);
        }
      }

      form_data.append(`newitems[${key}][order]`, key);
      form_data.append(`newitems[${key}][description]`, invoiceItems[key].description);
      form_data.append(`newitems[${key}][long_description]`, invoiceItems[key].long_description);
      form_data.append(`newitems[${key}][qty]`, invoiceItems[key].qty);
      form_data.append(`newitems[${key}][rate]`, invoiceItems[key].rate);
      form_data.append(`newitems[${key}][unit]`, '');
    }

    return this.http.post('/mpc_mobile_app_connector/v1/invoices', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('invoice inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(invoice_id: any, formData: any, invoiceItems: any) {
    const form_data = formData;
    
    delete form_data.select_item;
    
    form_data.clientid = formData.clientid.userid;

    if (form_data.project_id !== null) {
      form_data.project_id = formData.project_id.id;
    }

    for (var key in invoiceItems) {
      if (invoiceItems[key].taxrate != null) {
        invoiceItems[key].taxname = [];
        for (const tax of invoiceItems[key].taxrate) {
          invoiceItems[key].taxname.push(`${tax.name}|${tax.taxrate}`);
        }
      }

      delete invoiceItems[key].taxrate;
      invoiceItems[key].order = key;
    }

    form_data.newitems = invoiceItems;
    form_data.items = [];
    return this.http.put<any>('/mpc_mobile_app_connector/v1/invoices/' + invoice_id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('invoice updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  sendToEmail(formData: any, invoice_id: any) {
    var form_data = new FormData();

    for(let email of formData.sent_to) {
      form_data.append(`sent_to[]`, `${email}`);
    }
    delete formData.sent_to;
    
    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/invoices/send_to_email/' + invoice_id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('invoice email sent to customer: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(invoice_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/invoices/' + invoice_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('invoice deleted: ', res);
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

  deleteInvoiceActivity(id: any) {
    return this.http.delete(`/mpc_mobile_app_connector/v1/invoices/activity/${id}`).pipe(
      map(res => res),
      tap((res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        // console.log('loaded api invoice activity delete: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  markAs(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/invoices/mark_as_' + status + '/' + id).pipe(
      tap(res => {
        // console.log('loaded api invoice mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  unmarkAs(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/invoices/unmark_as_' + status + '/' + id).pipe(
      tap(res => {
        // console.log('loaded api invoice unmark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  copy(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/invoices/copy/' + id).pipe(
      tap(res => {
        // console.log('loaded api invoice copy: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  
  createCreditNote(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/credit_notes/credit_note_from_invoice/' + id).pipe(
      tap(res => {
        // console.log('loaded api credit note: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getInvoicesTotal(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v2/invoices/get_invoices_total', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('invoice get invoices total: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
