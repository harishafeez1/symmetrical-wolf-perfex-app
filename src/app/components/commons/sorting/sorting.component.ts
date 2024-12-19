import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { IonModal, IonicModule, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { CommonHelper } from 'src/app/classes/common-helper';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule
  ],
  selector: 'mpc-sorting',
  templateUrl: './sorting.component.html',
  styleUrls: ['./sorting.component.scss'],
})
export class SortingComponent implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  @Output() ionChange = new EventEmitter<string>();
  appliedSorting: any;
  @Input() apiService: any;

  isSorted:boolean = false;
  isModalOpen = false;

  constructor(private commonHelper: CommonHelper) {}

  setOpen(isOpen: boolean) {
    console.log('setOpen clicked');
    this.isModalOpen = isOpen;
  }

  ngOnInit() {
    // console.log(this.appliedSorting);
    this.isSorted = true;
    for(let sort of this.apiService.sorts) {
      if(sort.key == this.apiService.sort.sort_by && sort?.default_order == this.apiService.sort.order) {
        this.isSorted = false;
      }
    }
  }

  applySorting(sort_by: any, order: any) {
    let sorting: any = {sort_by, order};
    
    this.isSorted = true;
    for(let sort of this.apiService.sorts) {
      if(sort.key == sort_by && sort?.default_order == order) {
        this.isSorted = false;
      }
    }

    this.apiService.sort = {sort_by, order};

    this.ionChange.emit(sorting);
    this.modal.dismiss();
  }

  close() {
    this.modal.dismiss();
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
