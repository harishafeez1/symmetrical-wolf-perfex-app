export interface AppUpdate {
    current_app_version: string;
    app_maintenance_enabled: boolean;
    app_update_enabled: boolean;

    app_maintenance_title: string;
    app_maintenance_msg: string;

    major_update_title: string;
    major_update_msg: string;
    major_update_btn: string;

    minor_update_title: string;
    minor_update_msg: string;
    minor_update_btn: string;
}
