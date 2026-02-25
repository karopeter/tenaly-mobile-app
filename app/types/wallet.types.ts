export interface Transaction {
  _id: string;
  amount: number;
  transactionType: 'credit' | 'debit';
  status: 'pending' | 'success' | 'failed';
  reference: string;
  description: string;
  paymentDate: string;
  createdAt: Date;
}

export interface WalletData {
  walletBalance: number;
  walletTransactions: Transaction[];
}
