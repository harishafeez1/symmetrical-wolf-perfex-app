import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MpcToastService } from './mpc-toast.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DownloadApiService {

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService
  ) { }

  get(folder_indicator, attachmentid = ''): Observable<any> {
    return this.http.get(`/mpc_mobile_app_connector/v1/download/file/${folder_indicator}/${attachmentid}`, { responseType: 'blob' }).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api download attachment: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
