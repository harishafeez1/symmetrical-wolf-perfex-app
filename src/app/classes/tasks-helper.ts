import { Injectable } from "@angular/core";

export const STATUS_NOT_STARTED = 1;
export const STATUS_AWAITING_FEEDBACK = 2;
export const STATUS_TESTING = 3;
export const STATUS_IN_PROGRESS = 4;
export const STATUS_COMPLETE = 5;

@Injectable({
    providedIn: 'root'
})
export class TasksHelper {
    get_statuses() {
        let statuses = [
            {
                id: STATUS_NOT_STARTED,
                color: '#989898',
                name: 'task_status_1',
                order: 1,
                filter_default: true,
            },
            {
                id: STATUS_IN_PROGRESS,
                color: '#03A9F4',
                name: 'task_status_4',
                order: 2,
                filter_default: true,
            },
            {
                id: STATUS_TESTING,
                // color: '#2d2d2d',
                color: '#c4bebe',
                name: 'task_status_3',
                order: 3,
                filter_default: true,
            },
            {
                id: STATUS_AWAITING_FEEDBACK,
                color: '#adca65',
                name: 'task_status_2',
                order: 4,
                filter_default: true,
            },
            {
                id: STATUS_COMPLETE,
                color: '#84c529',
                name: 'task_status_5',
                order: 100,
                filter_default: false,
            },
        ];

        statuses.sort(function (a, b) {
            return a.order - b.order;
        });

        return statuses;
    }

    get_task_status_by_id(id: Number) {
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

    get_tasks_priorities() {
        return [
            {
                'id'    : 1,
                'name'  : 'task_priority_low',
                'color' : '#777',

            },
            {
                'id'    : 2,
                'name'  : 'task_priority_medium',
                'color' : '#03a9f4',

            },
            {
                'id'    : 3,
                'name'  : 'task_priority_high',
                'color' : '#ff6f00',
            },
            {
                'id'    : 4,
                'name'  : 'task_priority_urgent',
                'color' : '#fc2d42',
            },
        ];
    }

    /**
     * Format task priority based on passed priority id
     * @param  mixed id
     * @return string
     */
    task_priority(id: any)
    {
        for(let priority of this.get_tasks_priorities()) {
            if (priority.id == id) {
                return priority.name;
            }
        }

        // Not exists?
        return id;
    }

    /**
     * Get and return task priority color
     * @param  mixed id priority id
     * @return string
     */
    task_priority_color(id: any)
    {
        for (let priority of this.get_tasks_priorities()) {
            if (priority.id == id) {
                return priority.color;
            }
        }

        // Not exists?
        return '#333';
    }
}
