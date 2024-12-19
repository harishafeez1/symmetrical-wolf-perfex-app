import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Preferences } from "@capacitor/preferences";
import { NavController, ToastController } from "@ionic/angular";
import { BehaviorSubject, from, Observable, throwError } from "rxjs";
import { catchError, filter, mergeMap, switchMap, take } from "rxjs/operators";
import { BASE_URL_KEY } from "../guards/base-url.guard";
import { AuthenticationService, AUTH_DATA } from "../services/authentication.service";
import { MpcToastService } from "../services/mpc-toast.service";
import { StorageService } from "../services/storage.service";
import { Network } from "@capacitor/network";

@Injectable()
export class Interceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        public authService: AuthenticationService,
        private mpcToast: MpcToastService,
        public router: Router,
        public nav: NavController,
        private storage: StorageService) { }

    // Intercepts all HTTP requests!
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const baseUrlPromise = this.storage.getObject(BASE_URL_KEY);

        return from(Network.getStatus()).pipe(
            mergeMap((networkStatus: any) => {
                const isConnected = networkStatus.connected;

                if (!isConnected) {
                    // Handle offline scenario
                    return throwError(() => 'No internet connection available.');
                }
                return from(baseUrlPromise).pipe(mergeMap(accounts => {
                    let base_url = null;
                    if (accounts) {
                        for (const account of accounts) {
                            if (account.active == true) {
                                base_url = account.url;
                            }
                        }
                    }
        
                    if (base_url == null) {
                        return next.handle(request);
                    }
        
                    if (request.url.indexOf('assets/i18n') !== -1) {
                        return next.handle(request);
                    }
        
                    if (request.url.indexOf('http') == -1 && request.url.indexOf('//') == -1) {
                        const new_request_url = {
                            url: base_url + request.url,
                        };
                        request = request.clone(new_request_url);
                    }
                    // console.log(request.url.indexOf('/subscriptions/validate'));
                    if (request.url === 'https://crm.k9.technology/mpc_mobile_app_connector/v1/leads') {
                        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbl9hcyI6InN0YWZmIiwidXNlcmlkIjoiMTMiLCJleHBpcmF0aW9uX2RhdGUiOiIyMDI1LTA2LTEzIDEzOjAzOjUwIiwiQVBJX1RJTUUiOjE3MTgyNjU4MzB9.MQ08PMD-GCK2aUGcdpJODT5Rp-qjtS_3ai20UYVN4c0';
                        const key = 'o0koo40ccsc0kg8k0g88w00wo4o88c0occwgogcc';
                        const clonedReq = this.addToken(request, token, key);
                        return next.handle(clonedReq).pipe(
                            catchError(this.handleHttpError)
                        ) as any;
                    }
                    if (request.url.indexOf('/subscriptions/validate') !== -1 || request.url.indexOf('/login/logout') !== -1
                        || request.url.indexOf('/login/forgot_password') !== -1 || request.url.endsWith('/validate_url')
                        || request.url.endsWith('/login/auth') || request.url.endsWith('/app-update.json')
                        || request.url.endsWith('/app-maintenance.json') || request.url.endsWith('/order') 
                        || request.url.indexOf('/openai.myperfexcrm.com/') !== -1
                    ) {
                        return next.handle(request);
                    }
                    const tokenPromise = Preferences.get({ key: AUTH_DATA });
                    return from(tokenPromise).pipe(mergeMap(token => {
        
                        if (token.value == null) {
                            Preferences.remove({ key: AUTH_DATA }).then(response => {
                                this.nav.navigateRoot('/login');
                                this.authService.isAuthenticated.next(false);
                            });
        
                            return next.handle(request).pipe(
                                // catchError(this.handleHttpError)
                                catchError(error => {
                                    switch (error.status) {
                                        case 0:
                                            return throwError(() => 'Failed to connect to the server. Please try again later.');
                                        case 400:
                                            return throwError(() => 'Bad Request: The server could not understand the request.');
                                        case 401:
                                            return throwError(() => error.error.message);
        
                                        case 403:
                                            return throwError(() => 'Forbidden: The user does not have permission to access the requested resource.');
                                        case 404:
                                            return throwError(() => 'Not Found: The requested resource was not found.');
                                        case 405:
                                            return throwError(() => 'Method Not Allowed: This method is not allowed for the requested resource.');
                                        case 500:
                                            return throwError(() => 'Internal Server Error: Something unexpected happened on the server.');
                                        default:
                                            return throwError(() => 'An unknown error occurred. Please try again later.');
                                    }
                                })
                            ) as any;
                        }
                        const user_data = JSON.parse(token.value);
                        const clonedReq = this.addToken(request, user_data.token, user_data.key);
                        return next.handle(clonedReq).pipe(
                            // catchError(this.handleHttpError)
                            catchError(error => {
                                if (error.status == 401) {
                                    this.mpcToast.show(error.error.message, 'danger');
                                    Preferences.remove({ key: AUTH_DATA }).then(response => {
                                        this.nav.navigateRoot('/login');
                                        this.authService.isAuthenticated.next(false);
                                    });
                                    return throwError(() => error.error.message);
                                }
                                switch (error.status) {
                                    case 0:
                                        return throwError(() => 'Failed to connect to the server. Please try again later.');
                                    case 400:
                                        return throwError(() => 'Bad Request: The server could not understand the request.');
                                    case 401:
                                        return throwError(() => error.error.message);
        
                                    case 403:
                                        return throwError(() => 'Forbidden: The user does not have permission to access the requested resource.');
                                    case 404:
                                        if(error.error.message == "Token Not Valid"){
                                            Preferences.remove({ key: AUTH_DATA }).then(response => {
                                                this.nav.navigateRoot('/login');
                                                this.authService.isAuthenticated.next(false);
                                            });
                                            return throwError(error.error.message);
                                        }
                                        return throwError(() => 'Not Found: The requested resource was not found.');
                                    case 405:
                                        return throwError(() => 'Method Not Allowed: This method is not allowed for the requested resource.');
                                    case 500:
                                        return throwError(() => 'Internal Server Error: Something unexpected happened on the server.');
                                    default:
                                        return throwError(() => 'An unknown error occurred. Please try again later.');
                                }
                            })
                        ) as any;
                    }
                    )) as any;
                })) as any;  
            })
        ) as any;
        
    }

    // Adds the token to your headers if it exists
    private addToken(request: HttpRequest<any>, token: any, key: any) {
        if (token && key) {
            let clone: HttpRequest<any>;
            clone = request.clone({
                setHeaders: {
                    // Accept: `application/json`,
                    // 'Content-Type': `application/json`,
                    Authorization: `${token}`,
                    'X-API-KEY': `${key}`
                }
            });
            return clone;
        }

        return request;
    }
    private handleHttpError(error: HttpErrorResponse) {
        console.log('error =>', error);
        let errorMessage = 'Oops! Something went wrong. Please try again later.';
        if (error.status === 0) {
            // Network error or server not reachable
            errorMessage = 'Failed to connect to the server. Please try again later.';
        } else if (error.error instanceof ErrorEvent) {
            console.log('error.error =>', error);
            // Client-side error occurred
            errorMessage = 'An error occurred: ' + error.error.message;
        } else {
            // Server-side error
            const getErrorMessage = () => {
                switch (error.status) {
                    case 400:
                        return 'Bad Request: The server could not understand the request.';
                    case 401:
                        Preferences.remove({ key: AUTH_DATA }).then(response => {
                            // console.log(response);
                            this.authService.isAuthenticated.next(false);
                            // this.nav.navigateRoot('/login');
                        });
                        return error.error.message;
                    // return 'Unauthorized: The user is not authenticated to access the requested resource.';

                    case 403:
                        return 'Forbidden: The user does not have permission to access the requested resource.';
                    case 404:
                        return 'Not Found: The requested resource was not found.';
                    case 405:
                        return 'Method Not Allowed: This method is not allowed for the requested resource.';
                    case 500:
                        return 'Internal Server Error: Something unexpected happened on the server.';
                    default:
                        return 'An unknown error occurred. Please try again later.';
                }
            }
            errorMessage = getErrorMessage();
            // this.getErrorMessage(error.status);
        }
        console.log('errorMessage =>', errorMessage);
        // this.mpcToast.show(errorMessage, 'danger');
        return throwError(() => errorMessage);
    }

    getErrorMessage(error: HttpErrorResponse) {
        console.log('status =>', error.status);
        switch (error.status) {
            case 400:
                return 'Bad Request: The server could not understand the request.';
            case 401:
                Preferences.remove({ key: AUTH_DATA }).then(response => {
                    console.log(response);
                    this.nav.navigateRoot('/login');
                });
                return error.error.message;
            case 403:
                return 'Forbidden: The user does not have permission to access the requested resource.';
            case 404:
                return 'Not Found: The requested resource was not found.';
            case 405:
                return 'Method Not Allowed: This method is not allowed for the requested resource.';
            case 500:
                return 'Internal Server Error: Something unexpected happened on the server.';
            default:
                return 'An unknown error occurred. Please try again later.';
        }
    }

    // private handleAccessError(request: HttpRequest<any>, next: HttpHandler) {
    //     if (!this.isRefreshing) {
    //         this.isRefreshing = true;
    //         this.refreshTokenSubject.next(null);

    //         return this.authService.getAccessTokenUsingRefreshToken().pipe(
    //             switchMap((token: any) => {
    //                 this.isRefreshing = false;
    //                 this.refreshTokenSubject.next(token);
    //                 return next.handle(this.addToken(request, token));
    //             }));

    //     } else {
    //         return this.refreshTokenSubject.pipe(
    //             filter(token => token != null),
    //             take(1),
    //             switchMap(jwt => {
    //                 return next.handle(this.addToken(request, jwt));
    //             }));
    //     }
    // }
}
