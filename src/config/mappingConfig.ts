// src/constants/mappingConfig.ts

export interface SystemField {
    key: string;
    label: string;
    required: boolean;
  }
  
  export const SYSTEM_FIELDS: Record<string, SystemField[]> = {
    identity: [
      { key: 'actId', label: 'Activity ID', required: true },
      { key: 'actDesc', label: 'Activity Name/Description', required: true },
      { key: 'actType', label: 'Activity Type', required: false },
      { key: 'keyEvent', label: 'Key Event Tag', required: false },
    ],
    dates: [
      { key: 'esDate', label: 'Early Start Date', required: true },
      { key: 'efDate', label: 'Early Finish Date', required: true },
      { key: 'bsDate', label: 'Baseline Start Date', required: false },
      { key: 'bfDate', label: 'Baseline Finish Date', required: false },
    ],
    resources: [
      { key: 'resId', label: 'Resource ID', required: true },
      { key: 'resLevel', label: 'Resource Units/Level', required: true },
    ],
    metrics: [
      { key: 'origDur', label: 'Original Duration', required: false },
      { key: 'remDur', label: 'Remaining Duration', required: false },
      { key: 'percentComplete', label: '% Complete', required: false },
      { key: 'percentPlanned', label: '% Planned', required: false },
      { key: 'totalFloat', label: 'Total Float', required: false },
    ]
  };