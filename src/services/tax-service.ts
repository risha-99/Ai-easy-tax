export interface TaxRate {
  slab: string;
  maxTaxable: number;
  rate: number;
  taxAmount: number;
}

export interface Deduction {
  id: string;
  name: string;
  description: string;
  maxAmount: number;
  applicableTo: 'old' | 'new';
  readonly?: boolean;
}

export interface TaxBudget {
  year: number;
  deductions: Deduction[];
  oldRegimeTaxes: TaxRate[];
  newRegimeTaxes: TaxRate[];
}

export function calculateTax(taxableAmount: number, taxes: TaxRate[]) {
  let remainingAmount = taxableAmount;

  taxes.forEach((tax) => {
    if (remainingAmount >= tax.maxTaxable) {
      if (tax.maxTaxable === Infinity || tax.maxTaxable > remainingAmount) {
        tax.taxAmount = remainingAmount * tax.rate;
        remainingAmount = 0;
      } else {
        tax.taxAmount = tax.maxTaxable * tax.rate;
        remainingAmount -= tax.maxTaxable;
      }
    } else {
      tax.taxAmount = remainingAmount * tax.rate;
      remainingAmount = 0;
    }
  });

  return taxes;
}

export function calculateTaxBudget(
  taxableAmount: number,
  taxBudget: TaxBudget
): {
  oldRegimeTaxes: TaxRate[];
  newRegimeTaxes: TaxRate[];
} {
  const oldRegimeTaxes = calculateTax(taxableAmount, [
    ...taxBudget.oldRegimeTaxes,
  ]);
  const newRegimeTaxes = calculateTax(taxableAmount, [
    ...taxBudget.newRegimeTaxes,
  ]);

  return {
    oldRegimeTaxes,
    newRegimeTaxes,
  };
}

