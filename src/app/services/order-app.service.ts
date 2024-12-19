import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MpcToastService } from './mpc-toast.service';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class OrderAppService {

  baseURL = 'https://crm.k9.technology'; 
  constructor(    public http: HttpClient,
    private mpcToast: MpcToastService,public platform: Platform) { }

    purchaseApp(formData: any) {
      var form_data = new FormData();
      if(this.platform.is('android')){
        formData.source = '5'
      }else if(this.platform.is('ios')){
        formData.source = '4'
      }
      
      if (formData.custom_fields && formData.custom_fields !== null) {
        for (let custom_field in formData.custom_fields.leads) {
          if(typeof formData.custom_fields.leads[custom_field] == 'object') {
            for (let _index in formData.custom_fields.leads[custom_field]) {
              form_data.append('custom_fields[leads][' + custom_field + '][' + _index + ']', formData.custom_fields.leads[custom_field][_index]);
            }
          } else {
            form_data.append('custom_fields[leads][' + custom_field + ']', formData.custom_fields.leads[custom_field]);
          }
        }
      }
      delete formData.custom_fields;
  
      for (var key in formData) {
        form_data.append(key, formData[key]);
      }
      // /v2/order
      return this.http.post<any>(this.baseURL + '/mpc_mobile_app_connector/v1/leads', form_data).pipe(
        map(res => res),
        tap(res => {
          // console.log('lead inserted: ', res);
        }),
        catchError((err) => {
          this.mpcToast.show(err, 'danger');
          return throwError(() => err);
        })
      ) as any;
    }
}
