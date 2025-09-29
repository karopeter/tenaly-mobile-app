import React from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity
 } from 'react-native';
import CarCard from './CarCard';
import { CombinedAd } from '../types/marketplace';
import { colors } from '../constants/theme';

const PADDING = 16;
const ITEM_SPACE = 12;
const screenWidth = 375;

interface CarListingSectionProps {
  title: string;
  ads: CombinedAd[];
  onAdPress: (ad: CombinedAd) => void;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

const CarListingSection: React.FC<CarListingSectionProps> = ({ 
  title, 
  ads, 
  onAdPress, 
  onViewAll,
  showViewAll = true 
}) => {
  if (ads.length === 0) return null;

  // Helper function to format price
  const formatPrice = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
    if (numAmount >= 1000000) {
      return `₦${(numAmount / 1000000).toFixed(1)}M`;
    } else if (numAmount >= 1000) {
      return `₦${(numAmount / 1000).toFixed(0)}K`;
    }
    return `₦${numAmount.toLocaleString()}`;
  };

  // Helper function to get the correct title
  const getTitle = (ad: CombinedAd): string => {
    if (ad.vehicleAd) {
      return `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model}`.trim();
    }
    if (ad.propertyAd) {
      return ad.propertyAd.propertyName || 'Property';
    }
    return 'Ad';
  };

  // Helper function to get the correct price
  const getPrice = (ad: CombinedAd): string => {
    if (ad.vehicleAd?.amount) {
      return formatPrice(ad.vehicleAd.amount);
    }
    if (ad.propertyAd?.amount) {
      return formatPrice(ad.propertyAd.amount);
    }
    return 'Price on request';
  };

  // Helper function to get the correct plan
  const getPlan = (ad: CombinedAd): string => {
    if (ad.vehicleAd?.plan) {
      return ad.vehicleAd.plan;
    }
    if (ad.propertyAd?.plan) {
      return ad.propertyAd.plan;
    }
    return 'free';
  };

  // Helper function to get the correct description
  const getDescription = (ad: CombinedAd): string => {
    if (ad.vehicleAd?.description) {
      return ad.vehicleAd.description;
    }
    if (ad.propertyAd?.description) {
      return ad.propertyAd.description;
    }
    return 'No description available';
  };

  // Take only first 4 items for display (2 rows of 2)
  const displayAds = ads.slice(0, 4);
  const pairedAds = [];
  for (let i = 0; i < displayAds.length; i += 2) {
    pairedAds.push(displayAds.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Cards Grid */}
      <View style={styles.gridContainer}>
        {pairedAds.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.rowContainer}>
            {row.map((ad, index) => (
              <View 
                key={ad.adId} 
                style={[
                  styles.cardWrapper, 
                  { marginRight: index === 0 ? ITEM_SPACE : 0 }
                ]}
              >
                <CarCard
                  id={ad.adId}
                  title={getTitle(ad)}
                  price={getPrice(ad)}
                  year={ad.vehicleAd?.year}
                  color={ad.vehicleAd?.color}
                  description={getDescription(ad)}
                  location={ad.carAd.location}
                  tags={[ad.carAd.category]}
                  image={ad.carAd.vehicleImage?.[0] || ad.carAd.propertyImage?.[0]}
                  businessName={ad.business.businessName}
                  profileImage={ad.business.profileImage}
                  isVerified={ad.business.isVerified}
                  plan={getPlan(ad) as 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free'}
                  transmission={ad.vehicleAd?.transmission}
                  carKeyFeatures={ad.vehicleAd?.carKeyFeatures}
                  carType={ad.vehicleAd?.carType}
                   propertyFacilities={ad.propertyAd?.propertyFacilities}
                    propertyType={ad.propertyAd?.propertyType}
                   propertyDuration={ad.propertyAd?.propertyDuration}
                  ownershipStatus={ad.propertyAd?.ownershipStatus}
                    adType={ad.vehicleAd ? 'vehicle' : 'property'}
                  onPress={() => onAdPress(ad)}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: PADDING,
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkBlue,
  },
  gridContainer: {
    gap: ITEM_SPACE,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
  },
});

export default CarListingSection;