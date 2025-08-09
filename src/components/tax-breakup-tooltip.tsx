import { TaxRate } from '@/services/tax-service';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface TaxBreakupTooltipProps {
  slabs: TaxRate[];
  regime: 'old' | 'new';
}

function formatSlabRange(slab: string): string {
  const [min, max] = slab.split('-').map(Number);
  
  const formatAmount = (amount: number): string => {
    if (amount === Infinity) return 'above';
    
    const formatNumber = (num: number, divisor: number, unit: string): string => {
      const value = num / divisor;
      return value % 1 === 0 ? `${value} ${unit}` : `${value.toFixed(1)} ${unit}`;
    };

    if (amount >= 10000000) return formatNumber(amount, 10000000, 'crore');
    if (amount >= 100000) return formatNumber(amount, 100000, 'lakh');
    return formatNumber(amount, 1000, 'thousand');
  };

  if (min === 0) {
    return `Up to ${formatAmount(max)}`;
  } else if (max === Infinity) {
    return `Above ${formatAmount(min)}`;
  } else {
    return `${formatAmount(min)} to ${formatAmount(max)}`;
  }
}

export function TaxBreakupTooltip({ slabs, regime }: TaxBreakupTooltipProps) {
  const totalTax = slabs.reduce((sum, slab) => sum + (slab.taxAmount || 0), 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="text-emerald-600 dark:text-emerald-400 p-0 h-auto">
          Show Breakup
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h5 className="font-medium text-gray-800 dark:text-gray-200">
            {regime === 'old' ? 'Old Regime Tax Slabs' : 'New Regime Tax Slabs'}
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Slab
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Rate
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {slabs.map((slab, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">
                      {formatSlabRange(slab.slab)}
                    </td>
                    <td className="py-2 px-3 text-sm text-right text-gray-600 dark:text-gray-300">
                      {(slab.rate * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 text-sm text-right text-gray-600 dark:text-gray-300">
                      {slab.taxAmount
                        ? `₹${slab.taxAmount.toLocaleString('en-IN', {
                            maximumFractionDigits: 0,
                          })}`
                        : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-200 dark:border-gray-600 font-medium">
                  <td
                    colSpan={2}
                    className="py-2 px-3 text-sm text-right text-gray-600 dark:text-gray-300"
                  >
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
      </PopoverContent>
    </Popover>
  );
} 