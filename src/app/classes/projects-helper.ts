import { Injectable } from "@angular/core";
import { EChartsOption } from "echarts";

export const STATUS_NOT_STARTED = 1;
export const STATUS_IN_PROGRESS = 2;
export const STATUS_ON_HOLD = 3;
export const STATUS_CANCELLED = 4;
export const STATUS_FINISHED = 5;

@Injectable({
    providedIn: 'root'
})
export class ProjectsHelper {
    primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    mediumColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-medium');

    get_project_statuses() {
        let statuses = [{
            'id': 1,
            'color': '#989898',
            'name': 'project_status_1',
            'order': 1,
            'filter_default': true,
        },
        {
            'id': 2,
            'color': '#03a9f4',
            'name': 'project_status_2',
            'order': 2,
            'filter_default': true,
        },
        {
            'id': 3,
            'color': '#ff6f00',
            'name': 'project_status_3',
            'order': 3,
            'filter_default': true,
        },
        {
            'id': 4,
            'color': '#84c529',
            'name': 'project_status_5',
            'order': 100,
            'filter_default': false,
        },
        {
            'id': 5,
            'color': '#16a34a',
            'name': 'project_status_4',
            'order': 4,
            'filter_default': false,
        }];

        statuses.sort(function (a, b) {
            return a.order - b.order;
        });

        return statuses;
    }

    get_project_status_by_id(id: Number) {
        const statuses = this.get_project_statuses();

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

    get_project_tabs_admin() {
        return [
            {
                'slug': 'project_overview',
                'name': 'project_overview'
            },
            {
                'slug': 'project_tasks',
                'name': 'tasks'
            },
            {
                'slug': 'project_timesheets',
                'name': 'project_timesheets'
            },
            {
                'slug': 'project_milestones',
                'name': 'project_milestones'
            },
            {
                'slug': 'project_files',
                'name': 'project_files'
            },
            {
                'slug': 'project_discussions',
                'name': 'project_discussions'
            },
            {
                'slug': 'project_gantt',
                'name': 'project_gant'
            },
            {
                'slug': 'project_tickets',
                'name': 'project_tickets'
            },
            {
                'slug': 'project_contracts',
                'name': 'contracts'
            },
            {
                'slug': 'project_proposals',
                'name': 'proposals'
            },
            {
                'slug': 'project_invoices',
                'name': 'invoices'
            },
            {
                'slug': 'project_estimates',
                'name': 'estimates'
            },
            {
                'slug': 'project_expenses',
                'name': 'expenses'
            },
            {
                'slug': 'project_credit_notes',
                'name': 'credit_notes'
            },
            {
                'slug': 'project_subscriptions',
                'name': 'subscriptions'
            },
            {
                'slug': 'project_notes',
                'name': 'notes'
            },
            {
                'slug': 'project_activity',
                'name': 'project_activity'
            }
        ];
    }

    get_project_tab_by_slug(slug: string) {
        for (const tab of this.get_project_tabs_admin()) {
            if (tab.slug == slug) {
                return tab;
            }
        }
        return {
            name: '',
            slug: ''
        }
    }

    decimalToHM(decimal: any) {
        var hrs = parseInt(decimal);
        var min = Math.round((Number(decimal) - hrs) * 60);
        // console.log(decimal, min);
        return (hrs < 10 ? "0" + hrs : hrs) + ':' + (min < 10 ? "0" + min : min);
    }

    eChatOptions(): EChartsOption {
        return {
            legend: {
                bottom: "0%",
                textStyle: {
                    color: this.mediumColor
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                confine: true,
                formatter: (items) => {
                    // console.log(items);
                    let itemTooltip = items[0].name;
                    for (const item of items) {
                        itemTooltip += `<br>${item.marker} ${this.decimalToHM(item.value)}`;
                    }
                    return itemTooltip;
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
                    color: '#828282',
                    rotate: 30
                }
            },
            yAxis: [
                {
                    type: 'value',
                    min: 0,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                    axisLabel: {
                        fontFamily: 'Roboto',
                        margin: 10,
                        color: '#828282',
                        showMinLabel: true,
                        hideOverlap: true,
                        formatter: (item) => {
                            return this.decimalToHM(item);
                        }
                    }
                },
            ],
            series: [],
        };
    }
}
