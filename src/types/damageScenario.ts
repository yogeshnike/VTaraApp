export interface ImpactValue {
  value: string;
  justification: string;
}

export interface RoadUsers {
  overall: string;
  values: {
    safety: ImpactValue;
    privacy: ImpactValue;
    financial: ImpactValue;
    operational: ImpactValue;
  };
}

export interface Business {
  overall: string;
  values: {
    ip: ImpactValue;
    financial: ImpactValue;
    brand: ImpactValue;
  };
}

export interface DamageScenario {
  id: string;
  name: string;
  justification: string;
  security_property: string;  // Changed from securityProperty
  controlability: string;
  corporate_flag: string;    // Changed from corporateFlag
  road_users: RoadUsers;     // Changed from roadUsers
  business: Business;
  created_at: string;        // Changed from createdAt
  updated_at: string;        // Changed from updatedAt
}

export type DamageScenarioTableMode = 'config' | 'project';