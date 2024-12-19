import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NotificationApiService, STORAGE_NOTIFICATION_KEY } from 'src/app/services/notification-api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  account_switched: EventListener;

  notifications = [];
  isLoading = false;
  isSyncing = false;
  offset = 0;
  limit = 15;

  infiniteScroll = true;

  constructor(
    private notificationApi: NotificationApiService,
    private router: Router,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private storage: StorageService
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.notifications = [];
    const customer_storage_data = await this.storage.getObject(STORAGE_NOTIFICATION_KEY);
    if (customer_storage_data == null) {
      this.getNotifications(true);
    } else {
      this.notifications = customer_storage_data;
      this.isSyncing = true;
      this.getNotifications(true, false, false);
    }
  }

  notificationName(notification) {
    //link
    if (notification.from_fullname == '') {
      if (notification.description == 'not_customer_viewed_invoice') {
        return 'Invoice Viewed';
      }

      if (notification.description == 'not_customer_viewed_estimate') {
        return 'Estimate Viewed';
      }

      if (notification.description == 'not_customer_viewed_proposal') {
        return 'Proposal Viewed';
      }

      if (notification.description == 'not_invoice_payment_recorded') {
        return 'Invoice Payment';
      }

      if (notification.description == 'not_proposal_assigned_to_you') {
        return 'Proposal Assigned';
      }

      if (notification.description == 'not_assigned_lead_to_you') {
        return 'Lead Assigned';
      }

      return 'Info Notification';
    }
    return notification.from_fullname;
  }

  notificationImg(notification) {
    if (['not_customer_viewed_invoice', 'not_invoice_payment_recorded'].includes(notification.description)) {
      return '/assets/icon/invoice.svg';
    }

    if (notification.description == 'not_customer_viewed_estimate') {
      return '/assets/icon/timer.svg';
    }

    if (['not_customer_viewed_proposal', 'not_proposal_assigned_to_you'].includes(notification.description)) {
      return '/assets/icon/file.svg';
    }

    if (notification.description == 'not_assigned_lead_to_you') {
      return '/assets/icon/lead.svg';
    }

    return '/assets/icon/info.svg';
  }

  getNotifications(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.notificationApi.get('', this.offset, this.limit).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.notifications = [];
          this.isSyncing = false;
        }
        if (res.status != false) {
          this.notifications.push(...res);
          this.notifications = [...new Map(this.notifications.map(item => [item?.id, item])).values()];
        }

        if (event && res.length !== this.limit && !refresh) {
          this.infiniteScroll = false;
        }

        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      },
      error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
        if (event && !refresh) {
          this.infiniteScroll = false; // Disable infinite scroll on error
        }
      }
    });
  }

  loadMoreNotifications(event: InfiniteScrollCustomEvent) {
    if(this.infiniteScroll) {
      this.offset += this.limit;
      this.getNotifications(false, event, false);
    }else{
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.infiniteScroll = true;
    this.isSyncing = true;
    this.offset = 0;
    this.getNotifications(true, event);
  }

  view(link: String) {
    if (link !== null) {
      link = link.replace('#taskid=', 'tasks/view/');
      link = link.replace('#leadid=', 'leads/view/');
      link = link.replace('proposals/list_proposals/', 'proposals/view/');
      link = link.replace('invoices/invoice/', 'invoices/view/');
      link = link.replace('invoices/list_invoices/', 'invoices/view/');
      link = link.replace('payments/payment/', 'payments/view/');
      link = link.replace('estimates/list_estimates/', 'estimates/view/');

      this.router.navigate([`/admin/${link}`]);
    }
  }

  markAllRead() {
    this.isLoading = true;
    this.notifications = [];
    this.notificationApi.markAllRead().subscribe({
      next: async (response: any) =>{
        if (response.status) {
          this.getNotifications(true, false, true);
          await PushNotifications.removeAllDeliveredNotifications();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
      }
    });
  }

  markAsReadUnread(notification, index) {
    let __action = 0;
    if (notification.isread == 0) {
      __action = 1;
    }

    this.notificationApi.markAsReadUnread(notification.id, __action).subscribe({
      next: (response: any) => {
        this.notifications[index].isread = __action;
      }
    });
  }

  ngOnInit(): void {
    this.account_switched = () => {
      this.offset = 0;
      this.isLoading = true;
      this.getFromStorage();
    };
    window.addEventListener("admin:account_switched", this.account_switched);
  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched);
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}

