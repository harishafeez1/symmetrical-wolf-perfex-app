import { Injectable } from "@angular/core";

export const STATUS_OPEN = 1;
export const STATUS_CLOSED = 2;
export const STATUS_VOID = 3;

@Injectable({
    providedIn: 'root'
})
export class CreditNotesHelper {
    get_statuses() {
        return [
            {
                id             : 1,
                color          : '#03a9f4',
                name           : 'credit_note_status_open',
                order          : 1,
                filter_default : true,
            },
            {
                id             : 2,
                color          : '#84c529',
                name           : 'credit_note_status_closed',
                order          : 2,
                filter_default : true,
            },
            {
                id             : 3,
                color          : '#777',
                name           : 'credit_note_status_void',
                order          : 3,
                filter_default : false,
            }
        ];
    }

    get_status_by_id(id: Number) {
        const statuses = this.get_statuses();

        let status = {
            id: 0,
            color: '#333',
            name: '[Status Not Found]',
            order: 1,
        };

        for (let s of statuses) {
            if (s.id == id) {
                status = s;
                break;
            }
        }
        return status;
    }
}
