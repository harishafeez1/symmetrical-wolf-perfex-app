import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

import { AuthenticationService } from './authentication.service';
import { Estimate } from '../interfaces/estimate';
import { InvoiceItem } from '../interfaces/invoice-item';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';

export var STORAGE_ESTIMATE_KEY = '-estimates';

@Injectable({
  providedIn: 'root'
})
export class EstimateApiService {
  sort: Sorting = {
    sort_by: 'number',
    order: 'desc'
  };

  sorts = [
    {
      key: 'number',
      name: 'estimate',
      default_order: 'desc'
    },
    {
      key: 'total',
      name: 'estimate_table_amount_heading'
    },
    {
      key: 'total_tax',
      name: 'estimates_total_tax'
    },
    {
      key: 'company',
      name: 'estimate_dt_table_heading_client'
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
      key: 'date',
      name: 'estimate_dt_table_heading_date'
    },
    {
      key: 'expirydate',
      name: 'estimate_data_expiry_date'
    },
    {
      key: 'reference_no',
      name: 'reference'
    },
    {
      key: 'status',
      name: 'estimate_status'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService
    ) {
      STORAGE_ESTIMATE_KEY = this.authService.IDENTIFIER + STORAGE_ESTIMATE_KEY;
    }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}) {
    let API_URL = `/mpc_mobile_app_connector/v1/estimates/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/estimates/${id}`;
    }
    console.log('estimateStorage');
    return this.http.get(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        if(id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_ESTIMATE_KEY, res);
        }
       
        // console.log('loaded api estimate: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getActivity(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/estimates/activity/${id}`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api estimate activity: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any, Items: any) {
    var form_data = new FormData();
   
    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.estimate) {
        if(typeof formData.custom_fields.estimate[custom_field] == 'object') {
          for (let _index in formData.custom_fields.estimate[custom_field]) {
            form_data.append('custom_fields[estimate][' + custom_field + '][' + _index + ']', formData.custom_fields.estimate[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[estimate][' + custom_field + ']', formData.custom_fields.estimate[custom_field]);
        }
      }
    }

    for (var key in formData) {
      if(key == 'clientid') {
        form_data.append('clientid', formData.clientid.userid);
      } else if(key == 'project_id' && formData.project_id != null && formData.project_id != '') {
        form_data.append('project_id', formData.project_id.id);
      }
      
      if(['select_item', 'removed_items', 'custom_fields', 'clientid', 'project_id'].includes(key)) {
        continue;
      }

      form_data.append(key, formData[key]);
    }

    for(var key in Items) {
      if(Items[key].taxrate != null) {
        Items[key].taxname = [];
        for(const tax of Items[key].taxrate) {
          form_data.append(`newitems[${key}][taxname][]`, `${tax.name}|${tax.taxrate}`);
        }
      }

      form_data.append(`newitems[${key}][order]`, key);
      form_data.append(`newitems[${key}][description]`, Items[key].description);
      form_data.append(`newitems[${key}][long_description]`, Items[key].long_description);
      form_data.append(`newitems[${key}][qty]`, Items[key].qty);
      form_data.append(`newitems[${key}][rate]`, Items[key].rate);
      form_data.append(`newitems[${key}][unit]`, '');
    }
    
    return this.http.post<any>('/mpc_mobile_app_connector/v1/estimates', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('estimate inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(id: any, formData: any, Items: any) {
    delete formData.select_item;
    
    formData.clientid = formData.clientid.userid;

    if(formData.project_id !== null) {
      formData.project_id = formData.project_id.id;
    }

    for(var key in Items) {
      if(Items[key].taxrate != null) {
        Items[key].taxname = [];
        for(const tax of Items[key].taxrate) {
          Items[key].taxname.push(`${tax.name}|${tax.taxrate}`);
        }
      }

      delete Items[key].taxrate;
      Items[key].order = key;
    }

    formData.newitems = Items;
    formData.items = [];
    return this.http.put<any>('/mpc_mobile_app_connector/v1/estimates/' + id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('estimate updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/estimates/' + id).pipe(map(res => res),
      tap((res: any) => {
        console.log('estimate deleted: ', res);
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
    return this.http.get<any>('/mpc_mobile_app_connector/v1/estimates/pdf/' + id + '?output_type=S').pipe(
      tap(res => {
        // console.log('loaded api estimate pdf: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  copy(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/estimates/copy/' + id).pipe(
      tap(res => {
        // console.log('loaded api estimate copy: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  markAs(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/estimates/mark_action_status/' + status + '/' + id).pipe(
      tap(res => {
        // console.log('loaded api estimate mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  toInvoice(id,status) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/estimates/convert_to_invoice/' + id + '/' + status).pipe(
      tap(res => {
        // console.log('loaded api estimate convert to invoice: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  deleteEstimateActivity(id: any) {
    return this.http.delete(`/mpc_mobile_app_connector/v1/estimates/activity/${id}`).pipe(
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


}