export const taxBudgets: TaxBudget[] = [
  {
    year: 2024,
    deductions: [
      {
        id: 'standard-deduction',
        name: 'Standard Deduction',
        description: 'Standard deduction for salaried employees',
        maxAmount: 50000,
        applicableTo: 'old',
        readonly: true,
      },
      {
        id: 'hra',
        name: 'HRA Exemption',
        description: 'House Rent Allowance exemption',
        maxAmount: 0, // Actual amount depends on salary, rent paid, and city
        applicableTo: 'old',
      },
      {
        id: 'section80c',
        name: 'Section 80C',
        description: 'Investments in specified instruments',
        maxAmount: 150000,
        applicableTo: 'old',
      },
      {
        id: 'section80d',
        name: 'Section 80D',
        description: 'Health insurance premium',
        maxAmount: 25000,
        applicableTo: 'old',
      },
      {
        id: 'section24b',
        name: 'Section 24(b)',
        description: 'Interest paid on housing loan',
        maxAmount: 200000,
        applicableTo: 'old',
      },
      {
        id: 'section80ccd',
        name: 'Section 80CCD',
        description: 'Employee contribution to NPS',
        maxAmount: 50000,
        applicableTo: 'old',
      },
      {
        id: 'section80ccd1b',
        name: 'Section 80CCD(1B)',
        description: 'Additional contribution to NPS',
        maxAmount: 50000,
        applicableTo: 'old',
      },
      {
        id: 'section80eea',
        name: 'Section 80EEA',
        description: 'Interest paid on home loan for affordable housing',
        maxAmount: 150000,
        applicableTo: 'old',
      },
      {
        id: 'section80eeb',
        name: 'Section 80EEB',
        description: 'Interest paid on loan for purchase of electrical vehicle',
        maxAmount: 150000,
        applicableTo: 'old',
      },
      {
        id: 'standard-deduction-new',
        name: 'Standard Deduction',
        description: 'Standard deduction for new regime',
        maxAmount: 50000,
        applicableTo: 'new',
        readonly: true,
      },
    ],
    oldRegimeTaxes: [
      { slab: '0-250000', maxTaxable: 250000, rate: 0, taxAmount: 0 },
      {
        slab: '250000-500000',
        maxTaxable: 250000,
        rate: 5 / 100,
        taxAmount: 0,
      },
      {
        slab: '500000-1000000',
        maxTaxable: 500000,
        rate: 20 / 100,
        taxAmount: 0,
      },
      {
        slab: '1000000-Infinity',
        maxTaxable: Infinity,
        rate: 30 / 100,
        taxAmount: 0,
      },
    ],

    newRegimeTaxes: [
      { slab: '0-300000', maxTaxable: 300000, rate: 0, taxAmount: 0 },
      {
        slab: '300000-700000',
        maxTaxable: 400000,
        rate: 5 / 100,
        taxAmount: 0,
      },
      {
        slab: '700000-1000000',
        maxTaxable: 300000,
        rate: 10 / 100,
        taxAmount: 0,
      },
      {
        slab: '1000000-1200000',
        maxTaxable: 200000,
        rate: 15 / 100,
        taxAmount: 0,
      },
      {
        slab: '1200000-1500000',
        maxTaxable: 300000,
        rate: 20 / 100,
        taxAmount: 0,
      },
      {
        slab: '1500000-Infinity',
        maxTaxable: Infinity,
        rate: 30 / 100,
        taxAmount: 0,
      },
    ],
  },
  {
    year: 2025,
    deductions: [
      {
        id: 'standard-deduction',
        name: 'Standard Deduction',
        description: 'Standard deduction for salaried employees',
        maxAmount: 50000,
        applicableTo: 'old',
        readonly: true,
      },
      {
        id: 'hra',
        name: 'HRA Exemption',
        description: 'House Rent Allowance exemption',
        maxAmount: 0, // Actual amount depends on salary, rent paid, and city
        applicableTo: 'old',
      },
      {
        id: 'section80c',
        name: 'Section 80C',
        description: 'Investments in specified instruments',
        maxAmount: 150000,
        applicableTo: 'old',
      },
      {
        id: 'section80d',
        name: 'Section 80D',
        description: 'Health insurance premium',
        maxAmount: 50000,
        applicableTo: 'old',
      },
      {
        id: 'section24b',
        name: 'Section 24(b)',
        description: 'Interest paid on housing loan',
        maxAmount: 200000,
        applicableTo: 'old',
      },
      {
        id: 'section80ccd',
        name: 'Section 80CCD',
        description: 'Employee contribution to NPS',
        maxAmount: 50000,
        applicableTo: 'old',
      },
      {
        id: 'section80ccd1b',
        name: 'Section 80CCD(1B)',
        description: 'Additional contribution to NPS',
        maxAmount: 50000,
        applicableTo: 'old',
      },
      {
        id: 'section80eea',
        name: 'Section 80EEA',
        description: 'Interest paid on home loan for affordable housing',
        maxAmount: 150000,
        applicableTo: 'old',
      },
      {
        id: 'section80eeb',
        name: 'Section 80EEB',
        description: 'Interest paid on loan for purchase of electrical vehicle',
        maxAmount: 150000,
        applicableTo: 'old',
      },
      {
        id: 'section80e',
        name: 'Section 80E',
        description: 'Education loan interest',
        maxAmount: 0, // No upper limit
        applicableTo: 'old',
      },
      {
        id: 'section80g',
        name: 'Section 80G',
        description: 'Charitable donations',
        maxAmount: 0, // No upper limit
        applicableTo: 'old',
      },

      {
        id: 'standard-deduction-new',
        name: 'Standard Deduction',
        description: 'Standard deduction for new regime',
        maxAmount: 75000,
        applicableTo: 'new',
        readonly: true,
      },
      {
        id: 'section80ccd2-old',
        name: '80CCD(2)',
        description: 'Employer investment in NPS',
        maxAmount: 0,
        applicableTo: 'old',
      },
      {
        id: 'section80ccd2-new',
        name: '80CCD(2)',
        description: 'Employer investment in NPS',
        maxAmount: 0,
        applicableTo: 'new',
      },
      {
        id: 'epf-employer-new',
        name: 'EPF Employer Contribution',
        description:
          'EPF Employer contribution is a deduction in new tax regime (max 10% of basic + DA)',
        maxAmount: 0,
        applicableTo: 'new',
      },
      {
        id: 'other-old',
        name: 'Other Deductions',
        description: 'Other deductions under old tax regime',
        maxAmount: 0, // No upper limit
        applicableTo: 'old',
      },
    ],
    oldRegimeTaxes: [
      { slab: '0-250000', maxTaxable: 250000, rate: 0, taxAmount: 0 },
      {
        slab: '250000-500000',
        maxTaxable: 250000,
        rate: 5 / 100,
        taxAmount: 0,
      },
      {
        slab: '500000-1000000',
        maxTaxable: 500000,
        rate: 20 / 100,
        taxAmount: 0,
      },
      {
        slab: '1000000-Infinity',
        maxTaxable: Infinity,
        rate: 30 / 100,
        taxAmount: 0,
      },
    ],
    newRegimeTaxes: [
      { slab: '0-400000', maxTaxable: 400000, rate: 0, taxAmount: 0 },
      {
        slab: '400000-800000',
        maxTaxable: 400000,
        rate: 5 / 100,
        taxAmount: 0,
      },
      {
        slab: '800000-1200000',
        maxTaxable: 400000,
        rate: 10 / 100,
        taxAmount: 0,
      },
      {
        slab: '1200000-1600000',
        maxTaxable: 400000,
        rate: 15 / 100,
        taxAmount: 0,
      },
      {
        slab: '1600000-2000000',
        maxTaxable: 400000,
        rate: 20 / 100,
        taxAmount: 0,
      },
      {
        slab: '2000000-2400000',
        maxTaxable: 400000,
        rate: 25 / 100,
        taxAmount: 0,
      },
      {
        slab: '2400000-Infinity',
        maxTaxable: Infinity,
        rate: 30 / 100,
        taxAmount: 0,
      },
    ],
  },
];

export const getTaxBudgetForYear = (year: string): TaxBudget | undefined => {
  return taxBudgets.find((budget) => budget.year === parseInt(year));
};

export const getDeductionsForYear = (year: string): Deduction[] => {
  const budget = getTaxBudgetForYear(year);
  return budget?.deductions || [];
};

export const getLatestYear = (): string => {
  // get the latest year from the taxBudgets array
  const latestYear = taxBudgets.reduce((max, budget) => {
    return budget.year > max ? budget.year : max;
  }, taxBudgets[0].year);
  return latestYear.toString();
};