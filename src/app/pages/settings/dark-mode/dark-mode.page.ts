import { Component, OnInit } from '@angular/core';
import { GetResult, Preferences } from '@capacitor/preferences';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Component({
  selector: 'app-dark-mode',
  templateUrl: './dark-mode.page.html',
  styleUrls: ['./dark-mode.page.scss'],
})
export class DarkModePage implements OnInit {
  defaultValue = 'default';
  isDark = false;
  constructor() {
    prefersDark.addEventListener('change', (mediaQuery) => {
      this.isDark = mediaQuery.matches;
    });
  }

  toggleTheme(_value) {
    console.log(_value);
    if (_value == 'on') {
      document.body.classList.toggle('dark', true);
      Preferences.set({key: 'dark-mode', value: "on"});
      this.defaultValue = 'on';
    } else if(_value == 'off') {
      document.body.classList.toggle('dark', false);
      Preferences.set({key: 'dark-mode', value: "off"});
      this.defaultValue = 'off';
    } else {
      document.body.classList.toggle('dark', prefersDark.matches);
      Preferences.set({key: 'dark-mode', value: "default"});
      this.defaultValue = 'default';
    }
  }

  ngOnInit() {
    if(prefersDark.matches) {
      this.isDark = true;
    }
    Preferences.get({key :"dark-mode"}).then((storage: GetResult) => {
      console.log(this.defaultValue, storage.value);
      if (storage.value == 'on' || storage.value == 'off') {
        this.defaultValue = storage.value;
      }
    });
  }
}
