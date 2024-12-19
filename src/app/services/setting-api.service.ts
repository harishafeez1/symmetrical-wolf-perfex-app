import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
export var STORAGE_SETTING_KEY = '-settings';

@Injectable({
  providedIn: 'root'
})
export class SettingApiService {
  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    public authService: AuthenticationService
  ) {
    STORAGE_SETTING_KEY = this.authService.IDENTIFIER + STORAGE_SETTING_KEY;
  }

  get(type: string = '', notification_token: string = ''): Observable<any[]> {
    return this.http.get<any>(`https://t29zrfey40.execute-api.us-east-1.amazonaws.com/settings/${type}/${notification_token}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api staff: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(type: string = '', notification_token: string = '', formData: any) {
    return this.http.post(`https://t29zrfey40.execute-api.us-east-1.amazonaws.com/settings/${type}/${notification_token}`, JSON.stringify(formData), {
      headers: {
        'content-type': 'application/json'
      }
    }).pipe(
      map(res => res),
      tap(res => {
        console.log('setting updated: ', res);
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
}
