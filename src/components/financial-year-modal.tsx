import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FinancialYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeepData: () => void;
  onClearData: () => void;
  newYear: string;
}

export function FinancialYearModal({
  isOpen,
  onClose,
  onKeepData,
  onClearData,
  newYear,
}: FinancialYearModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch Financial Year</DialogTitle>
          <DialogDescription>
            You are switching to financial year {newYear}-{(parseInt(newYear) + 1).toString().slice(-2)}. 
            Would you like to keep your current data or start fresh?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onKeepData}
            className="flex-1"
          >
            Keep Data
          </Button>
          <Button
            variant="destructive"
            onClick={onClearData}
            className="flex-1"
          >
            Clear All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 