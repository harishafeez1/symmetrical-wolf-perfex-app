import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private eventSubject = new Subject<any>();

  eventObservable$ = this.eventSubject.asObservable();

  dispatchEvent(eventData: any) {
    this.eventSubject.next(eventData);
  }
}
