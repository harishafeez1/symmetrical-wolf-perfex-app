import { Component, Renderer2 } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, MenuController, ModalController, NavController, Platform } from '@ionic/angular';
import { BASE_URL_KEY } from './guards/base-url.guard';
import { AuthenticationService } from './services/authentication.service';
import { FcmService } from './services/fcm.service';

import { StorageService } from './services/storage.service';
import { Badge, PermissionStatus } from '@capawesome/capacitor-badge';
import { UpdateService } from './services/update.service';
import { CommonApiService } from './services/common-api.service';
import { SettingsHelper } from './classes/settings-helper';
import { AppSubscriptionService } from './services/app-subscription.service';
import { GetResult, Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, BackgroundColorOptions } from '@capacitor/status-bar';
import { Network } from '@capacitor/network';
import { MpcToastService } from './services/mpc-toast.service';
import { OrderAppPage } from './pages/order-app/order-app.page';
import { LanguageService } from './services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { register } from 'swiper/element/bundle';
import { DatabaseService } from './services/database.service';

register();

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [];
  loggedIn = false;
  authUser: any;
  accounts = [];

  is_subscription_active = false;
  subscription_expires_at = '';

  public isSupported = false;
  defaultLang = '';
  constructor(
    public authService: AuthenticationService,
    private languageService: LanguageService,
    private router: Router,
    private nav: NavController,
    private menu: MenuController,
    private storage: StorageService,
    private platform: Platform,
    private updateService: UpdateService,
    private settingHelper: SettingsHelper,
    private fcmService: FcmService,
    private appSubscription: AppSubscriptionService,
    private alertController: AlertController,
    private mpcToast: MpcToastService,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private renderer: Renderer2,
    private databaseService: DatabaseService
  ) {

    prefersDark.addEventListener('change', (mediaQuery) => {
      this.toggleDarkTheme();
    });

    this.initializeApp();
    this.languageService.defaultLanguage();
    this.languageService.lang.subscribe(res => {
      this.defaultLang = res;
    })
  }

  toggleDarkTheme() {
    Preferences.get({ key: "dark-mode" }).then((storage: GetResult) => {
      if (storage.value == 'on') {
        document.body.classList.toggle('dark', true);
      } else if (storage.value == 'off') {
        document.body.classList.toggle('dark', false);
      } else {
        document.body.classList.toggle('dark', prefersDark.matches);
      }
    });
  }

  async ngOnInit() {
    
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      if(status.connected == true){
        this.mpcToast.showConnection('Your internet connection was restored', true)
      }else if(status.connected == false){
        this.mpcToast.showConnection('You are currently offline');
      }
    });
  
      const status = await Network.getStatus();
    
      console.log('Network status:', status);
      if(status.connected == false){
        this.mpcToast.showConnection('You are currently offline');
      }
    this.platform.ready().then(async () => {
      this.initDatabase();
      setTimeout(() => {
        SplashScreen.hide();
      }, 10000);

      this.updateService.checkForUpdate();
    });

    Badge.isSupported().then(result => {
      this.isSupported = result.isSupported;
      if (this.isSupported) {
        Badge.checkPermissions().then(async (permission: PermissionStatus) => {
          if (permission.display == 'prompt') {
            // console.log('request permissions for badge');
            await Badge.requestPermissions();
          }

          if (permission.display == 'granted') {
            // console.log('badge already have permissions');
          }
        }, err => console.log('badge per =>', err));
      }
    }, err => console.log('badge support per =>', err));

    this.refreshBadgeCount();

    this.accounts = await this.storage.getObject(BASE_URL_KEY);

    this.loggedIn = false;
    this.authService.isAuthenticated.subscribe(async (loggedIn) => {

      // this.appSubscription.validate().subscribe((is_subscribed) => {
      //   if (is_subscribed) {
      //     this.is_subscription_active = true;
      //     if (this.appSubscription.is_trail_active) {

      //       this.subscription_expires_at = 'Free Trail Expires in: ' + this.appSubscription.trail_expires_at;
      //       if (this.router.url == '/app-subscription') {
      //         this.nav.navigateRoot('/admin/dashboard');
      //       }
      //     } else if (this.appSubscription.is_sub_active) {
      //       if (this.router.url == '/app-subscription') {
      //         this.nav.navigateRoot('/admin/dashboard');
      //       }
      //       this.subscription_expires_at = 'Subscription Expires in: ' + this.appSubscription.sub_expires_at;
      //     }
      //   } else {
      //     this.is_subscription_active = false;
      //     this.subscription_expires_at = this.appSubscription.sub_expires_at;
      //     if (this.router.url !== '/base-url') {
      //       this.nav.navigateRoot('/app-subscription');
      //     }
      //   }
      // });


      // console.log(loggedIn);
      if (loggedIn) {
        if (this.router.url == '/login') {
          this.nav.navigateRoot('/admin/dashboard');
        }

        this.settingHelper.get();

        this.fcmService.initPush();

        this.loggedIn = true;

        if (this.authService.auth) {
          this.authUser = this.authService.auth?.data;
          console.log('this.authUser =>', this.authUser);
          // console.log(this.authUser.total_unread_notifications);
          await this.setBadgeCount(this.authUser.total_unread_notifications);
          if (this.authUser?.admin == 1) {
            this.appPages = [
              { title: 'als_dashboard', url: '/admin/dashboard', icon: 'menu' },
              { title: 'clients', url: '/admin/customers/list', icon: 'user' },
              { title: 'invoices', url: '/admin/invoices/list', icon: 'invoice' },
              { title: 'proposals', url: '/admin/proposals/list', icon: 'file' },
              { title: 'estimates', url: '/admin/estimates/list', icon: 'timer' },
              { title: 'payments', url: '/admin/payments/list', icon: 'dollar' },
              { title: 'credit_notes', url: '/admin/credit_notes/list', icon: 'edit' },
              { title: 'items', url: '/admin/invoice_items/list', icon: 'items' },
              { title: 'expenses', url: '/admin/expenses/list', icon: 'dollar-square' },
              { title: 'contracts', url: '/admin/contracts/list', icon: 'contract' },
              { title: 'projects', url: '/admin/projects/list', icon: 'folder' },
              { title: 'tasks', url: '/admin/tasks/list', icon: 'note' },
              { title: 'leads', url: '/admin/leads/list', icon: 'lead' },
              { title: 'subscriptions', url: '/admin/subscriptions/list', icon: 'calendar' },
              { title: 'tickets', url: '/admin/tickets/list', icon: 'poll' },
              // { title: 'Appointments', url: '/admin/appointments/list', icon: 'calendar' },
              // { title: 'Sales Reports', url: '/admin/sales_reports/list', icon: 'poll' },
              // { title: 'Settings', url: '/admin/settings/list', icon: 'setting' },
              { title: 'staff', url: '/admin/staffs/list', icon: 'user' }
            ];
          } else {

            this.appPages[0] = { title: 'Dashboard', url: '/admin/dashboard', icon: 'menu' };

            if (this.authService.showMenuItem('customers')) {
              this.appPages[1] = { title: 'Customers', url: '/admin/customers/list', icon: 'user' };
            }

            if (this.authService.showMenuItem('invoices')) {
              this.appPages[2] = { title: 'Invoices', url: '/admin/invoices/list', icon: 'invoice' };
            }

            if (this.authService.showMenuItem('proposals')) {
              this.appPages[3] = { title: 'Proposals', url: '/admin/proposals/list', icon: 'file' };
            }

            if (this.authService.showMenuItem('estimates')) {
              this.appPages[4] = { title: 'Estimates', url: '/admin/estimates/list', icon: 'timer' };
            }

            if (this.authService.showMenuItem('payments')) {
              this.appPages[5] = { title: 'Payments', url: '/admin/payments/list', icon: 'dollar' };
            }

            if (this.authService.showMenuItem('credit_notes')) {
              this.appPages[6] = { title: 'Credit Notes', url: '/admin/credit_notes/list', icon: 'edit' };
            }

            if (this.authService.showMenuItem('items')) {
              this.appPages[7] = { title: 'Items', url: '/admin/invoice_items/list', icon: 'items' };
            }

            if (this.authService.showMenuItem('expenses')) {
              this.appPages[8] = { title: 'Expenses', url: '/admin/expenses/list', icon: 'dollar-square' };
            }

            if (this.authService.showMenuItem('contracts')) {
              this.appPages[9] = { title: 'Contracts', url: '/admin/contracts/list', icon: 'contract' };
            }

            if (this.authService.showMenuItem('projects')) {
              this.appPages[10] = { title: 'Projects', url: '/admin/projects/list', icon: 'folder' };
            }

            if (this.authService.showMenuItem('tasks')) {
              this.appPages[11] = { title: 'Tasks', url: '/admin/tasks/list', icon: 'note' };
            }

            if (this.authService.showMenuItem('leads')) {
              this.appPages[12] = { title: 'Leads', url: '/admin/leads/list', icon: 'lead' };
            }

            if (this.authService.showMenuItem('subscriptions')) {
              this.appPages[13] = { title: 'Subscriptions', url: '/admin/subscriptions/list', icon: 'calendar' };
            }

            // if (this.authService.hasPermission('reports', ['view', 'view_own'])) {
            //   this.appPages[14] = { title: 'Sales Reports', url: '/admin/sales_reports/list', icon: 'poll' };
            // }

            // if (this.authService.hasPermission('settings', ['view', 'view_own'])) {
            //   this.appPages[15] = { title: 'Settings', url: '/admin/settings/list', icon: 'setting' };
            // }

            if (this.authService.showMenuItem('tickets')) {
              this.appPages[15] = { title: 'tickets', url: '/admin/tickets/list', icon: 'poll' };
            }

            if (this.authService.showMenuItem('staff')) {
              this.appPages[16] = { title: 'Staff', url: '/admin/staffs/list', icon: 'user' };
            }

            // if(permission?.feature == 'appointments' && (permission?.capability == 'view' || permission?.capability == 'view_own')) {
            //   this.appPages.push({ title: 'Appointments', url: '/admin/appointments/list', icon: 'calendar' });
            // } 
          }
        }

        // console.log(this.appPages);
      }
    });

    const eventHandlerForSettingHelper = () => this.settingHelper.get();
    window.addEventListener("admin:estimate_created", eventHandlerForSettingHelper);
    window.addEventListener("admin:credit_note_created", eventHandlerForSettingHelper);
    window.addEventListener("admin:invoice_created", eventHandlerForSettingHelper);

    window.addEventListener("admin:logged_in", () => {
      if (this.authService.auth) {
        this.authUser = this.authService.auth?.data;
      }
    });

    window.addEventListener("admin:logged_out", () => {
      this.loggedIn = false;
      this.authUser = false;

      this.appPages = [];
      this.nav.navigateRoot('/login', { replaceUrl: true });
      this.menu.close();
    });

    window.addEventListener("admin:account_switched", async () => {
      this.accounts = await this.storage.getObject(BASE_URL_KEY);

      this.appPages = [];
      this.loggedIn = false;
      this.authUser = false;

      // await this.authService.loadAuthData();
    });
    // console.log(this.accounts);
  }
  async initDatabase(){
    await this.databaseService.initializePlugin();
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
    this.menu.close();

    await this.authService.loadAuthData();
    window.dispatchEvent(new CustomEvent('admin:account_switched'));
  }
  async orderApp() {
    const modal = await this.modalCtrl.create({
      component: OrderAppPage,
      mode: 'ios',
    });
    modal.onDidDismiss().then((modalFilters) => {
      if (modalFilters.data) {

      }
    });
    return await modal.present();
  }

  baseUrl() {
    this.menu.close();
    this.router.navigate(['base-url']);
  }

  openStaff() {
    this.menu.close();
    const extras: NavigationExtras = {
      state: this.authUser
    };
    this.router.navigate(['admin/staffs/view/', this.authUser?.staffid], extras);
  }

  openSetting() {
    this.menu.close();
    this.router.navigate(['settings/list']);
  }

  openNotifications() {
    this.menu.close();
    this.router.navigate(['admin/notifications']);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Perfex CRM',
      subHeader: this.translate.instant('logout_sub_header_text'),
      mode: 'ios',
      buttons: [
        {
          text: this.translate.instant('no'),
          role: 'cancel',
          handler: () => {
          },
        },
        {
          text: this.translate.instant('yes'),
          role: 'confirm',
          handler: () => {
            this.authService.logout().subscribe(() => {
              window.dispatchEvent(new CustomEvent('admin:logged_out'));
            });
          },
        },
      ],
    });

    await alert.present();

  }

  async initializeApp() {
    this.toggleDarkTheme();

    Preferences.get({ key: "app-theme" }).then((storage: GetResult) => {
      // document.body.setAttribute('app-theme', storage.value ? storage.value : '');
      this.renderer.setAttribute(document.body, 'app-theme', storage.value ? storage.value : '');

    });
  }

  public async getBadgeCount(): Promise<number> {
    const result = await Badge.get();
    return result.count;
  }

  public async setBadgeCount(count: number): Promise<void> {
    await Badge.set({ count });
    await this.refreshBadgeCount();
  }

  public async clearBadgeCount(): Promise<void> {
    await Badge.clear();
    await this.refreshBadgeCount();
  }

  public async increaseBadgeCount(): Promise<void> {
    await Badge.increase();
    await this.refreshBadgeCount();
  }

  public async decreaseBadgeCount(): Promise<void> {
    await Badge.decrease();
    await this.refreshBadgeCount();
  }

  private async refreshBadgeCount(): Promise<void> {
    const count = await this.getBadgeCount();
  }

}
