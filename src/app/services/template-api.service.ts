import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { StorageService } from './storage.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SettingsHelper } from '../classes/settings-helper';

@Injectable({
  providedIn: 'root'
})
export class TemplateApiService {
  settings:any;
  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    private settingHelper: SettingsHelper
    
  ) { 
    this.settingHelper.settings.subscribe(response => {
      this.settings = response;
    });
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    const version = this.settings?.perfex_current_version >= '314' ? 'v2' : 'v1';
    let API_URL = `/mpc_mobile_app_connector/${version}/templates/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/${version}/templates/${id}`;
    }
    return this.http.get(API_URL).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api template: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }
    const version = this.settings?.perfex_current_version >= '314' ? 'v2' : 'v1';
    return this.http.post<any>(`/mpc_mobile_app_connector/${version}/templates`, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('template inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(template_id: any, formData: any) {
    const version = this.settings?.perfex_current_version >= '314' ? 'v2' : 'v1';
    return this.http.put<any>(`/mpc_mobile_app_connector/${version}/templates/` + template_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('template updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(template_id) {
    const version = this.settings?.perfex_current_version >= '314' ? 'v2' : 'v1';
    return this.http.delete(`/mpc_mobile_app_connector/${version}/templates/` + template_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('template deleted: ', res);
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
