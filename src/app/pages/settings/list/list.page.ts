import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { NOTIFICATION_TOKEN } from 'src/app/services/fcm.service';
import { SettingApiService } from 'src/app/services/setting-api.service';
import { App, AppInfo } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { CountryApiService } from 'src/app/services/country-api.service';
import { LanguageService } from 'src/app/services/language.service';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';

export var LANGUAGE_DATA = 'perfexcrm-select-language'
@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  formGroup: FormGroup;
  settings: any;
  isLoading = true;
  app_version: any;
  selectedLanguage: any;

  languages = [
    { id: '1', label: 'Arabic', short: 'ar' },
    { id: '2', label: 'Bulgarian', short: 'bg' },
    { id: '3', label: 'Catalan', short: 'ca' },
    { id: '4', label: 'Chinese', short: 'zh' },
    { id: '5', label: 'Czech', short: 'cs' },
    { id: '6', label: 'Dutch', short: 'nl' },
    { id: '7', label: 'English', short: 'en' },
    { id: '8', label: 'French', short: 'fr' },
    { id: '9', label: 'German', short: 'de' },
    { id: '10', label: 'Greek', short: 'el' },
    { id: '11', label: 'Indonesian', short: 'id' },
    { id: '12', label: 'Italian', short: 'it' },
    { id: '13', label: 'Japanese', short: 'ja' },
    { id: '14', label: 'Persian', short: 'fa' },
    { id: '15', label: 'Polish', short: 'pl' },
    { id: '16', label: 'Portuguese', short: 'pt' },
    { id: '17', label: 'Romanian', short: 'ro' },
    { id: '18', label: 'Russian', short: 'ru' },
    { id: '19', label: 'Slovak', short: 'sk' },
    { id: '20', label: 'Spanish', short: 'es' },
    { id: '21', label: 'Swedish', short: 'sv' },
    { id: '22', label: 'Turkish', short: 'tr' },
    { id: '23', label: 'Ukrainian', short: 'uk' },
    { id: '24', label: 'Vietnamese', short: 'vi' },
  ];
  constructor(
    private nav: NavController,
    private fb: FormBuilder,
    private toastController: ToastController,
    private settingApi: SettingApiService,
    private platform: Platform,
    private countryApi: CountryApiService,
    private alertController: AlertController,
    private languageService: LanguageService,
    private translate: TranslateService
  ) { }

  async ngOnInit() {

    const lang: any = await Preferences.get({ key: LANGUAGE_DATA });
    this.selectedLanguage = lang.value ? this.languages.find(lag => lag.short == lang.value) : this.languages[6];
    this.platform.ready().then(async () => {
      if (Capacitor.getPlatform() !== 'web') {
        App.getInfo().then((value: AppInfo) => {
          this.app_version = value.version;
        }, err => console.log('err =>', err));
      }
    });
  }
  async changeLanguage() {
    const alert = await this.alertController.create({
      header: this.translate.instant('change_language'),
      mode: 'ios',
      inputs: this.languages.map((option) => ({
        name: 'radioOption',
        type: 'radio',
        label: option.label,
        value: option,
        checked: this.selectedLanguage.id === option.id,
      })),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: this.translate.instant('ok'),
          handler: (data) => {
            console.log('Selected option:', data);
            this.selectedLanguage = data;
            this.languageService.changeLanguage(this.selectedLanguage.short);
            // Handle the selected option here
          },
        },
      ],

    });

    await alert.present();

  }
}
