export interface Car {
  id?: number;
  customerId: number;
  licensePlate: string;
  vin?: string;
  brandId?: number;
  brandName?: string;
  model: string;
  year?: number;
  color?: string;
  mileage?: number;
  engineNumber?: string;
  lastMaintenanceDate?: string;
  status?: CarStatus;
  createdAt?: string;
}

export enum CarStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SCRAPPED = 'SCRAPPED'
}
