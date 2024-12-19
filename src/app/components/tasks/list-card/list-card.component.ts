import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController, createAnimation } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';
import { StorageService } from 'src/app/services/storage.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { CreatePage as UpdateTaskPage} from '../../../pages/admin/tasks/create/create.page';
import { ViewPage as ViewTaskPage} from '../../../pages/admin/tasks/view/view.page';
import { Animation, AnimationController } from '@ionic/angular';
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
  selector: 'task-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit, OnDestroy {
  @Input() tasks: any = [];
  @Input() isModal = false;
  private get_task: Subscription;

  constructor(
    public taskApi: TaskApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    public taskHelper: TasksHelper,
    private storage: StorageService,
    private router: Router,
    private sharedService: SharedService,
    private animationService: AnimationService,
    private mpcAlert: MpcAlertService
  ) { }

  ngOnInit() {
    console.log('............ngOnInit................');
    this.get_task = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_task') {
        const checkTask =  this.tasks.find(task => task.id == response.data.id);
        if(checkTask){
          this.tasks = this.tasks.map(task => {
            if (task.id === response.data.id) {
              return response.data;
            }
            return task;
          });
        }else{
          this.tasks.unshift(response.data);
        }
      }
    });
  }

  ngOnDestroy(): void {
    console.log('............ngOnDestroy................');
    this.get_task.unsubscribe();
  }
  async view(id: any, task: any) {
    if(this.isModal) {
      console.log('open modal');
    const modal = await this.modalCtrl.create({
      component: ViewTaskPage,
      mode: 'ios',
      componentProps: {
        taskInfo: task,
        taskId: id,
        type: 'modal'
      },
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });
    modal.onDidDismiss().then((modalFilters) => {
    });
    return await modal.present();
      
    } else {
      const extras: NavigationExtras = {
        state: task
      };
      this.router.navigate(['admin/tasks/view', id], extras);
    }
  }
  

  async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdateTaskPage,
        mode: 'ios',
        componentProps: {
          taskId: id,
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
      this.navCtrl.navigateForward(['admin/tasks/edit/', id]);
    }
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.taskApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.tasks.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
    }
  }

  getStatusNameByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).color;
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
