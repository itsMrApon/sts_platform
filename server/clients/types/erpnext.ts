/**
 * ERPNext-specific types and interfaces
 */

import { BaseConfig, CustomerData, AddressData, PaginationParams } from './common';

export interface ERPNextConfig extends BaseConfig {
  apiKey?: string;
  apiSecret?: string;
}

export interface ERPNextCustomer extends CustomerData {
  customer_name: string;
  customer_type: 'Individual' | 'Company';
  email_id: string;
  mobile_no?: string;
  name: string; // ERPNext document name
}

export interface ERPNextAddress extends AddressData {
  address_title: string;
  address_type: 'Billing' | 'Shipping';
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email_id: string;
  links: Array<{
    link_doctype: 'Customer';
    link_name: string;
  }>;
}

export interface ERPNextItem {
  name: string;
  item_name: string;
  item_code: string;
  item_group: string;
  description?: string;
  is_sales_item: boolean;
  is_purchase_item: boolean;
  is_stock_item: boolean;
  stock_uom: string;
  valuation_rate?: number;
  standard_rate?: number;
}

export interface ERPNextSupplier {
  name: string;
  supplier_name: string;
  supplier_type: 'Individual' | 'Company';
  email_id?: string;
  mobile_no?: string;
  is_transporter: boolean;
}

export interface ERPNextSalesInvoice {
  name: string;
  customer: string;
  posting_date: string;
  due_date: string;
  items: Array<{
    item_code: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
  grand_total: number;
  outstanding_amount: number;
  status: 'Draft' | 'Submitted' | 'Paid' | 'Overdue' | 'Cancelled';
}

export interface ERPNextProject {
  name: string;
  project_name: string;
  status: 'Open' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  expected_start_date?: string;
  expected_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  project_type?: string;
  customer?: string;
}

export interface ERPNextWebhook {
  name: string;
  webhook_doctype: string;
  webhook_docevent: 'after_insert' | 'after_update' | 'after_delete';
  request_url: string;
  is_enabled: boolean;
  request_method?: 'POST' | 'PUT' | 'PATCH';
  request_structure?: string;
  webhook_headers?: Array<{
    key: string;
    value: string;
  }>;
}

export interface ERPNextQueryParams extends PaginationParams {
  fields?: string[];
  filters?: Array<[string, string, string, any]>;
  order_by?: string;
  group_by?: string;
}
