import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
import { StorageService } from './storage.service';
export var STORAGE_PROJECT_KEY = '-projects';

@Injectable({
  providedIn: 'root'
})
export class ProjectApiService {
  sort: Sorting = {
    sort_by: 'deadline',
    order: 'asc'
  };

  sorts = [
    {
      key: 'id',
      name: 'id'
    },
    {
      key: 'name',
      name: 'project_name',
    },
    {
      key: 'company',
      name: 'project_customer'
    },
    {
      key: 'tags',
      name: 'tags'
    },
    {
      key: 'start_date',
      name: 'project_start_date'
    },
    {
      key: 'deadline',
      name: 'project_deadline',
      default_order: 'asc'
    },
    {
      key: 'members',
      name: 'project_members'
    },
    {
      key: 'status',
      name: 'project_status'
    }
  ];

  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
  ) {
    STORAGE_PROJECT_KEY = this.authService.IDENTIFIER + STORAGE_PROJECT_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/projects/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/projects/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        console.log('loaded api project: ', res);
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_PROJECT_KEY, res);
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getDiscussions(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/projects/discussions?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/projects/discussions/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api project discussions: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getFiles(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/projects/files/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api project files: ', res);
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

    return this.http.post<any>('/mpc_mobile_app_connector/v1/projects/files/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('project file uploaded: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteDiscussion(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/projects/discussions/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('project discussion deleted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteFile(id) {
    return this.http.delete<any>('/mpc_mobile_app_connector/v1/projects/files/' + id).pipe(
      map(res => res),
      tap(res => {
        console.log('project attachment deleted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getChartData(id: any, type = 'this_week') {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/projects/get_chart_data/${id}/${type}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api project chart data: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getActivity(id: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/projects/activity/${id}`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api project activity: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any, Items: any = []) {
    var form_data = new FormData();

    for (var setting in formData.settings) {
      if (formData.settings[setting] !== false) {
        if (typeof formData.settings[setting] == 'object') {
          for (let _index in formData.settings[setting]) {
            form_data.append('settings[' + setting + '][]', formData.settings[setting][_index]);
          }
        } else {
          form_data.append('settings[' + setting + ']', formData.settings[setting]);
        }
      }
    }

    if (formData.project_members) {
      for (var project_member of formData.project_members) {
        form_data.append('project_members[]', project_member);
      }
    }

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.projects) {
        if (typeof formData.custom_fields.projects[custom_field] == 'object') {
          for (let _index in formData.custom_fields.projects[custom_field]) {
            form_data.append('custom_fields[projects][' + custom_field + '][' + _index + ']', formData.custom_fields.projects[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[projects][' + custom_field + ']', formData.custom_fields.projects[custom_field]);
        }
      }
    }

    for (var key in formData) {
      if (['settings', 'custom_fields', 'project_members'].includes(key)) {
        continue;
      }

      form_data.append(key, formData[key]);
    }
    for (var key in Items) {
      form_data.append(`items[${key}]`, Items[key].id);
      form_data.append(`items_assignee[${key}]`, Items[key].assign);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/projects', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('project inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  convertToEstimate(id: any, formData: any) {
    var form_data = new FormData();

    for (var setting in formData.settings) {
      if (formData.settings[setting] !== false) {
        if (typeof formData.settings[setting] == 'object') {
          for (let _index in formData.settings[setting]) {
            form_data.append('settings[' + setting + '][]', formData.settings[setting][_index]);
          }
        } else {
          form_data.append('settings[' + setting + ']', formData.settings[setting]);
        }
      }
    }

    if (formData.project_members) {
      for (var project_member of formData.project_members) {
        form_data.append('project_members[]', project_member);
      }
    }

    if (formData.custom_fields && formData.custom_fields !== null) {
      for (let custom_field in formData.custom_fields.projects) {
        if (typeof formData.custom_fields.projects[custom_field] == 'object') {
          for (let _index in formData.custom_fields.projects[custom_field]) {
            form_data.append('custom_fields[projects][' + custom_field + '][' + _index + ']', formData.custom_fields.projects[custom_field][_index]);
          }
        } else {
          form_data.append('custom_fields[projects][' + custom_field + ']', formData.custom_fields.projects[custom_field]);
        }
      }
    }

    for (var key in formData) {
      if (['settings', 'custom_fields', 'project_members'].includes(key)) {
        continue;
      }

      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/projects/convert_to_estimate/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('project inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  copy(id: any, formData: any) {
    var form_data = new FormData();
    if(!formData.tasks){
      delete formData.tasks;
      delete formData.tasks_include_checklist_items;
      delete formData.task_include_assignees;
      delete formData.task_include_followers;
    }
    if(!formData.tasks_include_checklist_items){
      delete formData.tasks_include_checklist_items;
    }
    if(!formData.task_include_assignees){
      delete formData.task_include_assignees;
    }
    if(!formData.task_include_followers){
      delete formData.task_include_followers;
    }
    if(!formData.milestones){
      delete formData.milestones;
    }
    if(!formData.members){
      delete formData.members;
    }

    for (let key in formData) {
      if(formData[key] || key === 'deadline'){
        form_data.append(key, (formData[key] === true) ? 'on' :  formData[key]);
      }
    }
    return this.http.post<any>('/mpc_mobile_app_connector/v1/projects/copy/' + id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('project copy: ', res);
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

  storeDiscussion(formData: any) {
    var form_data = new FormData();

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/projects/discussions', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('project inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  addProjectMember(project_id, data: any) {
    var form_data = new FormData();

    for (var key in data) {
      form_data.append('project_members[]', data[key]);
    }
    return this.http.post('/mpc_mobile_app_connector/v1/projects/add_member/' + project_id, form_data).pipe(map(res => res),
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

  update(customer_id: any, formData: any) {
    for (var setting in formData.settings) {
      if (formData.settings[setting] === false || formData.settings[setting] === 0) {
        delete formData.settings[setting];
      }
    }

    return this.http.put<any>('/mpc_mobile_app_connector/v1/projects/' + customer_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('project inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  updateDiscussion(discussion_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/projects/discussions/' + discussion_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('discussion updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(userid) {
    return this.http.delete('/mpc_mobile_app_connector/v1/projects/' + userid).pipe(map(res => res),
      tap((res: any) => {
        console.log('project deleted: ', res);
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

  markAs(status, id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/projects/mark_action_status/' + status + '/' + id).pipe(
      tap(res => {
        console.log('loaded api project mark as: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  deleteProject(id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/projects/' + id).pipe(map(res => res),
      tap((res: any) => {
        console.log('project deleted: ', res);
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

  saveNotes(project_id: any, formData: any) {
    var form_data = new FormData();

    for (var index in formData) {
      form_data.append(index, formData[index]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/projects/save_note/' + project_id, form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('project notes save: ', res);
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
  visibleToCustomerStatus(activity_id: any, status: any) {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/projects/change_activity_visibility/${activity_id}/${status}`).pipe(
      map(res => res),
      tap(res => {
        console.log('activity status update: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

}
