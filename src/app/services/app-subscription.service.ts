import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { formatDistanceToNow, intervalToDuration, parse, parseISO } from 'date-fns';
import format from 'date-fns/format';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AppSubscriptionService {
  is_sub_active = false;
  is_trail_active = false;
  trail_expires_at = '';
  sub_expires_at = '';
  constructor(private http: HttpClient, public authService: AuthenticationService) { }

  validate(website = this.authService.BASE_URL): Observable<any> {
    this.is_trail_active = false;
    this.is_sub_active = false;
    return this.http.get(`https://t29zrfey40.execute-api.us-east-1.amazonaws.com/subscriptions/validate/e89aa815-381b-452b-a351-75d56375730b?website=${website}`)
      .pipe(
        map((response: any) => {
          // console.log(response);
          if (response.status !== false) {
            for (const subscription of response.data) {
              const trail_end_time = parseISO(subscription.trial_end_date).getTime();
              if ((new Date()).getTime() < trail_end_time) {
                this.is_trail_active = true;
                this.trail_expires_at = this.checkExpiry(trail_end_time);
                return true;
              } else {
                const exipres_at = parseISO(subscription.end_date).getTime();
                if ((new Date()).getTime() < exipres_at) {
                  this.is_sub_active = true;
                  this.sub_expires_at = this.checkExpiry(exipres_at);
                  return true;
                }

                this.sub_expires_at = 'Subscription Expired';
              }
            }
          } else {
            this.sub_expires_at = 'Subscription Not Active';
          }
          return false;
        }));
  }

  checkExpiry(end_date: any) {
    var countDownDate = new Date(end_date).getTime();
    var now = new Date().getTime();

    var distance = countDownDate - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    let trailDistanceToNow = days + "d " + hours + "h " + minutes + "m ";
    // let trailDistanceToNow = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

    if (distance < 0) {
      return "Subscription Expired";
    }

    return trailDistanceToNow;
  }
}
