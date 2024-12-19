import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { BASE_URL_KEY } from '../guards/base-url.guard';
import { StorageService } from './storage.service';
import { Device } from '@capacitor/device';
import { MpcToastService } from './mpc-toast.service';

export var AUTH_DATA = 'perfexcrm-auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  auth: any;
  BASE_URL: any;
  IDENTIFIER: any;
  constructor(private http: HttpClient, private storage: StorageService,
    private mpcToast: MpcToastService
  ) {
    this.loadAuthData();
  }

  async loadAuthData() {
    const CRM_CONNECTIONS = await this.storage.getObject(BASE_URL_KEY);
    if (CRM_CONNECTIONS != null) {
      for (let connection of CRM_CONNECTIONS) {
        if (connection.active == true) {
          this.BASE_URL = connection.url;
          this.IDENTIFIER = connection.identifier;
          AUTH_DATA = connection.identifier + ' perfexcrm-auth-token';
        }
      }
    }

    const auth = await Preferences.get({ key: AUTH_DATA });
    if (this.BASE_URL && auth && auth.value != null && auth.value != '') {
      this.auth = JSON.parse(auth.value);

      this.getUserDataByStaffid(this.auth?.data?.staffid).subscribe({
        next: (user: any) => {
          if (user.status !== false) {
            this.auth.data = user;
            this.isAuthenticated.next(true);
          } else {
            Preferences.remove({ key: AUTH_DATA });
            this.isAuthenticated.next(false);
          }
        }, error: (err: any) => {
          console.log('err staff =>', err);
          this.mpcToast.show(err, 'danger');
          this.isAuthenticated.next(true);
          }
      });
    } else {
      this.isAuthenticated.next(false);
    }
  }

  login(formData: FormData): Observable<any> {
    return this.http.post(`/mpc_mobile_app_connector/v1/login/auth`, formData).pipe(
      map((data: any) => data),
      switchMap(data => {
        this.auth = data.result;
        return from(Preferences.set({ key: AUTH_DATA, value: JSON.stringify(this.auth) }));
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })
    );
  }

  forgotPassword(formData: FormData): Observable<any> {
    return this.http.post(`/mpc_mobile_app_connector/v1/login/forgot_password`, formData).pipe(
      map((data: any) => data)
    );
  }

  getUserDataByStaffid(staff_id) {
    return this.http.get(`/mpc_mobile_app_connector/v2/staffs/` + staff_id).pipe(
      map((data: any) => data)
    );
  }

  hasPermission(feature: any, capability: any) {
    const current_user = this.auth.data;
    if (current_user.admin == 1) {
      return true;
    }

    if (current_user?.permissions?.length != 0) {
      for (const permission of current_user?.permissions) {
        if (permission?.feature == feature && capability.includes(permission?.capability)) {
          return true;
        }
      }
    }

    return false;
  }

  showMenuItem(feature: any) {
    const current_user = this.auth.data;
    if (current_user.admin == 1) {
      return true;
    }

    if (current_user?.menu_items?.[feature]) {
      return true;
    }

    return false;
  }

  logout() {
    const staff_id = this.auth?.data?.staffid;
    return from(Device.getId()).pipe(switchMap((device) => {
      console.log(device);
      return this.http.get(`/mpc_mobile_app_connector/v1/login/logout/${staff_id}/${device?.identifier}`).pipe(
        map((data: any) => data),
        switchMap(data => {
          this.storage.removeStorageData();
          return from(Preferences.remove({ key: AUTH_DATA }));
        }),
        tap(_ => {
          this.isAuthenticated.next(false);
        })
      );
    }));
  }

  getAccessTokenUsingRefreshToken(): Observable<string> {
    return from(Preferences.get({ key: AUTH_DATA })).pipe(
      switchMap(refreshToken => {
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken.value}`
          })
        };
        return this.http.post<any>(`${this.BASE_URL}/staff/token/refresh`, {}, httpOptions);
      }),
      map(response => response.access_token),
      tap(accessToken => Preferences.set({ key: AUTH_DATA, value: accessToken }))
    );
  }
}
