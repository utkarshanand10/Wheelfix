export interface VehicleModels {
  [key: string]: string[];
}

export interface Brand {
  name: string;
  logo: string;
  models: VehicleModels;
}

export interface Brands {
  [key: string]: Brand;
}

export interface VehicleType {
  brands: Brands;
}

export interface VehicleData {
  car: VehicleType;
  bike: VehicleType;
}

export type VehicleCategory = 'car' | 'bike';
export type FuelType = 'petrol' | 'diesel' | 'cng';
export type SelectionStep = 'vehicle-type' | 'fuel-type' | 'brand' | 'model';
