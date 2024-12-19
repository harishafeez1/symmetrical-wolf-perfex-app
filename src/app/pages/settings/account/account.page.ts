import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { BASE_URL_KEY } from 'src/app/guards/base-url.guard';
import { AppSubscriptionService } from 'src/app/services/app-subscription.service';
import { AuthenticationService, AUTH_DATA } from 'src/app/services/authentication.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  accounts = [];
  isLoading = true;
  constructor(
    private router: Router,
    private storage: StorageService,
    private appSubscription: AppSubscriptionService,
    public authService: AuthenticationService
  ) { }

  getUserNameByIdentifier(identifier) {
    console.log(identifier);
    return false;
  }

  async ngOnInit() {
    this.accounts = await this.storage.getObject(BASE_URL_KEY);
    for(let account in this.accounts) {

      console.log(this.accounts[account]);
      this.appSubscription.validate(this.accounts[account].url).subscribe({
        next: (is_subscribed: any) => {
          if(is_subscribed) {
            this.accounts[account].is_subscription_active = true;
            
            if(this.appSubscription.is_trail_active) {
              this.accounts[account].subscription_expires_at = 'Free Trail Expires in: ' + this.appSubscription.trail_expires_at;
            } else if(this.appSubscription.is_sub_active) {
              this.accounts[account].subscription_expires_at = 'Subscription Expires in: ' + this.appSubscription.sub_expires_at;
            }
  
          } else {
            this.accounts[account].is_subscription_active = false;
            this.accounts[account].subscription_expires_at = this.appSubscription.sub_expires_at;
          }
          this.isLoading = false;
        }, error: () => {
          this.isLoading = false;
        }
      });

      const auth_data = await Preferences.get({ key: this.accounts[account].identifier + ' perfexcrm-auth-token' } );
      if (auth_data && auth_data.value != null && auth_data.value != '') {
        this.accounts[account].user = JSON.parse(auth_data.value)?.data;
      }
    }
  }

  async delete(index: any, account) {
    this.accounts.splice(index, 1); //remove from list
    if(account.active == true) {
      if(this.accounts.length > 0) {
        this.accounts[0].active  = true;
        this.authService.BASE_URL = this.accounts[0].url;
        this.authService.IDENTIFIER = this.accounts[0].identifier;
        await this.authService.loadAuthData();
      }
    }

    await this.storage.setObject(BASE_URL_KEY, this.accounts);
    window.dispatchEvent(new CustomEvent('admin:account_switched'));
  }

  async switchAccount(account) {
    for (let _account in this.accounts) {
      this.accounts[_account].active = false;
      if (this.accounts[_account].identifier == account.identifier) {
        this.accounts[_account].active = true;
      }
    }

    await this.storage.setObject(BASE_URL_KEY, this.accounts);

    this.authService.BASE_URL = account.url;
    this.authService.IDENTIFIER = account.identifier;

    await this.authService.loadAuthData();
    
    window.dispatchEvent(new CustomEvent('admin:account_switched'));
  }

  baseUrl() {
    this.storage.removeStorageData();
    this.router.navigate(['base-url']);
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
