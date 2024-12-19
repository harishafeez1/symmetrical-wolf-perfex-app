import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LottieTheming } from '@lottiefiles/lottie-theming';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-mpc-loader',
  templateUrl: './mpc-loader.component.html',
  styleUrls: ['./mpc-loader.component.scss'],
})
export class MpcLoaderComponent implements OnInit {
  @ViewChild('MPCLoader', { static: true }) MPCLoader: ElementRef;
  @Input() isLoading: any = true;
  loaderJson = true;
  theme = ['', 'null'].includes(document.body.getAttribute('app-theme'))  ? 'default' : document.body.getAttribute('app-theme');
  // loaderPath:string  = 'https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json';
  constructor() {
   
   }

  async loader() {
    const theming = new LottieTheming();
    await theming.init('http://localhost:8100/assets/loader.json');

    const themeConfig = theming.createConfig();

    const app_theme = '#976AE2';
    // const app_theme = this.app_theme();

    themeConfig.Themes.push({
      orangeTheme: {
        'Color 0': app_theme,
        'Color 1': app_theme,
        'Color 2': app_theme,
        'Color 3': app_theme
      }
    });
    console.log(JSON.stringify(themeConfig));
    if(!this.theme) {
      this.theme = theming.applyTheme(themeConfig, 'orangeTheme');
    }
    console.log(this.theme);
    // this.MPCLoader.nativeElement.load(this.theme);
  }

  app_theme() {
    switch (document.body.getAttribute('app-theme')) {
      case 'red': return '#E26A6A';
      case 'purple': return '#976AE2';
      case 'orange': return '#FBBF4B';
      default: return '#7ee2beff';
    }
  }

  ngOnInit() {

    const data = '/assets/' + this.theme + '-loader.json';
    // console.log('loader data =>', data)
    // console.log('theme =>', this.theme);
    // console.log('isLoading =>', this.isLoading);
    // console.log('kkkkkkkk', document.body.getAttribute('app-theme') == 'null', this.theme);
    // this.loader();
    // console.log(this.theme);
    // console.log('/assets/' + this.theme + '-loader.json');
    // this.MPCLoader.nativeElement.load('/assets/' + this.theme + '-loader.json');
    // this.theme = this.app_theme();
  }

}
