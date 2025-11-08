import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentStatusProps {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  amount?: number;
}

const PaymentStatus = ({ status, paymentId, amount }: PaymentStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Paid',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'failed':
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: 'Payment Failed',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'refunded':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Refunded',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'pending':
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Pending Payment',
          variant: 'outline' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={config.className}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
      
      {paymentId && (
        <span className="text-xs text-muted-foreground">
          ID: {paymentId.slice(-8)}
        </span>
      )}
      
      {amount && (
        <span className="text-xs text-muted-foreground">
          ₹{(amount / 100).toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default PaymentStatus;
