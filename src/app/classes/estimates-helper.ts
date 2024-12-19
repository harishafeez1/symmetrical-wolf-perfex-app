import { Injectable } from "@angular/core";
import { EChartsOption } from "echarts";

export const STATUS_DRAFT = 1;
export const STATUS_SENT = 2;
export const STATUS_DECLINED = 3;
export const STATUS_ACCEPTED = 4;
export const STATUS_EXPIRED = 5;
@Injectable({
    providedIn: 'root'
})
export class EstimatesHelper {
    mediumColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-medium');
    ionItemBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-item-border-color');
    
    get_statuses()
    {
        return [
            1,
            2,
            5,
            3,
            4,
        ];
    }
    get_statuses_list(){
        return [
            {id: 1, name: 'estimate_status_draft'},
            {id: 2, name: 'estimate_status_sent'},
            {id: 3, name: 'estimate_status_declined'},
            {id: 4, name: 'estimate_status_accepted'},
            {id: 5, name: 'estimate_status_expired'}
        ]
    }

    format_estimate_status(status, classes = '', label = true)
    {
        let label_class = this.estimate_status_color_class(status);
        status      = this.estimate_status_by_id(status);
        if (label == true) {
            return 'list_status estimate_' + label_class;
        }

        return status;
    }
  
    estimate_status_by_id(id)
    {
        let status = '';
        if (id == 1) {
            status = 'estimate_status_draft';
        } else if (id == 2) {
            status = 'estimate_status_sent';
        } else if (id == 3) {
            status = 'estimate_status_declined';
        } else if (id == 4) {
            status = 'estimate_status_accepted';
        } else if (id == 5) {
            // status 5
            status = 'estimate_status_expired';
        } else {
            if (isNaN(id)) {
                if (id == 'not_sent') {
                    status = 'not_sent_indicator';
                }
            }
        }
        return status;
    }

    estimate_status_color_class(id, replace_default_by_muted = false)
    {
        let class_name = '';
        if (id == 1) {
            class_name = 'default';
            if (replace_default_by_muted == true) {
                class_name = 'muted';
            }
        } else if (id == 2) {
            class_name = 'info';
        } else if (id == 3) {
            class_name = 'danger';
        } else if (id == 4) {
            class_name = 'success';
        } else if (id == 5) {
            // status 5
            class_name = 'warning';
        } else {
            if (isNaN(id)) {
                if (id == 'not_sent') {
                    class_name = 'default';
                    if (replace_default_by_muted == true) {
                        class_name = 'muted';
                    }
                }
            }
        }

        return class_name;
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
