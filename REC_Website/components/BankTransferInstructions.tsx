import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, CheckCircle, AlertCircle, Clock, Building2, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export function BankTransferInstructions() {
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = {
    bankName: 'Emirates Development Bank',
    accountName: 'RECTIFY COMMERCIAL BROKERS – L.L.C',
    accountNumber: '607991',
    iban: 'AE528090000000000607991',
    swiftCode: 'EMDVAEAD',
    certificateDate: '07 NOV 2025'
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const CopyButton = ({ text, fieldName, label }: { text: string; fieldName: string; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={() => copyToClipboard(text, fieldName)}
    >
      {copiedField === fieldName ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="ml-1 text-xs">{label}</span>
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-rectify-green" />
          <CardTitle>Bank Transfer Instructions</CardTitle>
        </div>
        <CardDescription>
          Add funds to your account via bank wire transfer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Important Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Funds are manually credited to your account within 1-2 business days after we receive your transfer. 
            Please ensure the transfer name matches your registered account name exactly.
          </AlertDescription>
        </Alert>

        {/* Bank Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Bank Account Details</span>
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-mono text-sm">{bankDetails.bankName}</span>
                <CopyButton text={bankDetails.bankName} fieldName="bankName" label="Copy" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Account Name</label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-mono text-sm break-all">{bankDetails.accountName}</span>
                <CopyButton text={bankDetails.accountName} fieldName="accountName" label="Copy" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Account Number</label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-mono text-sm">{bankDetails.accountNumber}</span>
                <CopyButton text={bankDetails.accountNumber} fieldName="accountNumber" label="Copy" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">IBAN</label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-mono text-sm">{bankDetails.iban}</span>
                <CopyButton text={bankDetails.iban} fieldName="iban" label="Copy" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">SWIFT Code</label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-mono text-sm">{bankDetails.swiftCode}</span>
                <CopyButton text={bankDetails.swiftCode} fieldName="swiftCode" label="Copy" />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-rectify-green" />
            <span>Transfer Instructions</span>
          </h3>
          
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-sm">
              <strong>Name Matching:</strong> The transfer must be made from an account registered in your name (as shown in your RECtify profile). 
              Transfers from third-party accounts will be rejected for security reasons.
            </li>
            <li className="text-sm">
              <strong>Include Reference:</strong> When making the transfer, include your email address ({user?.email || 'your registered email'}) or account ID in the transfer reference/notes field. 
              This helps us identify and credit your account faster.
            </li>
            <li className="text-sm">
              <strong>Processing Time:</strong> After we receive your transfer, funds will be manually credited to your account within <strong>1-2 business days</strong>. 
              You will receive an email notification once the funds have been added.
            </li>
            <li className="text-sm">
              <strong>Minimum Transfer:</strong> Minimum transfer amount is <strong>AED 100</strong>. 
              There is no maximum limit, but transfers over AED 50,000 may require additional verification.
            </li>
            <li className="text-sm">
              <strong>Currency:</strong> Transfers should be made in <strong>AED (UAE Dirham)</strong>. 
              If you transfer in a different currency, it will be converted at the bank's exchange rate.
            </li>
            <li className="text-sm">
              <strong>Verification:</strong> For your first transfer, we may contact you to verify your identity. 
              Please ensure your profile information is up to date.
            </li>
          </ol>
        </div>

        {/* Processing Timeline */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <Clock className="h-5 w-5 text-rectify-blue" />
            <span>Processing Timeline</span>
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rectify-green text-white flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <strong>Day 1:</strong> You initiate the bank transfer
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rectify-green text-white flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <strong>Day 1-2:</strong> Transfer is received by our bank (processing time depends on your bank)
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rectify-blue text-white flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <strong>Day 2-3:</strong> Our team verifies and manually credits your account
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
              <div>
                <strong>Complete:</strong> You receive email notification and funds appear in your wallet
              </div>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Need Help?</strong> If you have questions about your transfer or haven't received your funds after 3 business days, 
            please contact support at <a href="mailto:team@rectifygo.com" className="underline font-semibold">team@rectifygo.com</a> with your transfer reference.
          </AlertDescription>
        </Alert>

        {/* Certificate Note */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            <strong>Bank Certificate:</strong> Certificate issued by Emirates Development Bank on {bankDetails.certificateDate}. 
            Account verified and active.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

