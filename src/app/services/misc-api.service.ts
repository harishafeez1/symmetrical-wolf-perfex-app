import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MpcToastService } from './mpc-toast.service';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MiscApiService {

  constructor(public http: HttpClient, private mpcToast: MpcToastService) { }

  toggleFileVisibility(id) {
    return this.http.get('/mpc_mobile_app_connector/v1/misc/toggle_file_visibility/' + id).pipe(map(res => res),
      tap((res: any) => {
        console.log('toggle_file_visibility: ', res);
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

  deleteSaleActivity(id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/misc/delete_sale_activity/' + id).pipe(map(res => res),
      tap((res: any) => {
        console.log('sale activity deleted: ', res);
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
