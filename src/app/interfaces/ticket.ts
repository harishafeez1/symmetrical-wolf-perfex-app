export interface Ticket {
    active?: string;
    addedfrom?: string;
    address?: string;
    admin?: number;
    adminread?: number;
    adminreplying?: number;
    assigned?: number
    billing_city?: string;
    billing_country?: string
    billing_state?: string
    billing_street?: string
    billing_zip?: string
    calendar_id?: string
    city?: string
    clientread?: number
    company?: string
    company_id?: string
    contactid?: number
    contract_emails?: string
    country?: string
    credit_note_emails?: string
    customfields?: Array<any>;
    date: Date;
    datecreated?: string
    default_currency?: string
    default_language?: string
    delete_after_import?: number
    department: number;
    department_name: string;
    departmentid: number;
    direction?: string;
    email?: string;
    email_from_header?: number;
    email_signature?: string;
    email_verification_key?: string;
    email_verification_sent_at?: string;
    email_verified_at?: string;
    encryption?: string;
    estimate_emails?: string;
    facebook?: string;
    firstname?: string;
    folder?: string;
    from_name?: string;
    google_auth_secret?: string
    hidefromclient?: number
    host?: string;
    hourly_rate?: string;
    id?: string;
    imap_username?: string;
    invoice_emails?: string;
    is_not_staff?: string;
    is_primary?: string;
    isdefault?: number;
    last_activity?: string;
    last_ip?: string;
    last_login?: string;
    last_password_change?: string;
    lastname?: string;
    lastreply?: Date;
    latitude?: string;
    leadid?: string;
    linkedin?: string;
    longitude?: string;
    media_path_slug?: string;
    message?: string;
    name?: string;
    new_pass_key?: string;
    new_pass_key_requested?: string;
    password?: string;
    phonenumber?: string;
    priority?: number;
    priority_name?: string;
    priorityid?: number;
    profile_image?: string;
    project_emails?: string;
    project_id?: number;
    registration_confirmed?: string;
    role?: string;
    service?: number;
    service_name?: string;
    serviceid?: string;
    shipping_city?: string;
    shipping_country?: string;
    shipping_state?: string;
    shipping_street?: string;
    shipping_zip?: string;
    show_primary_contact?: string;
    skype?: string;
    staff_firstname?: string;
    staff_lastname?: string;
    staffid?: number | null;
    state?: string;
    status?: number;
    status_name?: string;
    statuscolor?: string;
    statusorder?: number;
    stripe_id?: string;
    subject?: string;
    task_emails?: string;
    test_field?: string;
    ticket_email?: string;
    ticket_emails?: string;
    ticket_replies?: Array<any>;
    ticketid?: number;
    ticketkey?: string;
    ticketstatusid?: number;
    title?: string;
    two_factor_auth_code?: string;
    two_factor_auth_code_requested?: string;
    two_factor_auth_enabled?: string;
    user_firstname?: string;
    user_lastname?: string;
    userid?: number;
    vat?: string;
    website?: string;
    zip?: string;
}