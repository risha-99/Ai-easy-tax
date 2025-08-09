import { getTaxBudgetForYear } from '@/services/tax-service';
import { TaxRate } from '@/services/tax-service';

interface TaxSlabsProps {
  financialYear: string;
  currentCalculation?: {
    oldRegimeSlabs: TaxRate[];
    newRegimeSlabs: TaxRate[];
  };
}

export function TaxSlabs({ financialYear, currentCalculation }: TaxSlabsProps) {
  const currentYear = parseInt(financialYear);
  const taxBudget = getTaxBudgetForYear(financialYear);

  if (!taxBudget) {
    return (
      <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'>
        <p className='text-red-500 dark:text-red-400'>No tax data available for the selected year.</p>
      </div>
    );
  }

  const renderTaxTable = (slabs: TaxRate[], title: string) => {
    const totalTax = slabs.reduce((sum, slab) => sum + (slab.taxAmount || 0), 0);
    
    return (
      <div className="space-y-4">
        <h5 className='font-medium text-gray-800 dark:text-gray-200'>{title}</h5>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Slab</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Rate</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              {slabs.map((slab, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">{slab.slab}</td>
                  <td className="py-2 px-3 text-sm text-right text-gray-600 dark:text-gray-300">
                    {(slab.rate * 100).toFixed(0)}%
                  </td>
                  <td className="py-2 px-3 text-sm text-right text-gray-600 dark:text-gray-300">
                    {slab.taxAmount ? `₹${slab.taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '-'}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-gray-200 dark:border-gray-600 font-medium">
                <td colSpan={2} className="py-2 px-3 text-sm text-right text-gray-600 dark:text-gray-300">
                  Total Tax:
                </td>
                <td className="py-2 px-3 text-sm text-right text-emerald-600 dark:text-emerald-400">
                  ₹{totalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'>
      <h4 className='font-semibold text-gray-900 dark:text-white mb-4'>
        Budget Year: {financialYear}-{(currentYear + 1).toString().slice(-2)}
      </h4>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {renderTaxTable(
          currentCalculation?.oldRegimeSlabs || taxBudget.oldRegimeTaxes,
          'Old Regime Tax Slabs'
        )}
        {renderTaxTable(
          currentCalculation?.newRegimeSlabs || taxBudget.newRegimeTaxes,
          'New Regime Tax Slabs'
        )}
      </div>
    </div>
  );
} 