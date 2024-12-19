import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sorting',
  templateUrl: './sorting.page.html',
  styleUrls: ['./sorting.page.scss'],
})
export class SortingPage implements OnInit {
  @Input() appliedSorting: any;
  @Input() sorts: any;
  isSorted = true;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  applySorting(sort_by: any, order: any) {
    this.appliedSorting.sort_by = sort_by;
    this.appliedSorting.order = order;
    this.modalCtrl.dismiss(this.appliedSorting);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
