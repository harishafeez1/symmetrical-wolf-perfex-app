import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
import { StorageService } from './storage.service';
export var STORAGE_TASK_KEY = '-tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  sort: Sorting = {
    sort_by: 'duedate',
    order: 'desc'
  };

  sorts = [
    {
      key: 'id',
      name: 'id'
    },
    {
      key: 'name',
      name: 'name'
    },
    {
      key: 'status',
      name: 'task_status'
    },
    {
      key: 'startdate',
      name: 'task_single_start_date'
    },
    {
      key: 'duedate',
      name: 'task_single_due_date',
      default_order: 'desc'
    },
    {
      key: 'assignees',
      name: 'task_assigned'
    },
    {
      key: 'tags',
      name: 'tags'
    },
    {
      key: 'priority',
      name: 'task_single_priority'
    }
  ];

  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
  ) {
    STORAGE_TASK_KEY = this.authService.IDENTIFIER + STORAGE_TASK_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/tasks/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/tasks/${id}`;
    }
    return this.http.get(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        console.log('loaded api task: ', res);
        if (id == '' && search == '' && offset == 0 && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_TASK_KEY, res);
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();

    if(formData.checklist_items){
      for(let value of formData.checklist_items) {
        form_data.append(`checklist_items[]`, `${value}`);
      }
    }
    if(formData.assignees){
      for(let value of formData.assignees) {
        form_data.append(`assignees[]`, `${value}`);
      }
    }
    if(formData.followers){
      for(let value of formData.followers) {
        form_data.append(`followers[]`, `${value}`);
      }
    }


    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.tasks) {
        if(typeof formData.custom_fields.tasks[custom_field] == 'object') {
          for (let _index in formData.custom_fields.tasks[custom_field]) {
            form_data.append('custom_fields[tasks][' + custom_field + '][' + _index + ']', formData.custom_fields.tasks[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[tasks][' + custom_field + ']', formData.custom_fields.tasks[custom_field]);
        }
      }
    }
    if(!formData.billable){
      delete formData.billable;
    }
    if(!formData.is_public){
      delete formData.is_public;
    }
    if(!formData.visible_to_client){
      delete formData.visible_to_client;
    }
    delete formData.custom_fields;
    delete formData.checklist_items;
    delete formData.assignees;
    delete formData.followers;

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post('/mpc_mobile_app_connector/v1/tasks', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('task inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(customer_id: any, formData: any) {
    if(!formData.billable){
      delete formData.billable;
    }
    if(!formData.is_public){
      delete formData.is_public;
    }
    if(!formData.visible_to_client){
      delete formData.visible_to_client;
    }
    delete formData.checklist_items;
    delete formData.assignees;
    delete formData.followers;
    return this.http.put('/mpc_mobile_app_connector/v1/tasks/' + customer_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('task updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store_time(formData: any) {
    var form_data = new FormData();

    if(typeof formData.timesheet_task_id == 'object') {
      formData.timesheet_task_id = formData.timesheet_task_id.id;
    }

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/tasks/timesheet', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('task time inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update_time(timer_id: any, formData: any) {
    
    if(typeof formData.timesheet_task_id == 'object') {
      formData.timesheet_task_id = formData.timesheet_task_id.id;
    }

    return this.http.put<any>('/mpc_mobile_app_connector/v1/tasks/timesheet/' + timer_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('task time updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteTimeSheet(timer_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/tasks/timesheet/' + timer_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('task timesheet deleted: ', res);
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

  delete(task_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/tasks/' + task_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('task deleted: ', res);
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

  addAssignee(data: any) {
    var form_data = new FormData();

    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return this.http.post('/mpc_mobile_app_connector/v1/tasks/assignees', form_data).pipe(map(res => res),
      tap((res: any) => {
        console.log('task assignee added: ', res);
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

  addFollower(data: any) {
    var form_data = new FormData();

    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return this.http.post('/mpc_mobile_app_connector/v1/tasks/followers',  form_data).pipe(map(res => res),
      tap((res: any) => {
        console.log('task follower added: ', res);
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

  assignChecklist(data:any){
    var form_data = new FormData();

    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return this.http.post('/mpc_mobile_app_connector/v1/tasks/save_checklist_assigned_staff',  form_data).pipe(map(res => res),
      tap((res: any) => {
        console.log('task assign checklist added: ', res);
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
  addChecklistItemTemplate(data: any) {
    var form_data = new FormData();

    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return this.http.post('/mpc_mobile_app_connector/v1/tasks/checklist_item_template',  form_data).pipe(map(res => res),
      tap((res: any) => {
        console.log('task checklist template added: ', res);
        // if (res.status) {
        //   this.mpcToast.show(res.message);
        // } else {
        //   this.mpcToast.show(res.message, 'danger');
        // }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  getChecklistItemTemplate() {
    return this.http.get('/mpc_mobile_app_connector/v1/tasks/checklist_item_template').pipe(map(res => res),
      tap((res: any) => {
        console.log('loaded checklist template: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  addChecklist(data: any) {
    var form_data = new FormData();

    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return this.http.post('/mpc_mobile_app_connector/v1/tasks/checklist',  form_data).pipe(map(res => res),
      tap((res: any) => {
        console.log('task checklist added: ', res);
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

  updateChecklist(data: any) {
    return this.http.put('/mpc_mobile_app_connector/v1/tasks/checklist',  data).pipe(map(res => res),
      tap((res: any) => {
        console.log('task checklist updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  updateItemCheckbox(item_id: Number, action: Number) {
    return this.http.get('/mpc_mobile_app_connector/v1/tasks/checkbox_action/' + item_id + '/' + action).pipe(map(res => res),
      tap((res: any) => {
        console.log('task checklist updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteAssignee(assignee_id: any, task_id: any) {
    return this.http.delete('/mpc_mobile_app_connector/v1/tasks/assignees/' + assignee_id + '/' + task_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('task assignee deleted: ', res);
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

  deleteFollower(follower_id: any, task_id: any) {
    return this.http.delete('/mpc_mobile_app_connector/v1/tasks/followers/' + follower_id + '/' + task_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('task follower deleted: ', res);
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

  deleteChecklist(checklist_id: any, task_id: any) {
    return this.http.delete('/mpc_mobile_app_connector/v1/tasks/checklist/' + checklist_id + '/' + task_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('task checklist deleted: ', res);
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

  getComments(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/tasks/comment/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api task comments: ', res);
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
    
    return this.http.post<any>('/mpc_mobile_app_connector/v1/tasks/comment', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('task comment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  updateComment(comment_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/tasks/comment/' + comment_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('task updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteComment(comment_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/tasks/comment/' + comment_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('task comment deleted: ', res);
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
  markAsStatus(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/tasks/mark_action_status/' + status + '/' + id).pipe(
      tap(res => {
        console.log('loaded api task mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  markAsPriority(priority, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/tasks/mark_action_priority/' + priority + '/' + id).pipe(
      tap(res => {
        console.log('loaded api task mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  duplicatedTask(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }
    console.log('form_data =>', form_data);
    return this.http.post('/mpc_mobile_app_connector/v1/tasks/copy', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('task duplicated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  timerTask(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }
    return this.http.post('/mpc_mobile_app_connector/v1/tasks/timer_tracking?single_task=true', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('timer task: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  getFiles(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/tasks/files/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api task files: ', res);
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
    
    return this.http.post<any>('/mpc_mobile_app_connector/v1/tasks/files/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('task file uploaded: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  deleteFile(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/tasks/files/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('task attachment deleted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
}
