import { Component, OnInit, Renderer2 } from '@angular/core';
import { GetResult, Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-themes',
  templateUrl: './themes.page.html',
  styleUrls: ['./themes.page.scss'],
})
export class ThemesPage implements OnInit {
  defaultValue = '';
  constructor(private renderer: Renderer2) {
  }

  toggleTheme(_value) {
    // document.body.setAttribute('app-theme', _value);
    this.renderer.setAttribute(document.body, 'app-theme', _value);
    Preferences.set({key: 'app-theme', value: _value});
    this.defaultValue = _value;
    window.dispatchEvent(new CustomEvent('app:theme_changed'));
  }

  ngOnInit() {
    Preferences.get({key :"app-theme"}).then((storage: GetResult) => {
      console.log(this.defaultValue, storage.value);
      this.defaultValue = storage.value;
    });
  }
}
