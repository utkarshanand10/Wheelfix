// Updated vehicle types
type CarBrand = {
  name: string;
  logo: string;
  models: {
    petrol: string[];
    diesel: string[];
    cng: string[];
  };
};

type BikeBrand = {
  name: string;
  logo: string;
  models: {
    petrol: string[];
  };
};

type VehicleData = {
  car: {
    brands: {
      [key: string]: CarBrand;
    };
  };
  bike: {
    brands: {
      [key: string]: BikeBrand;
    };
  };
};

// Vehicle data with proper typing
const vehicleData: VehicleData = {
  car: {
    brands: {
      maruti: {
        name: "Maruti Suzuki",
        logo: "🚗",
        models: {
          petrol: ["Swift", "Baleno", "WagonR", "Alto", "Dzire", "Vitara Brezza", "Fronx", "Ciaz", "Ertiga"],
          diesel: ["Swift", "Baleno", "Dzire", "Vitara Brezza", "S-Cross"],
          cng: ["WagonR", "Alto", "Swift", "Dzire", "Ertiga CNG"],
        },
      },
      hyundai: {
        name: "Hyundai",
        logo: "🚙",
        models: {
          petrol: ["i20", "Creta", "Verna", "Grand i10", "Santro", "Venue", "Aura", "Alcazar"],
          diesel: ["i20", "Creta", "Verna", "Venue", "Alcazar"],
          cng: ["Grand i10 Nios CNG", "Aura CNG", "i10 CNG"],
        },
      },
      tata: {
        name: "Tata",
        logo: "🚘",
        models: {
          petrol: ["Nexon", "Harrier", "Safari", "Altroz", "Tiago", "Punch", "Tigor"],
          diesel: ["Nexon", "Harrier", "Safari", "Altroz"],
          cng: ["Tiago CNG", "Tigor CNG", "Punch CNG", "Altroz CNG"],
        },
      },
      honda: {
        name: "Honda",
        logo: "🚗",
        models: {
          petrol: ["City", "Jazz", "WR-V", "Amaze", "Civic", "Elevate"],
          diesel: ["City", "WR-V", "Amaze"],
          cng: [],
        },
      },
      mahindra: {
        name: "Mahindra",
        logo: "🚙",
        models: {
          petrol: ["XUV300", "Bolero", "Scorpio", "XUV700", "Thar"],
          diesel: ["XUV300", "Bolero", "Scorpio", "XUV700", "Thar"],
          cng: [],
        },
      },
      toyota: {
        name: "Toyota",
        logo: "🚗",
        models: {
          petrol: ["Innova Crysta", "Fortuner", "Glanza", "Urban Cruiser Hyryder", "Camry"],
          diesel: ["Innova Crysta", "Fortuner"],
          cng: ["Glanza CNG"],
        },
      },
      kia: {
        name: "Kia",
        logo: "🚙",
        models: {
          petrol: ["Seltos", "Sonet", "Carens"],
          diesel: ["Seltos", "Sonet", "Carens"],
          cng: [],
        },
      },
      volkswagen: {
        name: "Volkswagen",
        logo: "🚗",
        models: {
          petrol: ["Polo", "Virtus", "Taigun"],
          diesel: [],
          cng: [],
        },
      },
      skoda: {
        name: "Skoda",
        logo: "🚗",
        models: {
          petrol: ["Slavia", "Kushaq", "Superb"],
          diesel: [],
          cng: [],
        },
      },
      renault: {
        name: "Renault",
        logo: "🚗",
        models: {
          petrol: ["Kwid", "Kiger", "Triber"],
          diesel: [],
          cng: ["Kwid CNG"],
        },
      },
      nissan: {
        name: "Nissan",
        logo: "🚙",
        models: {
          petrol: ["Magnite", "Kicks"],
          diesel: [],
          cng: [],
        },
      },
      mg: {
        name: "MG",
        logo: "🚙",
        models: {
          petrol: ["Astor", "Hector"],
          diesel: ["Hector"],
          cng: [],
        },
      },
    }
  },
  bike: {
    brands: {
      hero: {
        name: "Hero MotoCorp",
        logo: "🏍️",
        models: {
          petrol: ["Splendor Plus", "HF Deluxe", "Passion Pro", "Glamour", "Xtreme 160R", "Destini 125", "Xpulse 200"],
        },
      },
      honda: {
        name: "Honda",
        logo: "🏍️",
        models: {
          petrol: ["Activa 6G", "Unicorn", "Hornet 2.0", "Shine 125", "CB350", "Dio"],
        },
      },
      bajaj: {
        name: "Bajaj",
        logo: "🏍️",
        models: {
          petrol: ["Pulsar 150", "Pulsar 220F", "Avenger", "Platina", "Dominar 400", "CT 125X"],
        },
      },
      tvs: {
        name: "TVS",
        logo: "🏍️",
        models: {
          petrol: ["Apache RTR 160", "Apache RTR 200", "Jupiter", "NTorq", "Radeon", "Raider 125"],
        },
      },
      yamaha: {
        name: "Yamaha",
        logo: "🏍️",
        models: {
          petrol: ["FZ-S", "MT-15", "R15 V4", "Fascino", "Ray ZR", "Aerox 155"],
        },
      },
      suzuki: {
        name: "Suzuki",
        logo: "🏍️",
        models: {
          petrol: ["Gixxer", "Access 125", "Avenis", "Burgman Street", "Hayate"],
        },
      },
      royal_enfield: {
        name: "Royal Enfield",
        logo: "🏍️",
        models: {
          petrol: ["Classic 350", "Bullet 350", "Hunter 350", "Meteor 350", "Himalayan"]
        }
      },
      ktm: {
        name: "KTM",
        logo: "🏍️",
        models: {
          petrol: ["Duke 200", "Duke 250", "RC 200", "RC 390"],
        },
      },
      jawa: {
        name: "Jawa",
        logo: "🏍️",
        models: {
          petrol: ["Jawa 42", "Perak", "Forty Two Bobber"],
        },
      },
    }
  }
};

// Helper functions for vehicle data access
const getBrandsForVehicleType = (type: 'car' | 'bike') => {
  return vehicleData[type].brands || {};
};

const getModelsForBrand = (type: 'car' | 'bike', brandKey: string, fuelType?: 'petrol' | 'diesel' | 'cng') => {
  const brand = vehicleData[type].brands[brandKey];
  if (!brand) return [];

  if (type === 'bike') {
    return brand.models.petrol || [];
  }

  return fuelType ? (brand as CarBrand).models[fuelType] || [] : [];
};

// Add the helper functions and export types
export type { VehicleData, CarBrand, BikeBrand };
export { vehicleData, getBrandsForVehicleType, getModelsForBrand };
