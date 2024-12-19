import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
import { StorageService } from './storage.service';
export var STORAGE_TICKET_KEY = '-tickets';

@Injectable({
  providedIn: 'root'
})
export class TicketApiService {
  sort: Sorting = {
    sort_by: 'date',
    order: 'desc'
  };

  sorts = [
    {
      key: 'ticketid',
      name: 'id'
    },
    {
      key: 'subject',
      name: 'ticket_dt_subject'
    },
    {
      key: 'tags',
      name: 'tags'
    },
    {
      key: 'department_name',
      name: 'ticket_dt_department'
    },
    {
      key: 'service_name',
      name: 'ticket_dt_service'
    },
    {
      key: 'contact_full_name',
      name: 'ticket_dt_submitter'
    },
    {
      key: 'status',
      name: 'ticket_dt_status'
    },
    {
      key: 'priority',
      name: 'ticket_dt_priority'
    },
    {
      key: 'lastreply',
      name: 'ticket_dt_last_reply'
    },
    {
      key: 'date',
      name: 'ticket_date_created',
      default_order: 'desc'
    }
  ];

  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
  ) {
    STORAGE_TICKET_KEY = this.authService.IDENTIFIER + STORAGE_TICKET_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/tickets/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/tickets/${id}`;
    }
    return this.http.get(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        console.log('loaded api ticket: ', res);
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_TICKET_KEY, res);
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getDepartments() {
    return this.http.get(`/mpc_mobile_app_connector/v1/tickets/departments`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api ticket: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getPriorities() {
    return this.http.get(`/mpc_mobile_app_connector/v1/tickets/priorities`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api ticket: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getServices() {
    return this.http.get(`/mpc_mobile_app_connector/v1/tickets/services`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api ticket: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getStatuses() {
    return this.http.get(`/mpc_mobile_app_connector/v1/tickets/statuses`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api ticket statuses: ', res);
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
      for (let custom_field in formData.custom_fields.tickets) {
        if(typeof formData.custom_fields.tickets[custom_field] == 'object') {
          for (let _index in formData.custom_fields.tickets[custom_field]) {
            form_data.append('custom_fields[tickets][' + custom_field + '][' + _index + ']', formData.custom_fields.tickets[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[tickets][' + custom_field + ']', formData.custom_fields.tickets[custom_field]);
        }
      }
    }
  
    for (var key in formData) {
      if(key == 'contactid' && ![0, false, 'undefined', ''].includes(formData.contactid)) {
        form_data.append('contactid', formData.contactid.id);
        form_data.append('userid', formData.contactid.userid);
      }

      if(['contactid', 'custom_fields'].includes(key)) {
        continue;
      }

      if(typeof formData[key] == 'object') {
        for (let _index in formData[key]) {
          form_data.append(key +'[' + _index + ']', formData[key][_index]);
        }
      } else {
        form_data.append(key, formData[key]);
      }
    }
    console.log('form_data =>', form_data);
    // return;
    return this.http.post<any>('/mpc_mobile_app_connector/v1/tickets', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('ticket inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  addReply(id: number, formData: any) {
    var form_data = new FormData();
    for (var key in formData) {
      if(typeof formData[key] == 'object') {
        for (let _index in formData[key]) {
          form_data.append(key +'[' + _index + ']', formData[key][_index]);
        }
      } else {
        form_data.append(key, formData[key]);
      }
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/tickets/add_reply/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('ticket inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(ticket_id: any, formData: any) {

    if(![0, false, 'undefined', ''].includes(formData.contactid)) {
      formData.contactid = formData.contactid.id;
      formData.userid = formData.contactid.userid;
    } else {
      delete formData.contactid;
    }

    return this.http.put<any>('/mpc_mobile_app_connector/v1/tickets/' + ticket_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('ticket updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(ticket_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/tickets/' + ticket_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('ticket deleted: ', res);
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
  getFiles(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/tickets/files/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api task files: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  uploadFile(id, file: any) {
    var form_data = new FormData();
    form_data.append('file', file);
    
    return this.http.post<any>('/mpc_mobile_app_connector/v1/tickets/files/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('ticket file uploaded: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  deleteFile(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/tickets/files/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('ticket attachment deleted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  markAsStatus(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/tickets/mark_action_status/' + status + '/' + id).pipe(
      tap(res => {
        console.log('loaded api ticket mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
