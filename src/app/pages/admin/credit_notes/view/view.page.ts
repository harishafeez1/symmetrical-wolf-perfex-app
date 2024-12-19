import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ActionSheetController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { CreditNotesHelper, STATUS_CLOSED, STATUS_OPEN, STATUS_VOID } from 'src/app/classes/credit-notes-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CreditNoteApiService } from 'src/app/services/credit-note-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
// import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { CreateReminderPage } from '../../invoices/modals/create-reminder/create-reminder.page';
import { ApplyToInvoicePage } from '../modals/apply-to-invoice/apply-to-invoice.page';
import { RefundPage } from '../modals/refund/refund.page';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateCreditNotePage } from 'src/app/pages/admin/credit_notes/create/create.page';
import { Subscription } from 'rxjs';
import { AttachFilePage } from '../../proposals/modals/attach-file/attach-file.page';
import { AttachFileApiService } from 'src/app/services/attach-file-api.service';
import { CommonHelper } from 'src/app/classes/common-helper';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { ViewPage as ViewInvoicePage } from 'src/app/pages/admin/invoices/view/view.page';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';
@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  @Input() creditNoteId: any;
  @Input() type = '';
  @Input() credit_note_info: any;
  credit_note_id = this.activatedRoute.snapshot.paramMap.get('id');
  selectedTab = 'credit_note';
  credit_note: any;
  countries = [];
  currencies = [];
  totalTaxes = [];
  isLoading = true;

  reminders = [];
  reminder_search = '';
  reminder_offset = 0;
  reminder_limit = 20;

  private country$: Subscription;
  private currency$: Subscription;

  isSearching = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private creditNoteApi: CreditNoteApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private reminderApi: ReminderApiService,
    private creditNoteHelper: CreditNotesHelper,
    public commonHelper: CommonHelper,
    public authService: AuthenticationService,
    // private fileOpener: FileOpener,
    private actionSheetController: ActionSheetController,
    private modalCtrl: ModalController,
    // private routerOutlet: IonRouterOutlet,
    private mpcToast: MpcToastService,
    private sharedService: SharedService,
    private attachFileApi: AttachFileApiService,
    private downloadApi: DownloadApiService,
    private mpcAlert: MpcAlertService,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {

  }

  ngOnInit() {
    this.credit_note_id = this.credit_note_id ?? this.creditNoteId;

    window.addEventListener("admin:credit_note_updated", () => {
      this.getCreditNote();
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.credit_note = this.router.getCurrentNavigation().extras.state;
        this.calculateInvoice();
        this.calculateRefunds(this.credit_note);
        this.isLoading = false;
      } else {
        if (this.type === 'modal' && this.credit_note_info) {
          this.credit_note = this.credit_note_info;
          this.calculateInvoice();
          this.calculateRefunds(this.credit_note);
          this.isLoading = false;
        } else {
          this.getCreditNote();
        }
      }
    });

    this.country$ = this.countryApi.getCountriesData().subscribe(res => {
      if (!res) {
        this.countryApi.get().subscribe({
          next: async response => {
            this.countryApi.setCountriesData(response);
          }
        });
      } else {
        this.countries = res;
      }
    })
    /* this.currencyApi.get().subscribe(response => {
      this.currencies = response;
    }); */
    this.currency$ = this.currencyApi.getCurrenciesData().subscribe(async res => {
      if (!res) {
        this.currencyApi.get().subscribe({
          next: response => {
            this.currencyApi.setCurrenciesData(response);
          }
        });
      } else {
        this.currencies = await res;
      }
    })
  }

  ngOnDestroy() {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  getCreditNote(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = true;
    this.creditNoteApi.get(this.credit_note_id).subscribe({
      next: (res) => {
        console.log(res);
        this.credit_note = res;
        this.calculateInvoice();
        this.sharedService.dispatchEvent({
          event: 'admin:get_credit_note',
          data: this.credit_note
        });
        if (event && refresh == false) {
          event.target.disabled = true;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getReminders(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.reminderApi.get(this.credit_note_id, 'credit_note', this.reminder_search, this.reminder_offset, this.reminder_limit)
    .subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.reminders.push(...res);
          this.reminders = [...new Map(this.reminders.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.reminder_limit && refresh == false) {
          event.target.disabled = true;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getStatusNameByStatusId(status: any) {
    return this.creditNoteHelper.get_status_by_id(status).name;
  }

  getStatusColorByStatusId(status: any) {
    return this.creditNoteHelper.get_status_by_id(status).color;
  }

  getCountryNameById(country_id: Number) {
    for (let country of this.countries) {
      if (country.country_id == country_id) {
        return country.short_name;
      }
    }
    return '';
  }

  getCurrencyNameById(currency_id: Number) {
    for (let currency of this.currencies) {
      if (currency.id == currency_id) {
        return currency.name + ' <small>' + currency.symbol + '</small>';
      }
    }
    return 'System Default';
  }

  calculateInvoice() {
    this.totalTaxes = [];
    this.credit_note.items.forEach((item) => {
      if (item.taxrate.length != 0) {
        for (let tax of item.taxrate) {
          if (!this.totalTaxes[tax.name]) {
            this.totalTaxes[tax.name] = {
              name: tax.name
            };
          }

          this.totalTaxes[tax.name].taxrate = tax.taxrate;

          if (!this.totalTaxes[tax.name].subTotal) {
            this.totalTaxes[tax.name].subTotal = 0;
          }
          this.totalTaxes[tax.name].subTotal += (((item.rate * item.qty) / 100) * tax.taxrate);
        }

      }
    });
  }

  calculateRefunds(credit_note: any) {
    const totalRefunds = credit_note.refunds.length > 0 ? credit_note.refunds.reduce((x, y) => x + (y.amount ? Number(y.amount) : 0), 0) : 0;
    this.credit_note.total_refunds = totalRefunds;
  }

  showDiscount(credit_note) {
    if (credit_note?.discount_percent) {
      return credit_note.discount_percent != 0 ? '(' + parseInt(credit_note.discount_percent) + '%)' : '';
    }
    return '';
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'reminders' && this.reminders.length == 0) {
      this.getReminders(true);
    }
  }

  doRefresh(event: any, tab = '') {
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, event);
  }

  doSearch(event: any, tab = '') {
    console.log('event', event.detail.value);
    this[tab + '_search'] = event.detail.value;
    this[tab + '_offset'] = 0;
    this[tab + 's'] = [];
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, false, true);
  }

  doCreditNoteRefresh(event: any, tab = '') {
    this.getCreditNote(true, event);
  }

  async deleteCreditedInvoice(applied_credit_id: any, credit_note_id: any, applied_credit_invoice_id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.creditNoteApi.deleteCreditedInvoice(applied_credit_id, credit_note_id, applied_credit_invoice_id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.credit_note.applied_credits.splice(index, 1); //remove from list
          }
        }
      });
    }
  }
  async viewCreditedInvoice(id: any, invoice: any) {
    const modal = await this.modalCtrl.create({
      component: ViewInvoicePage,
      mode: 'ios',
      componentProps: {
        invoiceId: id,
        type: 'modal'
      },
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });
    modal.onDidDismiss().then((modalFilters) => {
      if (modalFilters.data) {

      }
    });
    return await modal.present();
  }

  async deleteRefund(refund_id: any, credit_note_id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.creditNoteApi.deleteRefund(refund_id, credit_note_id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.credit_note.refunds.splice(index, 1); //remove from list
          }
        }
      });
    }
  }

  loadMore(event: any, tab = '') {
    this[tab + '_offset'] += this[tab + '_limit'];
    console.log(tab + '_offset:', this[tab + '_offset']);
    this.getCreditNote(false, event, false);
  }

  searchReminders(event) {
    console.log('event', event.detail.value);
    this.reminder_search = event.detail.value;
    this.reminder_offset = 0;
    this.reminders = [];
    this.getReminders(true, false, true);
  }

  async applyToInvoice() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: ApplyToInvoicePage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        credit_note: this.credit_note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getCreditNote();
        this.getReminders();
      }
    });
    return await modal.present();
  }

  async addEditReminder(reminder: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateReminderPage,
      breakpoints: [0, 0.25, 0.5, 0.75, 0.90, 1.0],
      initialBreakpoint: 0.90,
      mode: 'ios',
      componentProps: {
        rel_type: 'credit_note',
        rel_id: this.credit_note_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getCreditNote();
        this.getReminders();
      }
    });
    return await modal.present();
  }

  deleteReminder(id: any, index: any) {
    this.reminderApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.reminders.splice(index, 1); //remove from list
        }
      }
    });
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getPDF(action = 'view') {
    this.creditNoteApi.getPDF(this.credit_note_id).subscribe({
      next: async (response: any) => {
        console.log(response);
        if (response.status) {
          const savedFile = await Filesystem.writeFile({
            path: 'credit_note_' + this.credit_note_id + '.pdf',
            data: response.pdf,
            directory: Directory.Documents
          });
          if (action == 'view') {
            FileOpener.open({
              filePath: savedFile.uri,
              contentType: 'application/pdf',
              openWithDefault: true
            })
              .then(() => console.log('File is opened'))
              .catch(error => console.log('Error opening file', error));
          } else {
            FileOpener.open({
              filePath: savedFile.uri,
              contentType: 'application/pdf',
              openWithDefault: false
            })
              .then(() => console.log('File is opened'))
              .catch(error => console.log('Error opening file', error));
          }
        }
      }
    });
  }

  deleteCreditNote() {
    this.creditNoteApi.delete(this.credit_note_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.router.navigate(['/admin/credit_notes/list']);
          window.dispatchEvent(new CustomEvent('admin:refresh_data'));
        }
      }
    });
  }

  markAs(status: Number) {
    this.creditNoteApi.markAs(status, this.credit_note_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getCreditNote();
        } else {
          this.mpcToast.show(response.message ?? response.error, 'danger')
        }
      }
    });
  }

  async openPdf() {
    let _buttons = [];

    _buttons.push({
      text: this.translate.instant('view_pdf'),
      handler: () => {
        this.getPDF();
      }
    },
      {
        text: this.translate.instant('download_pdf'),
        handler: () => {
          this.getPDF('download');
        }
      }),

      _buttons.push({
        text: this.translate.instant('cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      });

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: _buttons,
      mode: 'ios'
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
  }

  async openMore() {
    let _buttons = [];

    if (this.credit_note.status == 1 && this.authService.hasPermission('credit_notes', ['edit'])) {
      _buttons.push({
        text: this.translate.instant('refund'),
        handler: async () => {
          const modal = await this.modalCtrl.create({
            component: RefundPage,
            canDismiss: true,
            // presentingElement: this.routerOutlet.nativeEl,
            mode: 'ios',
            componentProps: {
              credit_note: this.credit_note
            }
          });

          modal.onDidDismiss().then((response) => {
            console.log('add refund data =>', response);
            if(response.data){
              this.getCreditNote();
            }

          });
          await modal.present();
        }
      })
    }

    _buttons.push({
      text: this.translate.instant('attach_file'),
      handler: () => {
        this.attachFiles();
      }
    })
    if (this.credit_note.status != 2 && this.credit_note.status != 3 && !this.credit_note.credits_used && !this.credit_note.total_refunds && this.authService.hasPermission('credit_notes', ['edit'])) {
      _buttons.push({
        text: this.translate.instant('credit_note_status_void'),
        handler: () => {
          this.markAs(STATUS_VOID);
        }
      })
    } else if (this.credit_note.status == 3 && this.authService.hasPermission('credit_notes', ['edit'])) {
      _buttons.push({
        text: this.translate.instant('credit_note_status_open'),
        handler: () => {
          this.markAs(STATUS_OPEN);
        }
      })
    }

    _buttons.push({
      role: 'destructive',
      text: this.translate.instant('_delete'),
      handler: () => {
        this.deleteCreditNote();
      }
    })

    _buttons.push({
      text: this.translate.instant('cancel'),
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    });

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      // header: 'More',
      buttons: _buttons,
      mode: 'ios'
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
  }

  async addEditRefund(refund: any, credit_note) {
    const modal = await this.modalCtrl.create({
      component: RefundPage,
      canDismiss: true,
      mode: 'ios',
      componentProps: {
        credit_note,
        refund
      }
    });

    modal.onDidDismiss().then((response: any) => {
      if(response?.data) {
        this.getCreditNote();
      }
    });
    await modal.present();
  }

  close() {
    this.modalCtrl.dismiss(false, 'dismiss');
  }

  reminderRefresh(event) {
    if (event) {
      this.getReminders();
    }
  }

  goToPage(page) {
    this.router.navigate([`${page}`]);
  }

  async editCreditNote(id: any) {
    if (this.type === 'modal') {
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateCreditNotePage,
        mode: 'ios',
        componentProps: {
          creditNoteId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });

      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    } else {
      this.router.navigate(['admin/credit_notes/edit/', id]);
    }
  }

  async attachFiles() {
    const modal = await this.modalCtrl.create({
      component: AttachFilePage,
      cssClass: 'attach-file-modal',
      mode: 'ios',
      componentProps: {
        rel_type: 'credit_note',
        rel_id: this.credit_note.id
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.getCreditNote();
      }
    });
    return await modal.present();
  }

  visibleToCustomer(event, index, attachment: any) {
    const status = attachment.visible_to_customer == 0 ? 1 : 0;
    this.attachFileApi.visibleToCustomerStatus(attachment.id, status).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.credit_note.attachments[index].visible_to_customer = status;
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }, error:  () => {}
    });
  }
  
  async deleteFile(file_id) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.attachFileApi.deleteAttachment(file_id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.getCreditNote();
            this.mpcToast.show(response.message);
          } else {
            this.mpcToast.show(response.message, 'danger');
          }
        }
      });
    }
  }

  downloadAttachment(attachment_id: any, filetype: any, filename: any) {
    this.downloadApi.get('sales_attachment', attachment_id).subscribe({
      next: async (response: any) => {
        const blobData = await this.blobToBase64(response);
  
        try {
          // Write the base64-encoded string to a file in the Documents directory
          const savedFile = await Filesystem.writeFile({
            path: filename,
            data: blobData,
            directory: Directory.Documents,
          });
  
          // Open the PDF using the FileOpener plugin
          await FileOpener.open({
              filePath: savedFile.uri,
              contentType: filetype,
              openWithDefault: false
            });
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read Blob as base64.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
