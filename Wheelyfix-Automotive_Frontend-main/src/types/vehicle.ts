export type VehicleType = 'car' | 'bike';
export type FuelType = 'petrol' | 'diesel' | 'cng';

interface CarModels {
  petrol: string[];
  diesel: string[];
  cng: string[];
}

interface BikeModels {
  petrol: string[];
}

interface Brand<T> {
  name: string;
  logo: string;
  models: T;
}

interface CarBrands {
  [key: string]: Brand<CarModels>;
}

interface BikeBrands {
  [key: string]: Brand<BikeModels>;
}

interface CarData {
  brands: CarBrands;
}

interface BikeData {
  brands: BikeBrands;
}

export interface VehicleData {
  car: CarData;
  bike: BikeData;
}

export type BrandEntry = [string, Brand<CarModels> | Brand<BikeModels>];
