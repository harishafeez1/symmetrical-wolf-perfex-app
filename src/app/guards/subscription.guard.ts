import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AppSubscriptionService } from '../services/app-subscription.service';
import { StorageService } from '../services/storage.service';
import { SubscriptionApiService } from '../services/subscription-api.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard  {
  constructor(
    private router: Router,
    private appSubscription: AppSubscriptionService,
    private storage: StorageService
  ) {
    
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.appSubscription.validate().pipe(
      filter(val => val !== null), // Filter out initial Behaviour subject value
      take(1), // Otherwise the Observable doesn't complete!
      map(is_subscribed => {
        if (is_subscribed) {
          return true;
        } else {
          this.router.navigateByUrl('/app-subscription');
          return false;
        }
      })
    ); 
  }
}
