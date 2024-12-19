import { HttpClient } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { DateTimePipe } from '../pipes/date-time.pipe';
export var STORAGE_REMINDER_KEY = '-reminders';

@Injectable({
  providedIn: 'root'
})
export class ReminderApiService {
  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService,
    private dateTimePipe: DateTimePipe
  ) {
    STORAGE_REMINDER_KEY = this.authService.IDENTIFIER + STORAGE_REMINDER_KEY;
  }

  get(id = '', rel_type = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/reminders/${id}/${rel_type}/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api ' + rel_type + ' reminder: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();
    formData.date = this.formatDate(formData.date);
    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/reminders', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('reminder inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(reminder_id: any, formData: any) {
    formData.date = this.formatDate(formData.date);
    return this.http.put<any>('/mpc_mobile_app_connector/v1/reminders/' + reminder_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('reminder updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(reminder_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/reminders/' + reminder_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('reminder deleted: ', res);
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

  formatDate(value: any) {
    return this.dateTimePipe.transform(value, 'datetime');
  }
}
