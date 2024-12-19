import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { AuthenticationService } from './authentication.service';
import { InvoiceItem } from '../interfaces/invoice-item';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';

export var STORAGE_PROPOSAL_KEY = '-proposals';

@Injectable({
  providedIn: 'root'
})
export class ProposalApiService {
  sort: Sorting = {
    sort_by: 'proposal_id',
    order: 'desc'
  };

  sorts = [
    {
      key: 'proposal_id',
      name: 'proposal',
      default_order: 'desc'
    },
    {
      key: 'subject',
      name: 'proposal_subject'
    },
    {
      key: 'proposal_to',
      name: 'proposal_to'
    },
    {
      key: 'total',
      name: 'proposal_total'
    },
    {
      key: 'date',
      name: 'proposal_date'
    },
    {
      key: 'open_till',
      name: 'proposal_open_till'
    },
    {
      key: 'tags',
      name: 'tags'
    },
    {
      key: 'datecreated',
      name: 'proposal_date_created'
    },
    {
      key: 'status',
      name: 'proposal_status'
    }
  ];

  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
    public authService: AuthenticationService
  ) {
    STORAGE_PROPOSAL_KEY = this.authService.IDENTIFIER + STORAGE_PROPOSAL_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/proposals/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/proposals/${id}`;
    }

    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_PROPOSAL_KEY, res);
        }

        console.log('loaded api proposal: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getPDF(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/proposals/pdf/' + id + '?output_type=S').pipe(
      tap(res => {
        console.log('loaded api invoice pdf: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  convertToEstimate(id, formData: any, Items: any) {
    var form_data = new FormData();

    formData.clientid = formData.clientid.userid;

    if (formData.project_id && formData.project_id !== null && formData.project_id != '') {
      formData.project_id = formData.project_id.id;
    } else {
      delete formData.project_id;
    }

    delete formData.select_item;
    delete formData.removed_items;

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    for (var key in Items) {
      if (Items[key].taxrate != null) {
        Items[key].taxname = [];
        for (const tax of Items[key].taxrate) {
          form_data.append(`newitems[${key}][taxname][]`, `${tax.name}|${tax.taxrate}`);
        }
      }

      delete Items[key].taxrate;

      form_data.append(`newitems[${key}][order]`, key);
      form_data.append(`newitems[${key}][description]`, Items[key].description);
      form_data.append(`newitems[${key}][long_description]`, Items[key].long_description);
      form_data.append(`newitems[${key}][qty]`, Items[key].qty);
      form_data.append(`newitems[${key}][rate]`, Items[key].rate);
      form_data.append(`newitems[${key}][unit]`, '');
    }

    return this.http.post('/mpc_mobile_app_connector/v1/proposals/convert_to_estimate/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal converted into estimate: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  
  convertToInvoice(id, formData: any, Items: InvoiceItem[]) {
    var form_data = new FormData();

    delete formData.select_item;

    formData.clientid = formData.clientid.userid;

    if (formData.project_id !== null) {
      formData.project_id = formData.project_id.id;
    }

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    for (var key in Items) {
      if (Items[key].taxrate != null) {
        Items[key].taxname = [];
        for (const tax of Items[key].taxrate) {
          form_data.append(`newitems[${key}][taxname][]`, `${tax.name}|${tax.taxrate}`);
        }
      }

      delete Items[key].taxrate;

      form_data.append(`newitems[${key}][order]`, key);
      form_data.append(`newitems[${key}][description]`, Items[key].description);
      form_data.append(`newitems[${key}][long_description]`, Items[key].long_description);
      form_data.append(`newitems[${key}][qty]`, Items[key].qty);
      form_data.append(`newitems[${key}][rate]`, Items[key].rate);
      form_data.append(`newitems[${key}][unit]`, '');
    }

    return this.http.post('/mpc_mobile_app_connector/v1/proposals/convert_to_invoice/' + id , form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal converted into invoice: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getComments(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/proposals/comment/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api proposal comments: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any, proposalItems: any) {
    var form_data = new FormData();

    delete formData.select_item;
    delete formData.removed_items;

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.proposal) {
        if(typeof formData.custom_fields.proposal[custom_field] == 'object') {
          for (let _index in formData.custom_fields.proposal[custom_field]) {
            form_data.append('custom_fields[proposal][' + custom_field + '][' + _index + ']', formData.custom_fields.proposal[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[proposal][' + custom_field + ']', formData.custom_fields.proposal[custom_field]);
        }
      }
    }
    delete formData.custom_fields;

    for (var key in formData) {
      if(key == 'project_id' && formData.project_id != null && formData.project_id != '') {
        form_data.append('project_id', formData.project_id.id);
      }else{
        form_data.append(key, formData[key]);
      }
    }

    for (var key in proposalItems) {
      if (proposalItems[key].taxrate != null) {
        proposalItems[key].taxname = [];
        for (const tax of proposalItems[key].taxrate) {
          form_data.append(`newitems[${key}][taxname][]`, `${tax.name}|${tax.taxrate}`);
        }
      }

      delete proposalItems[key].taxrate;

      form_data.append(`newitems[${key}][order]`, key);
      form_data.append(`newitems[${key}][description]`, proposalItems[key].description);
      form_data.append(`newitems[${key}][long_description]`, proposalItems[key].long_description);
      form_data.append(`newitems[${key}][qty]`, proposalItems[key].qty);
      form_data.append(`newitems[${key}][rate]`, proposalItems[key].rate);
      form_data.append(`newitems[${key}][unit]`, '');
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/proposals', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(proposal_id: any, formData: any, proposalItems: any) {
    delete formData.select_item;

    if(formData.project_id !== null) {
      formData.project_id = formData.project_id.id;
    }

    for (var key in proposalItems) {
      if (proposalItems[key].taxrate != null) {
        proposalItems[key].taxname = [];
        for (const tax of proposalItems[key].taxrate) {
          proposalItems[key].taxname.push(`${tax.name}|${tax.taxrate}`);
        }
      }

      delete proposalItems[key].taxrate;
      proposalItems[key].order = key;
    }

    formData.newitems = proposalItems;
    formData.items = [];
    return this.http.put<any>('/mpc_mobile_app_connector/v1/proposals/' + proposal_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal updated: ', res);
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

    return this.http.post<any>('/mpc_mobile_app_connector/v1/proposals/comment', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal comment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  updateComment(comment_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/proposals/comment/' + comment_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteComment(comment_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/proposals/comment/' + comment_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('proposal comment deleted: ', res);
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

  delete(proposal_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/proposals/' + proposal_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('proposal deleted: ', res);
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
    return this.http.get<any>('/mpc_mobile_app_connector/v1/proposals/copy/' + id).pipe(
      tap(res => {
        console.log('loaded api proposal copy: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  markAs(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/proposals/mark_action_status/' + status + '/' + id).pipe(
      tap(res => {
        console.log('loaded api invoice mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  addAttachment(id, file: any) {
    var form_data = new FormData();
    form_data.append('file', file);

    return this.http.post<any>('/mpc_mobile_app_connector/v1/proposals/attachment/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal attachment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteAttachment(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/proposals/attachment/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal attachment deleted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  visibleToCustomerStatus(attachment_id: any, status: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/proposals/attachment/visible_to_customer/${attachment_id}/${status}`).pipe(
      map(res => res),
      tap(res => {
        console.log('attachment status update: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  sendExpirationReminder(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/proposals/send_expiry_reminder/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('proposal send_expiration_reminder: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  
}
