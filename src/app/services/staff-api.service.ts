import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
import { StorageService } from './storage.service';
export var STORAGE_STAFF_KEY = '-staffs';


@Injectable({
  providedIn: 'root'
})
export class StaffApiService {
  sort: Sorting = {
    sort_by: 'firstname',
    order: 'asc'
  };

  sorts = [
    {
      key: 'firstname',
      name: 'staff_dt_name',
      default_order: 'asc'
    },
    {
      key: 'email',
      name: 'staff_dt_email'
    },
    {
      key: 'name',
      name: 'role'
    },
    {
      key: 'last_login',
      name: 'staff_dt_last_Login'
    },
    {
      key: 'active',
      name: 'staff_dt_active'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    public authService: AuthenticationService,
    private storageService: StorageService,
  ) {
    STORAGE_STAFF_KEY = this.authService.IDENTIFIER + STORAGE_STAFF_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/staffs/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/staffs/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        console.log('loaded api staff: ', res);
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_STAFF_KEY, res);
        }
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
      for (let custom_field in formData.custom_fields.staff) {
        if (typeof formData.custom_fields.staff[custom_field] == 'object') {
          for (let _index in formData.custom_fields.staff[custom_field]) {
            form_data.append('custom_fields[staff][' + custom_field + '][' + _index + ']', formData.custom_fields.staff[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[staff][' + custom_field + ']', formData.custom_fields.staff[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      if (typeof formData[key] == 'object') {
        for (let i in formData[key]) {
          form_data.append(key + '[]', formData[key][i]);
        }
      } else {
        form_data.append(key, formData[key]);
      }
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/staffs', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('staff inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(customer_id: any, formData: any) {
    var form_data = new FormData();
    for (var key in formData) {
      form_data.append(key, formData[key]);
    }
    return this.http.put<any>('/mpc_mobile_app_connector/v1/staffs/' + customer_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('staff updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(userid) {
    return this.http.delete('/mpc_mobile_app_connector/v1/staffs/' + userid).pipe(map(res => res),
      tap((res: any) => {
        console.log('staff deleted: ', res);
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

  changeStatus(staffId: any, status: number) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/staffs/change_status/${staffId}/${status}`).pipe(
      map(res => res),
      tap(res => {
        console.log('staff change status: ', res);
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

  addProfileImage(id, file: any) {
    var form_data = new FormData();
    form_data.append('profile_image', file);

    return this.http.post<any>('/mpc_mobile_app_connector/v1/staffs/profile_image/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('staff attachment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
