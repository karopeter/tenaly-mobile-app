import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  StyleSheet,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';



interface Transaction {
  _id: string;
  amount: number;
  transactionType: 'credit' | 'debit';
  status: 'pending' | 'success' | 'failed';
  reference: string;
  description: string;
  paymentDate: string;
  createdAt: Date;
}

interface WalletData {
  walletBalance: number;
  walletTransactions: Transaction[];
}


export default function WalletScreen() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchWalletData();
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const fetchWalletData = async () => {
    try {
      if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
      }
      setLoading(true);
      const response = await apiClient.get('/api/profile');
      if (response?.data) {
        setWalletData({
          walletBalance: response.data.walletBalance || 0,
          walletTransactions: response.data.walletTransactions || [],
        });
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      showErrorToast("Error, Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePayment = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      showErrorToast("Invalid Amount! Please enter a valid amount");
      return;
    }

    try {
      if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
      }

      const response = await apiClient.post('/api/wallet/topup/initialize', { 
        amount, 
        platform: 'mobile'
      });
      
      const { authorization_url, reference } = response.data;

      if (!authorization_url || !reference) {
        throw new Error("Invalid payment initialization response");
      }

      console.log("Payment initialized with reference:", reference);
      setPaymentReference(reference);
      setShowTopUpModal(false);

      const supported = await Linking.canOpenURL(authorization_url);
      if (!supported) {
        showErrorToast("Cannot open payment page");
        return;
      }

      await Linking.openURL(authorization_url);
      showSuccessToast("Complete your payment in the browser");

      let attempts = 0;
      const maxAttempts = 100; 
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        
        try {
          if (!apiClient) {
            showErrorToast("API client is not initialized");
            return;
          }
          console.log(`Polling attempt ${attempts}/${maxAttempts} for reference:`, reference);
          
          const verifyResponse = await apiClient.get(
            `/api/wallet/top/verify/${reference}`
          );
          
          console.log("Poll response:", verifyResponse.data);
          
          if (verifyResponse?.data?.status === 200 || verifyResponse?.status === 200) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            console.log("Payment verified successfully!");
            showSuccessToast("Wallet topped up successfully!");
            setTopUpAmount('');
            setPaymentReference('');
            
            setTimeout(() => {
              fetchWalletData();
            }, 500);
            
          } else if (verifyResponse?.data?.message?.toLowerCase().includes('not found') || 
                     verifyResponse?.data?.message?.toLowerCase().includes('failed')) {
  
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            showErrorToast("Payment was not successful");
            setPaymentReference('');
          }
          
        } catch (error: any) {
          console.log("Poll error (will retry):", error.response?.status, error.message);
          
          if (attempts >= maxAttempts) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            showErrorToast("Payment verification timed out. Refreshing wallet...");
            setPaymentReference('');
            fetchWalletData(); 
          }
        }
      }, 3000);

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to start payment. Please try again.";
      showErrorToast(errorMessage);
      setShowTopUpModal(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#238E15';
      case 'failed': return '#CB0D0D';
      case 'pending': return '#CAA416';
      default: return '#757575';
    }
  };

  const generateReceiptHTML = (transaction: Transaction) => {
    const fee = transaction.amount * 0.002;
    const statusColor = getStatusColor(transaction.status);
    const statusText = transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1);


    // Get the logo imageURL
    const logoImage = Image.resolveAssetSource(require('../../../assets/images/tenaly-logo.png'))
    
   return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              padding: 40px 20px;
              min-height: 100vh;
            }
            .receipt-container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding: 30px 20px 20px;
              background: white;
            }
            .title {
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 20px;
            }
            .logo-container {
              display: flex;
              justify-content: flex-start;
              margin-bottom: 30px;
            }
            .logo-text {
              font-size: 32px;
              font-weight: 700;
              color: #1a1a1a;
              letter-spacing: -0.5px;
            }
            .logo-accent {
              width: 40px;
              height: 8px;
              background: linear-gradient(90deg, #00A8DF 0%, #1031AA 100%);
              border-radius: 4px;
              margin-bottom: 5px;
            }
            .amount-section {
              text-align: center;
              padding: 20px;
              background: rgba(245, 247, 250, 0.5);
            }
            .amount {
              font-size: 36px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 10px;
            }
            .status {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;
              font-weight: 600;
              color: ${statusColor};
            }
            .status-dot {
              width: 8px;
              height: 8px;
              background: ${statusColor};
              border-radius: 50%;
            }
            .details-section {
              padding: 30px 25px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-size: 14px;
              color: #666;
              font-weight: 400;
            }
            .detail-value {
              font-size: 14px;
              color: #1a1a1a;
              font-weight: 600;
              text-align: right;
              max-width: 60%;
              word-break: break-word;
            }
            .footer {
              text-align: center;
              padding: 25px;
              background: rgba(245, 247, 250, 0.5);
              color: #666;
              font-size: 13px;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .receipt-container {
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="title">Transaction Receipt</div>
              <div class="logo-container">
                <img src="${logoImage.uri}" alt="Tenaly Logo" class="logo-image" />
              </div>
            </div>
            
            <div class="amount-section">
              <div class="amount">₦${transaction.amount.toLocaleString('en-NG')}</div>
              <div class="status">
                <span class="status-dot"></span>
                <span>${statusText}</span>
              </div>
            </div>
            
            <div class="details-section">
              <div class="detail-row">
                <span class="detail-label">Order Amount</span>
                <span class="detail-value">₦${transaction.amount.toLocaleString('en-NG')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fee</span>
                <span class="detail-value">₦${fee.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Type</span>
                <span class="detail-value">${transaction.description}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formatDateTime(transaction.paymentDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID</span>
                <span class="detail-value">${transaction.reference}</span>
              </div>
            </div>
            
            <div class="footer">
              Thank you for choosing Tenaly
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Fixed Download PDF using new FileSystem API
  // Download PDF 
const handleDownloadReceipt = async (transaction: Transaction) => {
  try {
    const html = generateReceiptHTML(transaction);

    // Generate PDF directly
    const { uri } = await Print.printToFileAsync({ 
      html,
      base64: false 
    });

    showSuccessToast("Receipt downloaded successfully!");

    // Share/Open the file directly from temp location
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Open or Share Receipt",
        UTI: "com.adobe.pdf",
      });
    } else {
      showErrorToast("Sharing is not available on this device");
    }
  } catch (error: any) {
    console.error("Download error:", error);
    showErrorToast("Failed to download receipt");
  }
};

  // Share PDF 
  const handleShareReceipt = async (transaction: Transaction) => {
    try {
      const html = generateReceiptHTML(transaction);
      const { uri } = await Print.printToFileAsync({ html });

      if (!(await Sharing.isAvailableAsync())) {
        showErrorToast("Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Share error:", error);
      showErrorToast("Failed to share receipt");
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isCredit = item.transactionType === 'credit';
    const displayAmount = `${item.transactionType === 'credit' ? 'Credit' : 'Debit'}: ${formatCurrency(item.amount)}`;
    const amountColor = isCredit ? '#4CAF50' : '#F44336';

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => setSelectedTransaction(item)}
      >
        <View style={styles.transactionIcon}>
          <Image 
            source={require('../../../assets/images/transaction-icon.png')}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.description}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.paymentDate)}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, {color: amountColor}]}>
            {displayAmount}
          </Text>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTransactionDetail = () => {
    if (!selectedTransaction) return null;

    const fee = selectedTransaction.amount * 0.002;
    const total = selectedTransaction.amount + fee;

    return (
      <Modal
        visible={!!selectedTransaction}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedTransaction(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.detailModal}>
                <View>
                  <Text style={styles.lightMode}>Transaction Details</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedTransaction(null)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.detailHeader}>
                    <View style={styles.detailIcon}>
                      <Image 
                        source={require('../../../assets/images/detail-icon.png')}
                      />
                    </View>
                  <Text style={styles.detailAmount}>{formatCurrency(total)}</Text>
                    <Text style={[styles.successBadge, { color: getStatusColor(selectedTransaction.status) }]}>
                      ● {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Order Amount</Text>
                      <Text style={styles.detailValue}>{formatCurrency(selectedTransaction.amount)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Fee</Text>
                      <Text style={styles.detailValue}>{formatCurrency(fee)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Transaction Type</Text>
                      <Text style={styles.detailValue}>{selectedTransaction.description}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>{formatDateTime(selectedTransaction.paymentDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Transaction ID</Text>
                      <Text style={styles.detailValueSmall} numberOfLines={1}>
                        {selectedTransaction.reference}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() => handleShareReceipt(selectedTransaction)}
                    >
                      <View style={{flexDirection: "row", gap: 10}}>
                        <Image 
                          source={require('../../../assets/images/share-btn.png')}
                        />
                        <Text style={styles.shareButtonText}>Share Receipt</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDownloadReceipt(selectedTransaction)}
                    >
                      <LinearGradient
                        colors={['#00A8DF', '#1031AA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.downloadButton}
                      >
                        <View style={styles.buttonContent}>
                          <Image 
                            source={require('../../../assets/images/download-img.png')}
                          />
                          <Text style={styles.buttonText}>Download Receipt</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  const hasTransactions = walletData && walletData.walletTransactions.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <Text style={styles.headerSubtitle}>
          Top up your wallet and use it to subscribe for Premium Services
        </Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet balance</Text>
        <Text style={styles.balanceAmount}>
          {walletData ? formatCurrency(walletData.walletBalance) : '₦0'}
        </Text>
        <TouchableOpacity
          style={styles.addMoneyButton}
          onPress={() => setShowTopUpModal(true)}
        >
          <Text style={styles.addMoneyText}>
            {hasTransactions ? 'Update Money' : 'Add money'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Transaction Details</Text>

      {!hasTransactions ? (
        <View style={styles.emptyState}>
          <Image 
            source={require('../../../assets/images/walletEmpty.png')}
            style={styles.walletImage}
          />
          <Text style={styles.emptyText}>No transactions made yet</Text>
        </View>
      ) : (
        <FlatList
          data={walletData?.walletTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id || item.reference}
          style={styles.transactionList}
          contentContainerStyle={styles.transactionListContent}
        />
      )}

      <Modal
        visible={showTopUpModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowTopUpModal(false);
          setTopUpAmount('');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.topUpModal}>
                  <Text style={styles.modalTitle}>Top Up Wallet</Text>
                  <Text style={styles.modalSubtitle}>Enter amount to add to your wallet</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>₦</Text>
                    <TextInput
                      value={topUpAmount}
                      onChangeText={setTopUpAmount}
                      placeholder="0.00"
                      keyboardType="numeric"
                      style={styles.input}
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="done"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={handleInitializePayment}
                  >
                    <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowTopUpModal(false);
                      setTopUpAmount('');
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {renderTransactionDetail()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkShadeBlack,
    marginBottom: 5,
    fontFamily: 'WorkSans_700Bold'
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.grey300,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    lineHeight: 18,
  },
  balanceCard: {
    backgroundColor: colors.prikyBlue,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.shadeWhite,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: 'WorkSans_500Medium',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 18,
    color: colors.blueGrey,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    textAlign: 'center',
    marginBottom: 20,
  },
  addMoneyButton: {
    backgroundColor: colors.prikyBlue,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.greyBlue300,
  },
  addMoneyText: {
    color: colors.lightWhite,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  walletImage: {
    width: 82.42, 
    height: 80 
  },
  emptyText: {
    fontSize: 14,
    color: colors.lightGrey,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  transactionList: {
    paddingHorizontal: 20,
  },
  transactionListContent: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.viewGray,
    fontFamily: 'WorkSans_400Regular',
    fontWeight: '400'
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.lightGreenShade,
    fontFamily: 'WorkSans_400Regular'
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topUpModal: {
    backgroundColor: colors.bg,
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    color: '#1F2937',
  },
  proceedButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 15,
  },
  lightMode: {
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
  },
  detailModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successBadge: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailAmount: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.darkShadeBlack,
    textAlign: 'center',
    fontFamily: 'WorkSans_500Medium',
    marginBottom: 24,
  },
  detailSection: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.lightShadeGray,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular'
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray,
  },
  detailValueSmall: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    maxWidth: 180,
    fontFamily: 'WorkSans_500Medium'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  downloadButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    gap: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.bg,
    fontFamily: 'WorkSans_500Medium'
  }
});