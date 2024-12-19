import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';

@Injectable({
  providedIn: 'root'
})
export class TodoApiService {

  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService
  ) {}

  store(formData: any) {
    var form_data = new FormData();
    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/todo', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('todo inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(todo_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/todo/' + todo_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('todo updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(todo_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/todo/' + todo_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('todo deleted: ', res);
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
