import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-app-subscription',
  templateUrl: './app-subscription.page.html',
  styleUrls: ['./app-subscription.page.scss'],
})
export class AppSubscriptionPage implements OnInit {

  constructor() { }

  subscribeNow() {
    Browser.open({url: 'https://myperfexcrm.com/product/perfex-crm-mobile-application/'});
  }

  ngOnInit() {
  }
}
