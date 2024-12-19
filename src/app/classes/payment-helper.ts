import { Injectable } from "@angular/core";
import { EChartsOption } from "echarts";

@Injectable({
    providedIn: 'root'
})
export class PaymentHelper {
    primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    mediumColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-medium');

    eChatOptions(): EChartsOption {
        return {
            tooltip: {
                trigger: 'axis',
                confine: true,
                axisPointer: {
                    type: 'shadow',
                }
            },
            legend: {
                bottom: "0%",
                textStyle: {
                    color: this.mediumColor
                }
            },
            grid: {
                top: '3%',
                left: '3%',
                right: '4%',
                bottom: '15%',
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
                interval: 1,
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
            series: [],
        };
    }
}
