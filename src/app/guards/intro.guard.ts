import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';


export const INTRO_KEY = 'MPC-intro-seen';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard  {

  constructor(private router: Router) { }

  async canLoad(): Promise<boolean> {
      const hasSeenIntro = await Preferences.get({key: INTRO_KEY});
      if (hasSeenIntro && (hasSeenIntro.value === 'true')) {
        return true;
      } else {
        this.router.navigateByUrl('/intro', { replaceUrl:true });
        return false;
      }
  }
}