import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule
  ],
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent implements OnInit {
@Input() isAvatar = false;
  constructor() { }

  ngOnInit() {
    console.log('this.isAvatar =>', this.isAvatar);
  }

}
