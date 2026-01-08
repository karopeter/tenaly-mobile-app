import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { useRouter } from 'expo-router';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import { AnalyticsData } from '@/app/types/analytics.types';


const SCREEN_WIDTH = Dimensions.get('window').width;


export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const timeRangeOptions = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

   const fetchAnalytics = async () => {
     try {
      setLoading(true);
      if (!apiClient) {
        showErrorToast('API client not initialized');
        return;
      }

      const response = await apiClient.get('/api/analytics/seller/dashboard', {
        params: { timeRange }
      });

      if (response.data.success) {
        setData(response.data.data);
      }
     } catch (error: any) {
       console.error('Failed to fetch analytics:', error);
       showErrorToast(error.response?.data?.message || 'Failed to load analytics');
     } finally {
        setLoading(false);
     }
   };

   const getSelectedLabel = () => {
     return timeRangeOptions.find(opt => opt.value === timeRange)?.label || '30 Days';
   };

  const formatChartData = () => {
    if (!data?.viewsByDay || data.viewsByDay.length === 0) {
      return [];
    }

    const sortedData = [...data.viewsByDay].sort((a, b) => 
      new Date(a._id).getTime() - new Date(b._id).getTime()
    );

    const chartData: any[] = [];
    
    sortedData.forEach((item) => {
      const date = new Date(item._id);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      
      chartData.push(
        {
          value: item.impressions || 0,
          label: label,
          frontColor: '#6B93F6',
          spacing: 2,
        },
        {
          value: item.productViews || 0,
          frontColor: '#4CAF50',
        },
        {
          value: item.profileViews || 0,
          frontColor: '#FF9800',
        }
      );
    });

    return chartData;
  };

   if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
   }
    return (
      <View style={styles.container}>
       {/* Header */}
       <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 24}} />
       </View>

       <ScrollView
         style={styles.scrollView}
         showsVerticalScrollIndicator={false}
         contentContainerStyle={styles.scrollContent}
       >
        {/* Time Range Selector */}
        <View style={styles.metricsHeaderRow}>
          <Text style={styles.metricsTitle}>Key Metrics</Text>

          <View style={{ position: 'relative'}}>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
           <Text style={styles.timeRangeText}>{getSelectedLabel()}</Text>
           <Ionicons
             name={showDropdown ? 'chevron-up' : 'chevron-down'}
             size={20}
             color={colors.darkGray}
            />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdown}>
              {timeRangeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setTimeRange(option.value);
                    setShowDropdown(false);
                  }}>
              <Text
                style={[
                  styles.dropdownItemText,
                  timeRange === option.value && styles.dropdownItemTextActive,
                ]}>
                {option.label}
               </Text>

               {timeRange === option.value && (
                 <Ionicons name="checkmark" size={20} color={colors.blue} />
               )}
              </TouchableOpacity>
              ))}
            </View>
          )}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
           <MetricCard 
             label="Ad Views"
             value={data?.productViews.total || 0}
             subValue={`${data?.productViews.unique || 0} Unique`}
             icon="eye-outline"
             color="#00A8DF"
           />
           <MetricCard 
             label="Ads Sold"
             value={data?.soldAds || 0}
             subValue={`${data?.totalListings || 0} Total`}
             icon="checkmark-circle-outline"
             color="#4CAF50"
           />
          </View>

          <View style={styles.metricsRow}>
            <MetricCard 
              label="Active Views"
              value={data?.totalListings || 0}
              subValue="Live Ads"
              icon="pulse-outline"
              color="#FF9800"
            />
            <MetricCard 
              label="Impressions"
              value={data?.userImpressions || 0}
              subValue="Unique Users"
              icon="people-outline"
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Performance Trends Charts */}
        <View style={styles.chartContainer}>
         <Text style={styles.sectionTitle}>Performance Trends</Text>
         <View style={styles.chartWrapper}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={formatChartData()}
            barWidth={22}
            spacing={24}
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: '#828282', fontSize: 12 }}
            noOfSections={4}
            maxValue={Math.max(...(data?.viewsByDay || []).flatMap(item => [
              item.impressions || 0,
              item.productViews || 0,
              item.profileViews || 0
            ])) + 10}
            isAnimated
            animationDuration={800}
            height={220}
            showVerticalLines={false}
            hideRules={false}
            rulesType='solid'
            rulesColor="#E5E5E5"
          />
         </ScrollView>
         </View>

         {/* Chart Legend */}
         <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6B93F6'}]} />
            <Text style={styles.legendText}>Impressions</Text>
          </View>
          <View style={styles.legendItem}>
           <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
           <Text style={styles.legendText}>Ad Views</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Profile Views</Text>
          </View>
         </View>
        </View>

        {/* Top Performing Ads */}
        <View style={styles.topAdsContainer}>
         <Text style={styles.sectionTitle}>Top performing Ads</Text>

         {/* Table Header */}
         <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Ad</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Impressions</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center'}]}>Ad Views</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Ending Date</Text>
         </View>

         {/* Table Row */}
         {data?.topProducts && data.topProducts.length > 0 ? (
          data.topProducts.map((product, index) => (
            <TouchableOpacity
             key={product._id}
             style={styles.tableRow}
             onPress={() => {
               router.push({
                 pathName: '/protected/ad[adId]',
                 params: { adId: product._id }
               });
             }}
            >
             <View style={styles.adInfo}>
              {product.image ? (
                <Image 
                 source={{ uri: product.image }}
                 style={styles.adImage}
                 resizeMode='cover'
                />
              ): (
                <View style={[styles.adImage, styles.adImagePlaceholder]}>
                   <Ionicons name="image-outline" size={20} color="#CDCDD7" />
                </View>
              )}
              <View style={styles.adDetails}>
                <Text style={styles.adTitle} numberOfLines={1}>
                  {product.title}
                </Text>
                <Text style={styles.adType}>{product.adType}</Text>
              </View>
             </View>

             <Text style={[styles.tableCell, { flex: 1, textAlign: 'center'}]}>
              {product.impressions}
             </Text>
             <Text style={[styles.tableCell, { flex: 1, textAlign: 'center'}]}>
              {product.uniqueImpressions}
             </Text>
             <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontSize: 11 }]}>
               {product.carAd?.createdAt 
                ? new Date(product.carAd.createdAt).toLocaleDateString('en-US', {
                   month: 'short',
                   day: 'numeric'
                })
                : 'N/A'}
             </Text>
            </TouchableOpacity>
          ))
         ): (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color="#CDCDD7" />
            <Text style={styles.emptyStateText}>No ads data available</Text>
            <Text style={styles.emptyStateSubtext}>
              Your ads will appear here once they start getting views
            </Text>
          </View>
         )}
        </View>
       </ScrollView>
      </View>
    );    
}


