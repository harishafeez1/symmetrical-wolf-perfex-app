import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';

export var STORAGE_CUSTOM_FIELD_KEY = '-custom_fields';

@Injectable({
  providedIn: 'root'
})
export class CustomFieldApiService {

  constructor(
    public http: HttpClient,
    private toastController: ToastController,
    private storageService: StorageService,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService
  ) {
    STORAGE_CUSTOM_FIELD_KEY = this.authService.IDENTIFIER + STORAGE_CUSTOM_FIELD_KEY;
  }

  get(id = '', type = ''): Observable<any[]> {
  
    let API_URL = `/mpc_mobile_app_connector/v1/custom_fields/${type}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/custom_fields/${type}/${id}`;
    }
    return this.http.get(API_URL).pipe(
      tap((res: any) => {
        if(id == '' && res.status != false) {
          this.storageService.setObject(STORAGE_CUSTOM_FIELD_KEY + type, res);
        }
       
        // console.log('loaded api custom field: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
