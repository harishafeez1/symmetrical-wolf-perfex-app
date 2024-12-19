import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network';
import { StorageService } from './storage.service';

export var LANGUAGE_DATA = 'perfexcrm-select-language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  lang: BehaviorSubject<any> = new BehaviorSubject<any>('en');

  constructor(private translate: TranslateService,
    private storageService: StorageService,
  ) { }

  async defaultLanguage(){
    const lang: any = await Preferences.get({key: LANGUAGE_DATA});
    this.translate.setDefaultLang(lang.value ? lang.value : 'en');
    this.lang.next(lang.value ? lang.value : 'en');
    const status = await Network.getStatus();
    if (status.connected == false) {
      // Offline mode: Load translations from local storage
      this.loadTranslationsFromStorage(lang.value ? lang.value : 'en');
    } else {
      // Online mode: Load translations from server
      this.loadTranslationsFromServer(lang.value ? lang.value : 'en');
    }
  }

  async changeLanguage(lang: string) {
    this.translate.use(lang).subscribe(() => {
      this.storeTranslations(lang);
    }, (error) => {
      console.error('Error loading translations', error);
    });
    this.lang.next(lang);
    await Preferences.set({
      key: LANGUAGE_DATA,
      value: lang,
    });
  }
  loadTranslationsFromServer(lang: string) {
    this.translate.use(lang).subscribe(() => {
      console.log('English translations loaded');
      this.storeTranslations(lang);
    }, (error) => {
      console.error('Error loading English translations', error);
      // Handle error loading English translations
    });
  }

  async storeTranslations(lang: string) {
    this.storageService.setObject(`translations_${lang}`,  this.translate.translations[lang]);
  }

  async loadTranslationsFromStorage(lang: string) {
    const defaultLang = lang; // Default language when offline
    const translations = await this.storageService.getObject(`translations_${defaultLang}`);
    if (translations) {
      this.translate.setTranslation(defaultLang, translations);
      this.translate.use(defaultLang);
      console.log('Translations loaded from local storage');
    } else {
      console.error('No translations found in local storage');
      // Handle case where translations are not found in local storage
    }
  }
}
