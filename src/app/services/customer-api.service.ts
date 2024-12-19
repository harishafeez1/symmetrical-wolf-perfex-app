import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { CommonHelper } from '../classes/common-helper';
import { Sorting } from '../interfaces/sorting';

export var STORAGE_CUSTOMER_KEY = '-customers';

@Injectable({
  providedIn: 'root'
})
export class CustomerApiService {
  sort: Sorting = {
    sort_by: 'company',
    order: 'asc'
  };

  sorts = [
    {
      key: 'userid',
      name: 'id'
    },
    {
      key: 'company',
      name: 'clients_company',
      default_order: 'asc'
    },
    {
      key: 'firstname',
      name: 'contact_primary'
    },
    {
      key: 'email',
      name: 'company_primary_email'
    },
    {
      key: 'phonenumber',
      name: 'clients_phone'
    },
    {
      key: 'active',
      name: 'customer_active'
    },
    {
      key: 'customerGroups',
      name: 'customer_groups'
    },
    {
      key: 'datecreated',
      name: 'date_created'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService,
    private commonHelper: CommonHelper
  ) {
    STORAGE_CUSTOMER_KEY = this.authService.IDENTIFIER + STORAGE_CUSTOMER_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {

    let API_URL = `/mpc_mobile_app_connector/v1/customers/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/customers/${id}`;
    }
    return this.http.get(API_URL).pipe(
      tap((res:any) => {
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_CUSTOMER_KEY, res);
        }

        // console.log('loaded api customers: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  get_groups() {
    return this.http.get(`/mpc_mobile_app_connector/v1/customer_groups`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api customer groups: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();

    if (formData.groups_in && formData.groups_in !== null) {
      for (let group of formData.groups_in) {
        form_data.append('groups_in[]', group);
      }
    }
    delete formData.groups_in;

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.customers) {
        if (typeof formData.custom_fields.customers[custom_field] == 'object') {
          for (let _index in formData.custom_fields.customers[custom_field]) {
            if (formData.custom_fields.customers[custom_field][_index] !== false) {
              form_data.append('custom_fields[customers][' + custom_field + '][]', formData.custom_fields.customers[custom_field][_index]);
            }
          }
        } else {
          form_data.append('custom_fields[customers][' + custom_field + ']', formData.custom_fields.customers[custom_field]);
        }
      }
    }

    delete formData.custom_fields;

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }
    return this.http.post<any>('/mpc_mobile_app_connector/v1/customers', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('customers inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(customer_id: any, formData: any) {
    var form_data = new FormData();
    console.log(formData);
    if (formData.groups_in && formData.groups_in !== null) {
      for (let group of formData.groups_in) {
        form_data.append('groups_in[]', group);
      }
    }

    for (var key in formData) {
      if (key == 'groups_in') {
        continue;
      }

      form_data.append(key, formData[key]);
    }
    return this.http.put<any>('/mpc_mobile_app_connector/v1/customers/' + customer_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('customers inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  changeStatus(customer_id: any, status: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/customers/change_client_status/${customer_id}/${status}`).pipe(
      map(res => res),
      tap(res => {
        console.log('customers status update: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

 delete(userid) {
    return  this.http.delete('/mpc_mobile_app_connector/v1/delete/customers/' + userid).pipe(map(res => res),
      tap((res: any) => {
        console.log('customers deleted: ', res);
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
