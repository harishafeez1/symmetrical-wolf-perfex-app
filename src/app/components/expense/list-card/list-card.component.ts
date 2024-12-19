import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController } from '@ionic/angular';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ExpenseApiService } from 'src/app/services/expense-api.service';
import { CreatePage as UpdateExpensePage } from 'src/app/pages/admin/expenses/create/create.page';
import { ViewPage as ViewExpensePage } from 'src/app/pages/admin/expenses/view/view.page';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    SharePipeModule,
    TranslateModule
  ],
  selector: 'app-expense-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit,OnDestroy {

  @Input() expenses: any = [];
  @Input() isModal = false;
  private get_expense: Subscription
  constructor(
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private router: Router,
    private expenseApi: ExpenseApiService,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService,
    private animationService: AnimationService,
  ) { }

  ngOnInit() {
    this.get_expense = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_expense') {
        const checkExpense =  this.expenses.find(expense => expense.expenseid == response.data.expenseid);
        if(checkExpense){
          this.expenses = this.expenses.map(expense => {
            if (expense.expenseid === response.data.expenseid) {
              return response.data;
            }
            return expense;
          });
        }else{
          this.expenses.unshift(response.data);
        }
      }
    });
  }
  totalAmountWithTax(amount, tax1, tax2) {
    // console.log('amount =>', amount, parseFloat(amount));
    if (!amount) {
      return 0;
    }
    const total = parseFloat(amount);
    const tax1Amount = (tax1 && parseFloat(tax1) != 0) ? (total / 100) * (parseFloat(tax1)) : 0;
    const tax2Amount = (tax2 && parseFloat(tax2) != 0) ? (total / 100) * (parseFloat(tax2)) : 0;
    const totalAmount = total + (tax1Amount) + (tax2Amount);
    return totalAmount;
  }
  ngOnDestroy(): void {
    this.get_expense.unsubscribe();
  }
 async view(id: any, expense: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: ViewExpensePage,
        mode: 'ios',
        componentProps: {
          expenseInfo: expense,
          expenseId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,  
      });
      modal.onDidDismiss().then((modalFilters) => {
        console.log('modalFilters create =>', modalFilters);
        if(modalFilters.data){
         
        }
      });
      return await modal.present();
    }else{
      const extras: NavigationExtras = {
        state: expense
      };
      this.router.navigate(['admin/expenses/view', id], extras);
    }
  }

  async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdateExpensePage,
        mode: 'ios',
        componentProps: {
          expenseId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
  
      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    }else{
      this.navCtrl.navigateForward(['admin/expenses/edit/', id]);
    }
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.expenseApi.delete(id).subscribe({
        next: res => {
          if (res.status) {
            this.expenses.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
    }
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

}
