import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DotLottie } from "@lottiefiles/dotlottie-web";

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-mpc-loader',
  templateUrl: './mpc-loader.component.html',
  styleUrls: ['./mpc-loader.component.scss'],
})
export class MpcLoaderComponent implements OnInit {
  // @ViewChild('MPCLoader', { static: true }) MPCLoader: ElementRef;
  @Input() isLoading: any = true;
  loaderJson = true;
  theme = ['', 'null'].includes(document.body.getAttribute('app-theme')) ? 'default' : document.body.getAttribute('app-theme');
  constructor() { }

  async loader() {
    const dotLottie = new DotLottie({
      autoplay: true,
      loop: true,
      canvas: document.querySelector('#dotlottie-canvas'),
      src: "/assets/loader.lottie", // replace with your .lottie or .json file URL
    });

    console.log(dotLottie);

    // dotLottie.setThemeData("theme1");

    // const theming = new LottieTheming();
    // await theming.init('http://localhost:8100/assets/loader.json');

    // const themeConfig = theming.createConfig();

    // const app_theme = '#976AE2';
    // // const app_theme = this.app_theme();

    // themeConfig.Themes.push({
    //   orangeTheme: {
    //     'Color 0': app_theme,
    //     'Color 1': app_theme,
    //     'Color 2': app_theme,
    //     'Color 3': app_theme
    //   }
    // });
    // console.log(JSON.stringify(themeConfig));
    // if(!this.theme) {
    //   this.theme = theming.applyTheme(themeConfig, 'orangeTheme');
    // }
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
    // this.loader();
  }

}
