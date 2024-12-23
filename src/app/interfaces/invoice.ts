import { Customer } from "./customer";

export interface Invoice {
    clientid: number;
    status: number;
    number: number;
    invoice_number?: string;
    date: Date;
    duedate?: Date;
    cancel_overdue_reminders?: number;
    recurring?: number;
    repeat_every_custom?: number;
    repeat_type_custom?: string;
    show_quantity_as?: string;
    currency: number;
    newitems?: Array<any>;
    items?: Array<any>;
    subtotal: string;
    total: string;
    billing_street?: string;
    billing_city?: string;
    billing_state?: string;
    billing_zip?: string;
    billing_country?: string;
    shipping_street?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_zip?: string;
    shipping_country?: string;
    tags?: string;
    sale_agent?: string;
    adminnote?: string;
    clientnote?: string;
    terms?: string;
    discount_type?: string;
    discount_percent?: number;
    discount_total?: any;
    allowed_payment_modes?: Array<any>;
    adjustment?: number;
    project_name?: string;
    project_id?: number;
    client?: Customer;
    project_data: any;
    cycles?: number,
    thousand_separator?: string,
    decimal_separator?: string,
    symbol?: string,
    include_shipping?: any,
    show_shipping_on_invoice?: any,
    prefix?: any
}
