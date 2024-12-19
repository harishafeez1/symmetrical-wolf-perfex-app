import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonItemSliding, IonicModule, ModalController } from '@ionic/angular';
import { CreateNotePage } from 'src/app/pages/admin/invoices/modals/create-note/create-note.page';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { NoteApiService } from 'src/app/services/note-api.service';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    SharePipeModule
  ],
  selector: 'app-note-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
})
export class ListCardComponent implements OnInit {
  @Input() notes = [];
  @Output() noteUpdateResponse = new EventEmitter<boolean>(false);
  constructor(
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private noteApi: NoteApiService,
    private mpcAlert: MpcAlertService
  ) { }

  ngOnInit() {
    console.log('notes =>', this.notes);
  }
  async edit(note: any = null) {
    const modal = await this.modalCtrl.create({
      component: CreateNotePage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        rel_id: note.rel_id,
        rel_type: note.rel_type,
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.noteUpdate(true);
      }
    });
    return await modal.present();
  }


  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.noteApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.notes.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
    }
  }
  noteUpdate(value: boolean){
    this.noteUpdateResponse.emit(value)
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

}
