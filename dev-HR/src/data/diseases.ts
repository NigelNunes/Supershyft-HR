import type { DiseaseDefinition } from '../types';

export const DISEASES: DiseaseDefinition[] = [
  { code: 'metabolic_syndrome', name: 'Metabolic Syndrome' },
  { code: 'type_2_diabetes', name: 'Type 2 Diabetes' },
  { code: 'hypertension', name: 'Hypertension' },
  { code: 'obesity', name: 'Obesity' },
  { code: 'pcos_pcod', name: 'PCOS/PCOD' },
  { code: 'nafld', name: 'NAFLD' },
  { code: 'cardiac_health', name: 'Cardiac Health' },
  { code: 'thyroid_health', name: 'Thyroid Health' },
  { code: 'dyslipidemia', name: 'Dyslipidemia' },
];

export const OXIDATIVE_STRESS: DiseaseDefinition = {
  code: 'oxidative_stress',
  name: 'Oxidative Stress',
};
