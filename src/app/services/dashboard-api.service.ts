import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
export var STORAGE_DASHBOARD_KEY = '-dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService
  ) {
    STORAGE_DASHBOARD_KEY = this.authService.IDENTIFIER + STORAGE_DASHBOARD_KEY;
  }

  get() {
    return this.http.get(`/mpc_mobile_app_connector/v2/dashboard`).pipe(
      map(res => res),
      tap((res:any) => {
        console.log('loaded api dashboard: ', res);
        if(res.status != false) {
          this.storageService.setObject(STORAGE_DASHBOARD_KEY, res);
        }else{
          this.mpcToast.show(res.message, 'danger');  
        }
      }),
      catchError((err) => {
        console.log('err =>', err);
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  changeTodoStatus(todoid, status) {
    return this.http.get(`/mpc_mobile_app_connector/v1/todo/change_todo_status/${todoid}/${status}`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api dashboard: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
