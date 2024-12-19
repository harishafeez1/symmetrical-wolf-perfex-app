import { Injectable } from "@angular/core";
import { CommonApiService } from "../services/common-api.service";
import { UpdateService } from "../services/update.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SettingsHelper {
    settings: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    currency: any;
    constructor(
        private commonApi: CommonApiService,
        private updateService: UpdateService
    ) { }

    get() {
        this.commonApi.settings().subscribe({
            next: (response: any) => {
                this.settings.next(response);
                this.currency = response?.currency;
                this.updateService.checkModuleUpdate(response);
            }, error: () => {}
        });
    }

    getSettingLocalization(){
        const data = this.settings.getValue();
        return data ? data.localization : null;
    }

    getSettingCurrency(){
        return this.currency;
    }
    
}
