import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
export var STORAGE_NOTIFICATION_KEY = '-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService {

  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService
  ) {
    STORAGE_NOTIFICATION_KEY = this.authService.IDENTIFIER + STORAGE_NOTIFICATION_KEY;
  }

  get(id = '', offset = null, limit = null): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/notifications/?limit=${limit}&offset=${offset}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/notifications/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api notification: ', res);
      }),
      // catchError(this.handleError)
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  markAllRead() {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/notifications/mark_all_as_read').pipe(
      map(res => res),
      tap((res: any) => {
        console.log('note deleted: ', res);
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

  markAsReadUnread(id, action) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/notifications/mark_as/' + id + '/' + action).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api notification mark all read: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  storeDevice(data: any) {
    var form_data = new FormData();
    const authUser = this.authService.auth?.data;
    form_data.append('token', data.token);
    form_data.append('device_id', data.device_id);
    form_data.append('additional_data', data.additional_data);
    form_data.append('user_id', authUser.staffid);
    

    return this.http.post<any>('/mpc_mobile_app_connector/v1/notifications', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('notification token inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
