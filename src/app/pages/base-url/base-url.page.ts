import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { BASE_URL_KEY } from 'src/app/guards/base-url.guard';
import { AppSubscriptionService } from 'src/app/services/app-subscription.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-base-url',
  templateUrl: './base-url.page.html',
  styleUrls: ['./base-url.page.scss'],
})
export class BaseUrlPage implements OnInit {

  credentials: FormGroup;
  perfex_accounts = [];
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private nav: NavController,
    private toast: ToastController,
    private http: HttpClient,
    private storage: StorageService,
    public authService: AuthenticationService,
    private appSubscription: AppSubscriptionService
  ) { }

  async ngOnInit() {
    this.credentials = this.fb.group({
      base_url: ['', [Validators.required]],
    });

    const _storage = await this.storage.getObject(BASE_URL_KEY);
    if (_storage !== null) {
      this.perfex_accounts = _storage;
      // console.log(this.perfex_accounts);
    }
  }

  async start(is_demo = false) {
    this.isLoading = true;
    /* if (this.credentials.value.base_url.substring(0, 8) != 'https://') {
      this.toastPresent('Base URL must be started with https://');
      this.isLoading = false;
      return;
    } */
   const url = this.normalizeUrl(this.credentials.value.base_url);

    for (const _account of this.perfex_accounts) {
      const accountUrl = this.normalizeUrl(_account.url);
      if (accountUrl == url) {
        this.toastPresent('You are already connected with ' + this.credentials.value.base_url);
        this.isLoading = false;
        return;
      }
    }

    this.http.get(this.credentials.value.base_url + '/mpc_mobile_app_connector/v1/validate_url').subscribe({
      next: async (response: any) => {
        if (response.status) {
          // this.appSubscription.validate(this.credentials.value.base_url).subscribe(async (__subscribed) => {
          //   if (__subscribed) {
              for (let __account in this.perfex_accounts) {
                this.perfex_accounts[__account].active = false;
              }
  
              this.perfex_accounts.push({
                url: this.credentials.value.base_url,
                color: response?.color,
                company_logo: response?.company_logo,
                company_logo_dark: response?.company_logo_dark,
                background: response?.background,
                domain: response?.domain,
                identifier: response?.identifier,
                active: true
              });
              await this.storage.setObject(BASE_URL_KEY, this.perfex_accounts);
              this.authService.BASE_URL = response.url;
              this.authService.IDENTIFIER = response.identifier;
              await this.authService.loadAuthData();
              
              const extras: NavigationExtras = {
                state: {
                  is_demo: is_demo
                }
              };
              this.nav.navigateRoot(['/login'], extras);
  
              window.dispatchEvent(new CustomEvent('admin:account_switched'));
          //   } else {
          //     this.nav.navigateRoot(['/app-subscription'])
          //   }
          // });
        } else {
          this.toastPresent('Base URL is not vaild');
          this.isLoading = false;
        }
      }, error: () => {
        this.isLoading = false;
        this.toastPresent('Something went wrong while connecting with Base URL');
      }
    });
  }
  normalizeUrl(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  get base_url() {
    return this.credentials.get('base_url');
  }

  exploreDemo() {
    this.isLoading = true;
    this.credentials.patchValue({
      base_url: 'https://sw-portal.com/portal'
    });
    this.start(false);
  }

  async toastPresent(message) {

    let toast = await this.toast.create({
      message,
      duration: 2000,
      color: 'danger'
    });

    toast.present();
  }
}
