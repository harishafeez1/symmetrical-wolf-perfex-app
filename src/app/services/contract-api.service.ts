import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';

export var STORAGE_CONTRACT_KEY = '-contracts';

@Injectable({
  providedIn: 'root'
})
export class ContractApiService {

  sort: Sorting = {
    sort_by: 'id',
    order: 'desc'
  };

  sorts = [
    {
      key: 'id',
      name: 'id',
      default_order: 'desc'
    },
    {
      key: 'subject',
      name: 'contract_subject'
    },
    {
      key: 'client',
      name: 'client_string'
    },
    {
      key: 'project_id',
      name: 'project'
    },
    {
      key: 'contract_value',
      name: 'contract_value'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService
  ) {
    STORAGE_CONTRACT_KEY = this.authService.IDENTIFIER + STORAGE_CONTRACT_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/contracts/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/contracts/${id}`;
    }

    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_CONTRACT_KEY, res);
        }

        console.log('loaded api contract: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();
    if(!formData.trash){
     delete formData.trash;
    }
    if(!formData.not_visible_to_client){
     delete formData.not_visible_to_client;
    }

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.contracts) {
        if(typeof formData.custom_fields.contracts[custom_field] == 'object') {
          for (let _index in formData.custom_fields.contracts[custom_field]) {
            form_data.append('custom_fields[contracts][' + custom_field + '][' + _index + ']', formData.custom_fields.contracts[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[contracts][' + custom_field + ']', formData.custom_fields.contracts[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }


    return this.http.post<any>('/mpc_mobile_app_connector/v1/contracts', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('contract inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(contract_id: any, formData: any) {
    
    return this.http.put<any>('/mpc_mobile_app_connector/v1/contracts/' + contract_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('contract updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(contract_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/contracts/' + contract_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('contract deleted: ', res);
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
  getPDF(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/contracts/pdf/' + id + '?output_type=S').pipe(
      tap(res => {
        console.log('loaded api  pdf: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  getComments(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/contracts/comment/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api contract comments: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  addComment(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/contracts/comment', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('contract comment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  updateComment(comment_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/contracts/comment/' + comment_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('contract updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteComment(comment_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/contracts/comment/' + comment_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('contract comment deleted: ', res);
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
  getTemplates(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/contracts/template/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api contract templates: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  addTemplate(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/contracts/template', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('contract template inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  updateTemplate(template_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/contracts/template/' + template_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('contract updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteTemplate(template_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/contracts/template/' + template_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('contract template deleted: ', res);
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

  copy(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/contracts/copy/' + id).pipe(
      tap(res => {
        console.log('loaded api contract copy: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  markAsSigned(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/contracts/mark_as_signed/' + id).pipe(
      tap(res => {
        console.log('loaded api contract mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  unMarkAsSigned(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/contracts/unmark_as_signed/' + id).pipe(
      tap(res => {
        console.log('loaded api contract mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  clearSignature(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/contracts/clear_signature/' + id).pipe(
      tap(res => {
        console.log('loaded api contract clear signature: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  getFiles(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/contracts/files/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api contract files: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  uploadFile(id, file: any) {
    var form_data = new FormData();
    form_data.append('file', file);
    
    return this.http.post<any>('/mpc_mobile_app_connector/v1/contracts/files/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('contract file uploaded: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteFile(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/contracts/files/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('contract attachment deleted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getContractTypes() {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/contracts/contract_type`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api contract types: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
