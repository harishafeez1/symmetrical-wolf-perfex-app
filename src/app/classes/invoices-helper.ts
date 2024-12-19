import { Injectable } from "@angular/core";
import { EChartsOption } from "echarts";
export const STATUS_UNPAID = 1;
export const STATUS_PAID = 2;
export const STATUS_PARTIALLY = 3;
export const STATUS_OVERDUE = 4;
export const STATUS_CANCELLED = 5;
export const STATUS_DRAFT = 6;
export const STATUS_DRAFT_NUMBER = 1000000000;

@Injectable({
    providedIn: 'root'
})
export class InvoicesHelper {
    mediumColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-medium');
    ionItemBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-item-border-color');
    private statuses = [
        STATUS_UNPAID,
        STATUS_PAID,
        STATUS_PARTIALLY,
        STATUS_OVERDUE,
        STATUS_CANCELLED,
        STATUS_DRAFT,
    ];

    get_statuses() {
        return this.statuses;
    }
    get_statuses_list(){
        return [
            {id: 1, name: 'invoice_status_unpaid'},
            {id: 2, name: 'invoice_status_paid'},
            {id: 3, name: 'invoice_status_not_paid_completely'},
            {id: 4, name: 'invoice_status_overdue'},
            {id: 5, name: 'invoice_status_cancelled'},
            {id: 6, name: 'invoice_status_draft'},
        ]
    }

    format_invoice_status(status: any, classes = '', label = true) {
        let id = status;
        let label_class = this.get_invoice_status_label(status);
        if (status == STATUS_UNPAID) {
            status = 'invoice_status_unpaid';
        } else if (status == STATUS_PAID) {
            status = 'invoice_status_paid';
        } else if (status == STATUS_PARTIALLY) {
            status = 'invoice_status_not_paid_completely';
        } else if (status == STATUS_OVERDUE) {
            status = 'invoice_status_overdue';
        } else if (status == STATUS_CANCELLED) {
            status = 'invoice_status_cancelled';
        } else {
            // status 6
            status = 'invoice_status_draft';
        }
        if (label == true) {
            return '<ion-text color="' + label_class + '" class="label label-' + label_class + ' ' + classes + ' s-status invoice-status-' + id + '">' + status + '</ion-text>';
        }

        return status;
    }

    get_invoice_status_label(status: any) {
        let label_class = '';
        if (status == STATUS_UNPAID) {
            label_class = 'invoice_danger';
        } else if (status == STATUS_PAID) {
            label_class = 'invoice_success';
        } else if (status == STATUS_PARTIALLY) {
            label_class = 'invoice_warning';
        } else if (status == STATUS_OVERDUE) {
            label_class = 'invoice_warning';
        } else if (status == STATUS_CANCELLED || status == STATUS_DRAFT) {
            label_class = 'invoice_default';
        } else {
            if (isNaN(status)) {
                if (status == 'not_sent') {
                    label_class = 'invoice_default';
                }
            }
        }

        return 'list_status ' + label_class;
    }

    eChatOptions(): EChartsOption {
        return {
            title: {
                show: false
            },
            legend: {
                show: false
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                }
            },
            grid: {
                top: '3%',
                left: '0',
                right: '0',
                bottom: '3%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: [],
                axisTick: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    interval: 0,
                    fontFamily: 'Roboto',
                    margin: 10,
                    color: '#828282'
                }
            },
            yAxis:
            {
                type: 'value',
                min: 0,
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                axisLabel: {
                    showMinLabel: true,
                    hideOverlap: true,
                    fontFamily: 'Roboto',
                    margin: 10,
                    color: '#828282'
                }

            },
            series: {
                colorBy: 'data',
                type: "bar",
                data: [],
                itemStyle: {
                    borderRadius: 8
                },
                labelLine: {
                    show: true
                },
                barWidth: 23,
                barMinHeight: 3
            },
        };
    }
}
