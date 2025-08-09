# TODOs for Tax Calculator Project

## 1. Financial Years Selection
- **Current State**: Hardcoded in `tax-calculator.tsx`.
- **Improvement**: Generate options from available tax budgets.

## 2. HRA Calculation
- **Current State**: Hardcoded to 0 with a comment.
- **Improvement**: Add fields for basic salary, HRA received, rent paid, and city. Implement HRA calculation logic.

## 3. EPF Employer Contribution
- **Current State**: Hardcoded to 0.
- **Improvement**: Add fields for basic salary and DA. Implement automatic calculation of EPF employer contribution.

## 4. Tax Calculation Enhancement
- **Current State**: Basic tax calculation.
- **Improvements**:
  - Add support for surcharge based on income slabs.
  - Add health and education cess calculation.
  - Add tax rebate under section 87A for lower income.

## 5. Dynamic Section 80D Limits
- **Current State**: Hardcoded limits.
- **Improvement**: Vary limits based on age of the insured and coverage.

## 6. Configuration-Driven Approach
- **Current State**: Constants scattered in the code.
- **Improvement**: Move all constants to a configuration file.

## 7. Income Sources Enhancement
- **Current State**: Limited income sources.
- **Improvements**:
  - Add interest income with TDS.
  - Add capital gains (short-term and long-term).
  - Add rental income with standard deduction.
  - Add professional income with presumptive taxation options.

## 8. Deductions Enhancement
- **Current State**: Limited deductions.
- **Improvements**:
  - Add support for Section 80CCD(1B), Section 80EEA, Section 80EEB, and Section 80TTB.

## 9. User Preferences
- **Current State**: No user preferences.
- **Improvements**:
  - Add ability to save calculations for future reference.
  - Add ability to compare multiple scenarios.
  - Add ability to set default values for recurring calculations.

## 10. Validation and Error Handling
- **Current State**: Basic validation.
- **Improvements**:
  - Add comprehensive validation for maximum deduction limits, age-based eligibility, income source dependencies, negative values, and invalid combinations.

## Sample Implementation for HRA Calculation
```typescript
// src/services/tax-service.ts

interface HRADetails {
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  city: string;
}

export function calculateHRAExemption(details: HRADetails): number {
  const { basicSalary, hraReceived, rentPaid, city } = details;
  const cityRate = TAX_CONFIG.METRO_CITIES.includes(city.toUpperCase()) 
    ? TAX_CONFIG.HRA_METRO_RATE 
    : TAX_CONFIG.HRA_NON_METRO_RATE;

  const exemption = Math.min(
    hraReceived,
    rentPaid - (0.1 * basicSalary),
    basicSalary * cityRate
  );

  return Math.max(0, exemption);
}
```
```