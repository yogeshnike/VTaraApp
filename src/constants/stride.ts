export const STRIDE_PROPERTIES = [
    'Spoofing',
    'Tampering',
    'Repudiation',
    'Information Disclosure',
    'Denial of Service',
    'Elevation of Privilege'
  ] as const;
  
  export const STRIDE_LETTERS = {
    'Spoofing': 'S',
    'Tampering': 'T',
    'Repudiation': 'R',
    'Information Disclosure': 'I',
    'Denial of Service': 'D',
    'Elevation of Privilege': 'E'
  } as const;
  

  // Add these types to your existing stride.ts file
export interface StridePropertyData {
  name: string;
  selected: boolean;
  description?: string;  // Optional field for property description
}

export type StridePropertiesJSON = {
  [key in typeof STRIDE_PROPERTIES[number]]: StridePropertyData;
};
export type StrideProperty = typeof STRIDE_PROPERTIES[number];
