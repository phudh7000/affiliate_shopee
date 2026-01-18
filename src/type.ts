export interface IFanpage {
  page_id: string;
  page_name: string;
  page_link: string;
  page_access_token: string;
  group: string;
  status: 'live' | 'die' | 'stopped';
  last_product_id: number;
}

export type ProductStatus = 'stopped' | 'pending' | 'success' | 'failed';

export interface IProduct {
  product_id: string;
  product_name: string;
  fanpage: string;
  product_link: string;
  description: string;
  link_affiliate: string;
  status: ProductStatus
  updated_at: string;
}


export interface IGroup {
  group_id: string;
  group_name: string;
  group_link: string;
  status: string;
}