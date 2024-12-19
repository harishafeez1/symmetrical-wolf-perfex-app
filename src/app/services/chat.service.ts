import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MpcToastService } from './mpc-toast.service';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // baseURL = 'https://e9051001-1731-4d09-bcc1-56ce922e8c52-00-1gzjz8x2v3q8v.sisko.replit.dev';
  baseURL = 'https://openai.myperfexcrm.com'; 
  // baseURL = 'https://openai.syndeopro.com'; 
  constructor(public http: HttpClient,
    private mpcToast: MpcToastService,) { }

  start() {
    return this.http.get<any>(`${this.baseURL}/start`).pipe(
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
  chat(threadId: string, msg: string, user_data: any, siteURL: string, secretKey: string, apiUrl: string){
    
    const data = {
      thread_id: threadId,
      message: msg,
      userData: {
        name: user_data.data.firstname,
        site_url: siteURL,
        api_url: apiUrl,
        token: user_data.token,
        key: user_data.key,
        secret_key: secretKey
      }
    }
    return this.http.post<any>(`${this.baseURL}/chat`, data).pipe(
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
