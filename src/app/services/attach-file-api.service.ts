import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MpcToastService } from './mpc-toast.service';
import { catchError, map, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttachFileApiService {

  constructor(public http: HttpClient,private mpcToast: MpcToastService) { }
  
  addAttachment(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/misc/upload_sales_file', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log(' attachment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteAttachment(id, type = 'credit_notes') {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/' + type + '/delete_attachment/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log(' attachment deleted: ', res);
      }),
      catchError((err) => {
        console.log('error =>', err);
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  visibleToCustomerStatus(attachment_id: any, status: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/attachment/visible_to_customer/${attachment_id}/${status}`).pipe(
      map(res => res),
      tap(res => {
        console.log('attachment status update: ', res);
      }),
      catchError((err) => {
        console.log('err =>', err);
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
