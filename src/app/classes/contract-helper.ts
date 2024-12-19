import { Injectable } from "@angular/core";

export const STATUS_NOT_SIGNED = 1;
export const STATUS_SIGNED = 2;
export const STATUS_MARK_AS_SIGNED = 3;

@Injectable({
    providedIn: 'root'
})
export class ContractHelper {
    get_statuses()
    {
        return [
            1,
            2,
            3,
        ];
    }
    get_statuses_list(){
        return [
            {id: 1, name: 'Not Signed'},
            {id: 2, name: 'Signed'},
            {id: 3, name: 'Mark as Signed'}
        ]
    }

    format_contract_status(status, classes = '', label = true)
    {
        let id = status;
        let label_class = '';
        if (status == 1) {
            status      = 'is_not_signed';
            label_class = 'default';
        }else if (status == 2) {
            status      = 'is_signed';
            label_class = 'success';
        } else if (status == 3) {
            status      = 'contracts_view_marked_as_signed';
            label_class = 'info';
        } 

        if (label == true) {
            return 'list_status contract_' + label_class;
        }

        return status;
    }
}
