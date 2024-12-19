import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const BASE_URL_KEY = 'base_url-key';

@Injectable({
  providedIn: 'root'
})
export class BaseUrlGuard  {
  constructor(private router: Router, private storage: StorageService) {
    
  }
 
  async canLoad(): Promise<boolean> {
    const hasBaseUrl =  await this.storage.getObject(BASE_URL_KEY); 
    if(hasBaseUrl) {
      for(const account of hasBaseUrl) {
        // console.log(account);
        if (account.active == true) {
          return true;
        }
      }
    }
    
    this.router.navigateByUrl('/base-url', { replaceUrl:true });
    return false;
  }
}
