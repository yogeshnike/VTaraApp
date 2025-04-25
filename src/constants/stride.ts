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
  
export type StrideProperty = typeof STRIDE_PROPERTIES[number];
