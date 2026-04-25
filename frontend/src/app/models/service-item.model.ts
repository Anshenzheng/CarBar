export interface ServiceItem {
  id?: number;
  serviceName: string;
  serviceCode: string;
  category: ServiceCategory;
  description?: string;
  basePrice: number;
  estimatedDuration?: number;
  status?: string;
  createdAt?: string;
}

export enum ServiceCategory {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  OTHER = 'OTHER'
}

export const ServiceCategoryLabels: Record<ServiceCategory, string> = {
  [ServiceCategory.MAINTENANCE]: '保养',
  [ServiceCategory.REPAIR]: '维修',
  [ServiceCategory.INSPECTION]: '检测',
  [ServiceCategory.OTHER]: '其他'
};
