'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState, useEffect } from 'react';
import {
  getDeductionsForYear,
  Deduction,
  TaxRate,
  getTaxBudgetForYear,
  calculateTax,
} from '@/services/tax-service';
import { Label } from '@/components/ui/label';
import { FinancialYearModal } from './financial-year-modal';
import { TaxBreakupTooltip } from './tax-breakup-tooltip';
import { useFormContext, Controller } from 'react-hook-form';
import { FormValues, OnCalculation } from '@/app/page';

interface TaxCalculatorProps {
  onCalculation?: (calculation: OnCalculation) => void;
}

export function TaxCalculator({ onCalculation }: TaxCalculatorProps) {
  const [taxAmount, setTaxAmount] = useState<{
    old: number | null;
    new: number | null;
    totalIncome: number | null;
    totalDeductionsOld: number | null;
    totalDeductionsNew: number | null;
    taxableIncomeOld: number | null;
    taxableIncomeNew: number | null;
    oldRegimeSlabs: TaxRate[];
    newRegimeSlabs: TaxRate[];
    oldRegimeCess: number | null;
    newRegimeCess: number | null;
  }>({
    old: null,
    new: null,
    totalIncome: null,
    totalDeductionsOld: null,
    totalDeductionsNew: null,
    taxableIncomeOld: null,
    taxableIncomeNew: null,
    oldRegimeSlabs: [],
    newRegimeSlabs: [],
    oldRegimeCess: null,
    newRegimeCess: null,
  });

  const { control, watch, setValue, handleSubmit, getValues, formState } = useFormContext<FormValues>();
  const financialYear = watch('financialYear');

  // Initialize readonly deductions
  useEffect(() => {
    const yearDeductions = getDeductionsForYear(financialYear);
    const readonlyDeductions = yearDeductions.filter((d) => d.readonly);

    const newDeductions = { ...watch('deductions') };
    readonlyDeductions.forEach((deduction) => {
      newDeductions[deduction.id] = deduction.maxAmount.toString();
    });
    setValue('deductions', newDeductions);
  }, [financialYear, setValue, watch]);

  const renderDeductionInput = (deduction: Deduction) => {
    return (
      <div key={deduction.id}>
        <label
          htmlFor={deduction.id}
          className='text-sm font-medium text-gray-700 dark:text-gray-300'
        >
          {deduction.name}
          {deduction.maxAmount > 0 && (
            <span className='text-xs text-gray-500 ml-1'>
              (Max: ₹{deduction.maxAmount.toLocaleString()})
            </span>
          )}
        </label>
        <Controller
          name={`deductions.${deduction.id}`}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type='number'
              value={field.value ?? ''}
              id={deduction.id}
              placeholder={`Enter ${deduction.name}`}
              className='w-full mt-1'
              max={deduction.maxAmount || undefined}
              readOnly={deduction.readonly}
              disabled={deduction.readonly}
            />
          )}
        />
        {deduction.description && (
          <p className='text-xs text-gray-500 mt-1'>{deduction.description}</p>
        )}
      </div>
    );
  };

  const calculateTaxAmount = (data: FormValues) => {
    // Calculate total deductions for old regime
    const totalDeductionsOld = Object.entries(data.deductions)
      .filter(([id, amount]) => {
        const deductionInfo = getDeductionsForYear(financialYear).find(
          (d) => d.id === id
        );
        return deductionInfo?.applicableTo === 'old' && amount !== '';
      })
      .map(([, amount]) => parseFloat(amount || '0'))
      .reduce((sum, amount) => sum + amount, 0);

    // Calculate total deductions for new regime
    const totalDeductionsNew = Object.entries(data.deductions)
      .filter(([id, amount]) => {
        const deductionInfo = getDeductionsForYear(financialYear).find(
          (d) => d.id === id
        );
        return deductionInfo?.applicableTo === 'new' && amount !== '';
      })
      .map(([, amount]) => parseFloat(amount || '0'))
      .reduce((sum, amount) => sum + amount, 0);

    const salaryAmount = parseFloat(data.salary || '0');
    const taxableAmountOld = salaryAmount - totalDeductionsOld;
    const taxableAmountNew = salaryAmount - totalDeductionsNew;

    const taxBudget = getTaxBudgetForYear(financialYear);
    if (!taxBudget) return;

    const oldRegimeTaxes = calculateTax(taxableAmountOld, [
      ...taxBudget.oldRegimeTaxes,
    ]);

    const newRegimeTaxes = calculateTax(taxableAmountNew, [
      ...taxBudget.newRegimeTaxes,
    ]);

    const oldRegimeTotalTax = oldRegimeTaxes.reduce(
      (sum, tax) => sum + tax.taxAmount,
      0
    );
    const newRegimeTotalTax = newRegimeTaxes.reduce(
      (sum, tax) => sum + tax.taxAmount,
      0
    );

    // Calculate health and education cess (4%)
    const oldRegimeCess = oldRegimeTotalTax * 0.04;
    const newRegimeCess = newRegimeTotalTax * 0.04;

    setTaxAmount({
      old: oldRegimeTotalTax,
      new: newRegimeTotalTax,
      totalIncome: salaryAmount,
      totalDeductionsOld: totalDeductionsOld,
      totalDeductionsNew: totalDeductionsNew,
      taxableIncomeOld: taxableAmountOld,
      taxableIncomeNew: taxableAmountNew,
      oldRegimeSlabs: oldRegimeTaxes,
      newRegimeSlabs: newRegimeTaxes,
      oldRegimeCess,
      newRegimeCess,
    });

    // Pass calculation to parent
    onCalculation?.({
      oldRegimeSlabs: oldRegimeTaxes,
      newRegimeSlabs: newRegimeTaxes,
      taxAmount: {
        taxOld: oldRegimeTotalTax,
        taxNew: newRegimeTotalTax,
        totalIncome: salaryAmount,
        totalDeductionsOld: totalDeductionsOld,
        totalDeductionsNew: totalDeductionsNew,
        taxableIncomeOld: taxableAmountOld,
        taxableIncomeNew: taxableAmountNew,
      }
    });
  };

  const [showYearChangeModal, setShowYearChangeModal] = useState(false);
  const [pendingYearChange, setPendingYearChange] = useState<string>('');

  const handleFinancialYearChange = (value: string) => {
    setPendingYearChange(value);
    setShowYearChangeModal(true);
  };

  const handleKeepData = () => {
    setValue('financialYear', pendingYearChange);
    setShowYearChangeModal(false);
    calculateTaxAmount(watch()); // Recalculate with new year's tax rates
  };

  const handleClearData = () => {
    setValue('financialYear', pendingYearChange);
    setShowYearChangeModal(false);

    // Reset form values
    setValue('salary', '');
    setValue('businessIncome', '');
    setValue('otherIncome', '');
    setValue('deductions', {});
    setTaxAmount({
      old: null,
      new: null,
      totalIncome: null,
      totalDeductionsOld: null,
      totalDeductionsNew: null,
      taxableIncomeOld: null,
      taxableIncomeNew: null,
      oldRegimeSlabs: [],
      newRegimeSlabs: [],
      oldRegimeCess: null,
      newRegimeCess: null,
    });
  };

  return (
    <form
      className='bg-white dark:bg-gray-800 h-[855px] rounded-lg shadow-lg p-6 ring-1 ring-emerald-500/20 dark:ring-emerald-500/20 overflow-y-scroll'
      onSubmit={handleSubmit(calculateTaxAmount)}
    >
      <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
        Tax Calculator
      </h2>

      {/* Financial Year Selection */}
      <div className='mb-6'>
        <Label htmlFor='financialYear'>Financial Year</Label>
        <Controller
          name='financialYear'
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={handleFinancialYearChange}>
              <SelectTrigger id='financialYear' className='w-full mt-1'>
                <SelectValue placeholder='Select financial year' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='2024'>2024-25</SelectItem>
                <SelectItem value='2025'>2025-26</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Accordion type='single' collapsible className='w-full'>
        {/* 1. Income Sources Section */}
        <AccordionItem value='income-sources'>
          <AccordionTrigger className='text-lg font-semibold text-gray-900 dark:text-white cursor-pointer'>
            1. Income Sources
          </AccordionTrigger>
          <AccordionContent>
            <div className='space-y-4 pt-4'>
              <div>
                <label
                  htmlFor='salary'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Salary Income
                </label>
                <Controller
                  name='salary'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id='salary'
                      type='number'
                      placeholder='Enter salary income'
                      className='w-full mt-1'
                    />
                  )}
                />
              </div>
              <div>
                <label
                  htmlFor='business-income'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Business Income
                </label>
                <Controller
                  name='businessIncome'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id='business-income'
                      type='number'
                      placeholder='Enter business income'
                      className='w-full mt-1'
                    />
                  )}
                />
              </div>
              <div>
                <label
                  htmlFor='other-income'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Other Income
                </label>
                <Controller
                  name='otherIncome'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id='other-income'
                      type='number'
                      placeholder='Enter other income'
                      className='w-full mt-1'
                    />
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Deductions & Exemptions Section */}
        <AccordionItem value='deductions'>
          <AccordionTrigger className='text-lg font-semibold text-gray-900 dark:text-white cursor-pointer'>
            2. Deductions & Exemptions
          </AccordionTrigger>
          <AccordionContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4'>
              {/* Old Regime Deductions */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Old Regime Deductions
                </h3>
                {getDeductionsForYear(financialYear)
                  .filter((d) => d.applicableTo === 'old')
                  .map(renderDeductionInput)}
              </div>

              {/* New Regime Deductions */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  New Regime Deductions
                </h3>
                {getDeductionsForYear(financialYear)
                  .filter((d) => d.applicableTo === 'new')
                  .map(renderDeductionInput)}
                <div className='text-sm text-gray-500 dark:text-gray-400 italic'>
                  Note: New regime has limited deductions available. Most
                  deductions are not applicable under the new tax regime.
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Calculate Button */}
      <div className='mt-6'>
        <Button
          type='submit'
          className='w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 transition-colors duration-200'
        >
          Calculate Tax
        </Button>
      </div>

      {/* Tax Calculation Result */}
      {(taxAmount.old !== null || taxAmount.new !== null) && (
        <div className='mt-6 p-4 border rounded-lg'>
          <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
            3. Income Tax Calculation
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Old Regime */}
            <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'>
              <h3 className='font-semibold text-lg text-gray-900 dark:text-white'>
                Old Regime Tax
              </h3>
              <div className='mt-4 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Total Income:
                  </span>
                  <span className='font-medium'>
                    ₹
                    {taxAmount.totalIncome?.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Total Deductions:
                  </span>
                  <span className='font-medium'>
                    ₹
                    {taxAmount.totalDeductionsOld?.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Taxable Income:
                  </span>
                  <span className='font-medium'>
                    ₹
                    {taxAmount.taxableIncomeOld?.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between mt-4'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Tax Amount:
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                      ₹
                      {taxAmount.old?.toLocaleString('en-IN', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <TaxBreakupTooltip
                      slabs={taxAmount.oldRegimeSlabs}
                      regime='old'
                    />
                  </div>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    Health & Education Cess (4%):
                  </span>
                  <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                    ₹
                    {taxAmount.oldRegimeCess?.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between mt-2 border-t pt-2'>
                  <span className='text-gray-600 dark:text-gray-300 font-semibold'>
                    Total Tax Payable:
                  </span>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                    ₹
                    {(
                      (taxAmount.old || 0) + (taxAmount.oldRegimeCess || 0)
                    ).toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* New Regime */}
            <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'>
              <h3 className='font-semibold text-lg text-gray-900 dark:text-white'>
                New Regime Tax
              </h3>
              <div className='mt-4 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Total Income:
                  </span>
                  <span className='font-medium'>
                    ₹
                    {taxAmount.totalIncome?.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Total Deductions:
                  </span>
                  <span className='font-medium'>
                    ₹
                    {taxAmount.totalDeductionsNew?.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Taxable Income:
                  </span>
                  <span className='font-medium'>
                    ₹
                    {taxAmount.taxableIncomeNew?.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between mt-4'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Tax Amount:
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                      ₹
                      {taxAmount.new?.toLocaleString('en-IN', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <TaxBreakupTooltip
                      slabs={taxAmount.newRegimeSlabs}
                      regime='new'
                    />
                  </div>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    Health & Education Cess (4%):
                  </span>
                  <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                    ₹
                    {taxAmount.newRegimeCess?.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between mt-2 border-t pt-2'>
                  <span className='text-gray-600 dark:text-gray-300 font-semibold'>
                    Total Tax Payable:
                  </span>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                    ₹
                    {(
                      (taxAmount.new || 0) + (taxAmount.newRegimeCess || 0)
                    ).toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <FinancialYearModal
        isOpen={showYearChangeModal}
        onClose={() => setShowYearChangeModal(false)}
        onKeepData={handleKeepData}
        onClearData={handleClearData}
        newYear={pendingYearChange}
      />
    </form>
  );
}
