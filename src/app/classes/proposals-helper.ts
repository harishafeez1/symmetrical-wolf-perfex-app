import { Injectable } from "@angular/core";

export const STATUS_OPEN = 1;
export const STATUS_DECLINED = 2;
export const STATUS_ACCEPTED = 3;
export const STATUS_SENT = 4;
export const STATUS_REVISED = 5;
export const STATUS_DRAFT = 6;

@Injectable({
    providedIn: 'root'
})
export class ProposalsHelper {
    get_statuses()
    {
        return [
            6,
            4,
            1,
            5,
            2,
            3,
        ];
    }
    get_statuses_list(){
        return [
            {id: 6, name: 'proposal_status_draft'},
            {id: 4, name: 'proposal_status_sent'},
            {id: 1, name: 'proposal_status_open'},
            {id: 5, name: 'proposal_status_revised'},
            {id: 2, name: 'proposal_status_declined'},
            {id: 3, name: 'proposal_status_accepted'}
        ]
    }

    format_proposal_status(status, classes = '', label = true)
    {
        let id = status;
        let label_class = '';
        if (status == 1) {
            status      = 'proposal_status_open';
            label_class = 'default';
        } else if (status == 2) {
            status      = 'proposal_status_declined';
            label_class = 'danger';
        } else if (status == 3) {
            status      = 'proposal_status_accepted';
            label_class = 'success';
        } else if (status == 4) {
            status      = 'proposal_status_sent';
            label_class = 'info';
        } else if (status == 5) {
            status      = 'proposal_status_revised';
            label_class = 'info';
        } else if (status == 6) {
            status      = 'proposal_status_draft';
            label_class = 'default';
        }

        if (label == true) {
            return 'list_status proposal_' + label_class;
        }

        return status;
    }
}
