import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
import { StorageService } from './storage.service';
export var STORAGE_ITEM_KEY = '-invoice_items';

@Injectable({
  providedIn: 'root'
})
export class ItemApiService {
  sort: Sorting = {
    sort_by: 'name',
    order: 'asc'
  };

  sorts = [
    {
      key: 'name',
      name: 'item_description_placeholder',
      default_order: 'asc'
    },
    {
      key: 'subtext',
      name: 'item_long_description_placeholder'
    },
    {
      key: 'rate',
      name: 'item_rate_placeholder'
    },
    {
      key: 'taxrate_1',
      name: 'tax_1'
    },
    {
      key: 'taxrate_2',
      name: 'tax_2'
    },
    {
      key: 'unit',
      name: 'unit'
    },
    {
      key: 'group_name',
      name: 'item_group_name'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    public authService: AuthenticationService,
    private storageService: StorageService,
    ) {
      STORAGE_ITEM_KEY = this.authService.IDENTIFIER + STORAGE_ITEM_KEY;
    }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/items/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/items/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        // console.log('loaded api item: ', res);
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_ITEM_KEY, res);
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  copy(id = ''): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/items/copy/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api item copy: ', res);
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

  getGroups(): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/items/get_groups`;
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api item groups: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();
    
    if(formData.tax != 'undefined') {
      formData.tax = formData.tax.id;
    } else {
      delete formData.tax;
    }

    if(formData.tax2 != 'undefined') {
      formData.tax2 = formData.tax2.id;
    } else {
      delete formData.tax2;
    }

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.items) {
        if(typeof formData.custom_fields.items[custom_field] == 'object') {
          for (let _index in formData.custom_fields.items[custom_field]) {
            form_data.append('custom_fields[items][' + custom_field + '][' + _index + ']', formData.custom_fields.items[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[items][' + custom_field + ']', formData.custom_fields.items[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/items', form_data).pipe(
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

  update(item_id: any, formData: any) {
   
    if(formData.tax != 'undefined') {
      formData.tax = formData.tax.id;
    } else {
      delete formData.tax;
    }

    if(formData.tax2 != 'undefined') {
      formData.tax2 = formData.tax2.id;
    } else {
      delete formData.tax2;
    }

    return this.http.put<any>('/mpc_mobile_app_connector/v1/items/' + item_id, formData).pipe(
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

  delete(item_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/items/' + item_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('item deleted: ', res);
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
