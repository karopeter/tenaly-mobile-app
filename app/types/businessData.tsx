export interface BusinessData {
  _id: string;
  businessName?: string;
  aboutBusiness?: string;
  location?: string;
  addresses: {
    _id: string;
    address: string;
    deliveryAvailable: boolean;
    deliverySettings?: {
      explanation: string;
      dayFrom: number;
      daysTo: number;
      chargeDelivery: string;
      feeFrom: number;
      feeTo: number;
    };
  }[];
  businessHours?: any[];
  createdAt?: string;
}


export interface DeliveryFormData {
  explanation: string;
  dayFrom: string;
  daysTo: string;
  chargeDelivery: string;
  feeFrom: string;
  feeTo: string;
}


