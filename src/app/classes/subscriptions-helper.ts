import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SubscriptionsHelper {
    get_subscriptions_statuses() {
        return [
            {
                color: '#84c529',
                id: 'active',
                name: 'subscription_active',
                filter_default: true,
            },
            {
                color: '#84c529',
                id: 'future',
                name: 'subscription_future',
                filter_default: true,
            },
            {
                color: '#ff6f00',
                id: 'past_due',
                name: 'subscription_past_due',
                filter_default: true,
            },
            {
                color: '#fc2d42',
                id: 'unpaid',
                name: 'subscription_unpaid',
                filter_default: true,
            },
            {
                color: '#ff6f00',
                id: 'incomplete',
                name: 'subscription_incomplete',
                filter_default: true,
            },
            {
                color: '#777',
                id: 'canceled',
                name: 'subscription_canceled',
                filter_default: false,
            },
            {
                color: '#777',
                id: 'incomplete_expired',
                name: 'subscription_incomplete_expired',
                filter_default: false,
            }
        ];
    }
    get_subscription_status_by_id(id: string) {
        const statuses = this.get_subscriptions_statuses();

         const findStatus = statuses.find(s => s.id == id);;
        const status =  {
                color: '#777',
                id: 'not_subscribed',
                name: 'subscription_not_subscribed',
                filter_default: false,
        };

        
        return findStatus ?? status;
    }

}
