import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
import { StorageService } from './storage.service';

export var STORAGE_LEAD_KEY = '-leads';
export var STORAGE_LEAD_STATUS_KEY = '-leads';

@Injectable({
  providedIn: 'root'
})
export class LeadApiService {
  sort: Sorting = {
    sort_by: 'dateadded',
    order: 'desc'
  };

  sorts = [
    {
      key: 'id',
      name: 'id'
    },
    {
      key: 'name',
      name: 'name'
    },
    {
      key: 'company',
      name: 'lead_company'
    },
    {
      key: 'email',
      name: 'leads_dt_email'
    },
    {
      key: 'phonenumber',
      name: 'leads_dt_phonenumber'
    },
    {
      key: 'lead_value',
      name: 'lead_add_edit_lead_value'
    },
    {
      key: 'tags',
      name: 'tags'
    },
    {
      key: 'assigned_firstname',
      name: 'leads_dt_assigned'
    },
    {
      key: 'status_name',
      name: 'leads_dt_status'
    },
    {
      key: 'source_name',
      name: 'lead_add_edit_source'
    },
    {
      key: 'lastcontact',
      name: 'leads_dt_last_contact'
    },
    {
      key: 'dateadded',
      name: 'leads_dt_datecreated',
      default_order: 'desc'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    public authService: AuthenticationService,
    private storageService: StorageService,
  ) {
    STORAGE_LEAD_KEY = this.authService.IDENTIFIER + STORAGE_LEAD_KEY;
    STORAGE_LEAD_STATUS_KEY = this.authService.IDENTIFIER + STORAGE_LEAD_STATUS_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/leads/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/leads/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        // console.log('loaded api lead: ', res);
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_LEAD_KEY, res);
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getLeadActivity(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/leads/activity/${id}`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api lead activity: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  get_statuses(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/lead_statuses`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api lead statuses: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  get_sources(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/lead_sources`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api lead sources: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();
    
    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.leads) {
        if(typeof formData.custom_fields.leads[custom_field] == 'object') {
          for (let _index in formData.custom_fields.leads[custom_field]) {
            form_data.append('custom_fields[leads][' + custom_field + '][' + _index + ']', formData.custom_fields.leads[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[leads][' + custom_field + ']', formData.custom_fields.leads[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/leads', form_data).pipe(
      map(res => res),
      tap(res => {
        // console.log('lead inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  
  convert_to_customer(formData: any) {
    var form_data = new FormData();
    
    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.leads) {
        if(typeof formData.custom_fields.leads[custom_field] == 'object') {
          for (let _index in formData.custom_fields.leads[custom_field]) {
            form_data.append('custom_fields[leads][' + custom_field + '][' + _index + ']', formData.custom_fields.leads[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[leads][' + custom_field + ']', formData.custom_fields.leads[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/leads/convert_to_customer', form_data).pipe(
      map(res => res),
      tap(res => {
        // console.log('lead converted into customer: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  storeAttachments(lead_id: any, formData: any) {
    var form_data = new FormData();
    
    for (var key in formData) {
      form_data.append('file[]', formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/leads/attachments/' + lead_id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('lead attachments inserted: ', res);
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

  update(customer_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/leads/' + customer_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('lead inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(leadId) {
    return this.http.delete('/mpc_mobile_app_connector/v1/leads/' + leadId).pipe(map(res => res),
      tap((res: any) => {
        console.log('lead deleted: ', res);
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

  deleteAttachment(attachment_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/leads/attachments/' + attachment_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('lead attachment deleted: ', res);
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
    return this.http.get<any>('/mpc_mobile_app_connector/v1/leads/pdf/' + id + '?output_type=S').pipe(
      tap(res => {
        // console.log('loaded api credit note pdf: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  markAsLost(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/leads/mark_as_lost/' + status + '/' + id).pipe(
      tap(res => {
        // console.log('loaded api lead mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  markAsJunk(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/leads/mark_as_junk/' + status + '/' + id).pipe(
      tap(res => {
        // console.log('loaded api lead mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  addActivity(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/leads/add_activity', form_data).pipe(
      map(res => res),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
