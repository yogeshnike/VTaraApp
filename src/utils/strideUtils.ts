export // First, update the STRIDE_MAPPING to use full names
const STRIDE_MAPPING: Record<string, {
  name: string;
  defaultScenario: (nodeName: string) => string;
  defaultGoals: string[];
  defaultAttackTrees: string[];
  defaultAttackPath: string;
}> = {
  'Spoofing': {
    name: 'Spoofing',
    defaultScenario: (nodeName: string) => `Spoofing of data of ${nodeName}`,
    defaultGoals: ['Authentication', 'Identity Management'],
    defaultAttackTrees: ['Authentication Bypass', 'Identity Theft'],
    defaultAttackPath: 'Network → Authentication → System'
  },
  'Tampering': {
    name: 'Tampering',
    defaultScenario: (nodeName: string) => `Tampering of ${nodeName} data`,
    defaultGoals: ['Data Integrity', 'Input Validation'],
    defaultAttackTrees: ['Data Modification', 'Man-in-the-Middle'],
    defaultAttackPath: 'Network → Application → Data Store'
  },
  'Repudiation': {
    name: 'Repudiation',
    defaultScenario: (nodeName: string) => `Repudiation of actions on ${nodeName}`,
    defaultGoals: ['Logging', 'Audit Trail'],
    defaultAttackTrees: ['Log Tampering', 'Action Denial'],
    defaultAttackPath: 'User → Action → Logs'
  },
  'Information Disclosure': {
    name: 'Information Disclosure',
    defaultScenario: (nodeName: string) => `Information disclosure of ${nodeName}`,
    defaultGoals: ['Confidentiality', 'Access Control'],
    defaultAttackTrees: ['Data Leakage', 'Unauthorized Access'],
    defaultAttackPath: 'Network → System → Data'
  },
  'Denial of Service': {
    name: 'Denial of Service',
    defaultScenario: (nodeName: string) => `Denial of service to ${nodeName}`,
    defaultGoals: ['Availability', 'Resource Management'],
    defaultAttackTrees: ['Resource Exhaustion', 'Service Flooding'],
    defaultAttackPath: 'Network → Resources → Service'
  },
  'Elevation of Privilege': {
    name: 'Elevation of Privilege',
    defaultScenario: (nodeName: string) => `Elevation of privilege in ${nodeName}`,
    defaultGoals: ['Authorization', 'Access Control'],
    defaultAttackTrees: ['Privilege Escalation', 'Role Manipulation'],
    defaultAttackPath: 'User → Permissions → System'
  }
};

  // Add a debug function to test the mapping
export function testStrideMapping(stride: string, nodeName: string) {
  const mapping = STRIDE_MAPPING[stride as keyof typeof STRIDE_MAPPING];
  console.log('Testing STRIDE mapping:', { stride, mapping, scenario: mapping?.defaultScenario(nodeName) });
  return mapping;
}