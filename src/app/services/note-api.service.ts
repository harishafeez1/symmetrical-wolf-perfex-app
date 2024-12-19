import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
export var STORAGE_NOTE_KEY = '-notes';

@Injectable({
  providedIn: 'root'
})
export class NoteApiService {
  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    public authService: AuthenticationService
  ) {
    STORAGE_NOTE_KEY = this.authService.IDENTIFIER + STORAGE_NOTE_KEY;
  }

  get(rel_type = '', rel_id = ''): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/notes?rel_type=${rel_type}&rel_id=${rel_id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api item: ', res);
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

    let URL = '/mpc_mobile_app_connector/v1/notes';
    if(formData.rel_type === 'lead') {
      URL = '/mpc_mobile_app_connector/v1/leads/add_note';
    }

    return this.http.post<any>(URL, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('item inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(note_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/notes/' + note_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('item inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(note_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/notes/' + note_id).pipe(map(res => res),
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
}
