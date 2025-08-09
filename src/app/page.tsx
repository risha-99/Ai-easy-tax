'use client';
import ChatUI from '@/components/ChatUI';
import { Header } from '@/components/header';
import { TaxCalculator } from '@/components/tax-calculator';
import { getDeductionsForYear, getLatestYear, TaxRate } from '@/services/tax-service';
import { useForm, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

// Form schema
const formSchema = z.object({
  financialYear: z.string(),
  salary: z.string().optional(),
  businessIncome: z.string().optional(),
  otherIncome: z.string().optional(),
  deductions: z.record(z.string(), z.string()),
});

export interface OnCalculation {
  oldRegimeSlabs: TaxRate[];
  newRegimeSlabs: TaxRate[];
  taxAmount: {
    taxOld: number | null;
    taxNew: number | null;
    totalIncome: number | null;
    totalDeductionsOld: number | null;
    totalDeductionsNew: number | null;
    taxableIncomeOld: number | null;
    taxableIncomeNew: number | null;
  }; 
}

export type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const latestYear = getLatestYear();

  const deductionsForYear = getDeductionsForYear(latestYear);
  const [calculationResult, setCalculationResult] = useState<OnCalculation | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialYear: new Date().getFullYear().toString(),
      salary: '',
      businessIncome: '',
      otherIncome: '',
      deductions: deductionsForYear.reduce((acc, deduction) => {
        acc[deduction.id] = '';
        return acc;
      }, {}), // Initialize deductions with empty strings
    },
  });

  const handleCalculation = (calculation: OnCalculation) => {
    // Handle calculation if needed
    console.log('Calculation result:', calculation);
    setCalculationResult(calculation);
  };

  return (
    <FormProvider {...form}>
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
        <Header />
        <main className='container mx-auto px-4 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Information Section */}
            <div className='space-y-6'>
              <h1 className='text-4xl font-bold text-gray-900 dark:text-white'>
                Welcome to Tax Calculator
              </h1>
              <p className='text-lg text-gray-600 dark:text-gray-300'>
                Our tax calculator helps you estimate your tax liability for
                different financial years. Simply enter your income details and
                deductions to get started.
              </p>
              <ChatUI />
            </div>

            {/* Calculator Section */}
            <TaxCalculator onCalculation={handleCalculation} />
          </div>
        </main>
      </div>
    </FormProvider>
  );
}
