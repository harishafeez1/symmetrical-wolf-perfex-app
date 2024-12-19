import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { INTRO_KEY } from 'src/app/guards/intro.guard';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {
  isDark = false;
  constructor(private router: Router) { }

  ngOnInit() {
    console.log(document.body.classList.contains('dark'));
    if(document.body.classList.contains('dark')) {
      this.isDark = true;
    }
  }

  async start() {
		await Preferences.set({ key: INTRO_KEY, value: 'true' });
		this.router.navigateByUrl('/base-url', { replaceUrl: true });
	}

}