function MetricCard({
   label, 
  value, 
  subValue, 
  icon, 
  color 
}: {
   label: string; 
  value: number; 
  subValue: string; 
  icon: any; 
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
     <View style={styles.metricHeader}>
      <Text style={styles.metricLabel}>{label}</Text>
     </View>
     <Text style={styles.metricValue}>{value.toLocaleString()}</Text>
     <Text style={styles.metricSubValue}>{subValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  backButton: {
   marginRight: 15,
  },
  headerTitle: {
   fontSize: 18,
   fontWeight: '600',
   color: colors.darkGray,
   fontFamily: 'WorkSans_600SemiBold',
   flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  chartWrapper: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  marginTop: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},
  timeRangeContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    zIndex: 1000,
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray,
  },
  metricsHeaderRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 12,
},

metricsTitle: {
  fontSize: 18,
  fontFamily: 'WorkSans_600SemiBold',
  color: colors.darkGray,
},
  dropdown: {
    position: 'absolute',
    top: 64,
    left: 20,
    right: 20,
    backgroundColor: colors.bg,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray,
  },
  dropdownItemTextActive: {
    color: colors.blue,
    fontWeight: '600',
  },
  metricsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium',
    color: '#767676',
    fontWeight: '500'
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray,
    marginBottom: 4,
  },
  metricSubValue: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: '#828282',
  },
  chartContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'WorkSans_500Medium',
    color: '#828282',
  },
  topAdsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: '#525252',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  adInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  adImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  adDetails: {
    flex: 1,
  },
  adTitle: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray,
    marginBottom: 2,
  },
  adType: {
    fontSize: 11,
    fontFamily: 'WorkSans_400Regular',
    color: '#828282',
    textTransform: 'capitalize',
  },
  tableCell: {
    fontSize: 13,
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: '#828282',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});