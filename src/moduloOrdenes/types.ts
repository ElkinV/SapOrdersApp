export interface SalesOrder {
  id?: number;
  customerName: string;
  cardCode: string;
  items: Item[];
  total: number;
  date: string;
  comments: string;
  user: string;
  docNum?: number;
  series: number;
  docStatus: string;
}

export interface Customer {
  id: string;
  name: string;
  priceList: number;
  margen: string;
}

export interface Item {
  itemCode: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  warehouse?: string;
}

export interface OrderDetails {
  cardName: string;
  itemCode: string;
  description: string;
  quantity: number;
  price: number;
  margen: number;
  total: number;
  vence: string;
  venceMes: string;
  series: string;
  totalAntesDeImpuestos: number;
  impuesto: string;
  totalOrdn: number;
  direccion: string;
  email: string;
  vendedor: string;
  nit:string;
  telefono: string;
  u_name:string;
  comments: string;
  docNum: number;
  docDate: string;
  cum: string;
  regInvima: string;
  IVA: number;
  formaDePago:string;
  vigenciaOrdr: number;

}

export interface UserCredentials {
  username: string;
  claveWeb: string;
}
