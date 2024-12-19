import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';

export var STORAGE_CONTACT_KEY = '-contacts';

@Injectable({
  providedIn: 'root'
})
export class ContactApiService {
  sort: Sorting = {
    sort_by: 'id',
    order: 'desc'
  };

  sorts = [
    {
      key: 'id',
      name: 'id',
      default_order: 'desc'
    },
    {
      key: 'full_name',
      name: 'name'
    },
    {
      key: 'email',
      name: 'staff_dt_email'
    },
    {
      key: 'title',
      name: 'contact_position'
    },
    {
      key: 'last_login',
      name: 'staff_dt_last_Login'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService
  ) {
    STORAGE_CONTACT_KEY = this.authService.IDENTIFIER + STORAGE_CONTACT_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/contacts/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/contacts/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res:any) => {
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_CONTACT_KEY, res);
        }

        // console.log('loaded api contacts: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();

    if ([false, 0].includes(formData.invoice_emails)) {
      delete formData.invoice_emails;
    }

    if ([false, 0].includes(formData.estimate_emails)) {
      delete formData.estimate_emails;
    }

    if ([false, 0].includes(formData.credit_note_emails)) {
      delete formData.credit_note_emails;
    }

    if ([false, 0].includes(formData.task_emails)) {
      delete formData.task_emails;
    }

    if ([false, 0].includes(formData.project_emails)) {
      delete formData.project_emails;
    }
    if ([false, 0].includes(formData.ticket_emails)) {
      delete formData.ticket_emails;
    }
    if ([false, 0].includes(formData.contract_emails)) {
      delete formData.contract_emails;
    }

    console.log('permissions:', formData.permissions);
    if (formData.permissions && formData.permissions !== null) {
      for (let permission in formData.permissions) {
        if(formData.permissions[permission] !== false) {
          form_data.append('permissions[]', permission);
        }
      }
    }

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.contacts) {
        if(typeof formData.custom_fields.contacts[custom_field] == 'object') {
          for (let _index in formData.custom_fields.contacts[custom_field]) {
            form_data.append('custom_fields[contacts][' + custom_field + '][' + _index + ']', formData.custom_fields.contacts[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[contacts][' + custom_field + ']', formData.custom_fields.contacts[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      if (key == 'permissions') {
        continue;
      }

      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/contacts', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('contacts inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(contact_id: any, formData: any) {
    delete formData.customer_id;
    delete formData.donotsendwelcomeemail;

    if (formData.password == null) {
      delete formData.send_set_password_email;
    }

    if ([false, 0].includes(formData.invoice_emails)) {
      delete formData.invoice_emails;
    }

    if ([false, 0].includes(formData.estimate_emails)) {
      delete formData.estimate_emails;
    }

    if ([false, 0].includes(formData.credit_note_emails)) {
      delete formData.credit_note_emails;
    }

    if ([false, 0].includes(formData.task_emails)) {
      delete formData.task_emails;
    }

    if ([false, 0].includes(formData.project_emails)) {
      delete formData.project_emails;
    }
    if ([false, 0].includes(formData.ticket_emails)) {
      delete formData.ticket_emails;
    }
    if ([false, 0].includes(formData.contract_emails)) {
      delete formData.contract_emails;
    }

    let __permissions = [];
    for (let permission in formData.permissions) {
      if (formData.permissions[permission] !== false) {
        __permissions.push(permission);
      }
    }

    formData.permissions = __permissions;

    return this.http.put<any>('/mpc_mobile_app_connector/v1/contacts/' + contact_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('contacts inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(userid) {
    return this.http.delete('/mpc_mobile_app_connector/v1/delete/contacts/' + userid).pipe(map(res => res),
      tap((res: any) => {
        console.log('contacts deleted: ', res);
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

  changeStatus(contact_id: any, status: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/contacts/change_contact_status/${contact_id}/${status}`).pipe(
      map(res => res),
      tap(res => {
        console.log('contact status update: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  addProfileImage(id, file: any) {
    var form_data = new FormData();
    form_data.append('profile_image', file);

    return this.http.post<any>('/mpc_mobile_app_connector/v1/contacts/profile_image/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('contact attachment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteProfileImage(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/contacts/profile_image/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('contact attachment deleted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
