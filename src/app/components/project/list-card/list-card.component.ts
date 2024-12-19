import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonicModule, ModalController, NavController } from '@ionic/angular';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { CreatePage as UpdateProjectPage } from 'src/app/pages/admin/projects/create/create.page';
import { ViewPage as ViewProjectPage } from 'src/app/pages/admin/projects/view/view.page';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
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
  selector: 'app-project-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit,OnDestroy {
 @Input() projects: any = [];
 @Input() isModal = false;
 private get_project: Subscription;
 constructor(
  private navCtrl: NavController,
  public authService: AuthenticationService,
  public modalCtrl: ModalController,
  private router: Router,
  private projectApi: ProjectApiService,
  private projectHelper: ProjectsHelper,
  private sharedService: SharedService,
  private mpcAlert: MpcAlertService,
  private animationService: AnimationService,
) { }

  ngOnInit() {
    this.get_project = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_project') {
        const checkProject =  this.projects.find(project => project.id == response.data.id);
        if(checkProject){
          this.projects = this.projects.map(project => {
            if (project.id === response.data.id) {
              return response.data;
            }
            return project;
          });
        }else{
          this.projects.unshift(response.data);
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.get_project.unsubscribe();
  }
 async view(id: any, project: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: ViewProjectPage,
        mode: 'ios',
        componentProps: {
          projectInfo: project,
          projectId: id,
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
        state: project
      };
      this.router.navigate(['admin/projects/view', id], extras);
    }
  }

  async edit(id: any) {
    if(this.isModal){
      const modal = await this.modalCtrl.create({
        component: UpdateProjectPage,
        mode: 'ios',
        componentProps: {
          projectId: id,
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
      this.navCtrl.navigateForward(['admin/projects/edit/', id]);
    }
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.projectApi.delete(id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.projects.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
    }
   
  }
  
  getStatusNameByStatusId(status) {
    return this.projectHelper.get_project_status_by_id(status).name;
  }
  getStatusColorByStatusId(status) {
    return this.projectHelper.get_project_status_by_id(status).color;
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

}
