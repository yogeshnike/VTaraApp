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

// Convert array of selected properties to JSONB format
export function formatStrideProperties(selectedProperties: string[]): StridePropertiesJSON {
          const strideJson = {} as StridePropertiesJSON;
          STRIDE_PROPERTIES.forEach(property => {
            strideJson[property] = {
              name: property,
              selected: selectedProperties.includes(property),
              description: `${property} threat`
            };
          });
          return strideJson;
}

export type StridePropertiesJSON = {
  [key in typeof STRIDE_PROPERTIES[number]]: StridePropertyData;
};
export type StrideProperty = typeof STRIDE_PROPERTIES[number];
