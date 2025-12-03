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

  // Fixed getImage function - accessing the correct properties
  const getImage = (ad: CombinedAd): string | null => {
    // Check each ad type and return the first available image
    if (ad.petAd && ad.carAd.petsImage && ad.carAd.petsImage.length > 0) {
      return ad.carAd.petsImage[0];
    }
    if (ad.agricultureAd && ad.carAd.agricultureImage && ad.carAd.agricultureImage.length > 0) {
      return ad.carAd.agricultureImage[0];
    }
    if (ad.kidsAd && ad.carAd.kidsImage && ad.carAd.kidsImage.length > 0) {
      return ad.carAd.kidsImage[0];
    }
    if (ad.serviceAd && ad.carAd.serviceImage && ad.carAd.serviceImage.length > 0) {
      return ad.carAd.serviceImage[0];
    }
    if (ad.equipmentAd && ad.carAd.equipmentImage && ad.carAd.equipmentImage.length > 0) {
      return ad.carAd.equipmentImage[0];
    }
    if (ad.gadgetAd && ad.carAd.gadgetImage && ad.carAd.gadgetImage.length > 0) {
      return ad.carAd.gadgetImage[0];
    }
    if (ad.laptopAd && ad.carAd.laptopImage && ad.carAd.laptopImage.length > 0) {
      return ad.carAd.laptopImage[0];
    }
    if (ad.fashionAd && ad.carAd.fashionImage && ad.carAd.fashionImage.length > 0) {
      return ad.carAd.fashionImage[0];
    }
    if (ad.householdAd && ad.carAd.householdImage && ad.carAd.householdImage.length > 0) {
      return ad.carAd.householdImage[0];
    }
    if (ad.beautyAd && ad.carAd.beautyImage && ad.carAd.beautyImage.length > 0) {
      return ad.carAd.beautyImage[0];
    }
    if (ad.constructionAd && ad.carAd.constructionImage && ad.carAd.constructionImage.length > 0) {
      return ad.carAd.constructionImage[0];
    }
    if (ad.jobAd && ad.carAd.jobImage && ad.carAd.jobImage.length > 0) {
      return ad.carAd.jobImage[0];
    }
    if (ad.hireAd && ad.carAd.hireImage && ad.carAd.hireImage.length > 0) {
      return ad.carAd.hireImage[0];
    }
    if (ad.vehicleAd && ad.carAd.vehicleImage && ad.carAd.vehicleImage.length > 0) {
      return ad.carAd.vehicleImage[0];
    }
    if (ad.propertyAd && ad.carAd.propertyImage && ad.carAd.propertyImage.length > 0) {
      return ad.carAd.propertyImage[0];
    }
    return null;
  };

  // Helper function to get the correct title
  const getTitle = (ad: CombinedAd): string => {
    if (ad.petAd) return ad.petAd.petType || 'Pet';
    if (ad.agricultureAd) return ad.agricultureAd.title || 'Agriculture Product';
    if (ad.kidsAd) return ad.kidsAd.title || 'Kids Item';
    if (ad.serviceAd) return ad.serviceAd.serviceTitle || 'Service';
    if (ad.equipmentAd) return ad.equipmentAd.equipmentTitle || 'Equipment';
    if (ad.gadgetAd) return ad.gadgetAd.gadgetTitle || 'Gadget';
    if (ad.laptopAd) return ad.laptopAd.laptopTitle || 'Laptop';
    if (ad.fashionAd) return ad.fashionAd.fashionTitle || 'Fashion Item';
    if (ad.householdAd) return ad.householdAd.householdTitle || 'Household Item';
    if (ad.beautyAd) return ad.beautyAd.beautyTitle || 'Beauty Product';
    if (ad.constructionAd) return ad.constructionAd.constructionTitle || 'Construction Item';
    if (ad.jobAd) return ad.jobAd.jobTitle || 'Job';
    if (ad.hireAd) return ad.hireAd.hireTitle || 'Hire';
    if (ad.vehicleAd) return `${ad.vehicleAd.vehicleType || ''} ${ad.vehicleAd.model || ''}`.trim() || 'Vehicle';
    if (ad.propertyAd) return ad.propertyAd.propertyName || 'Property';
    return 'Ad';
  };

  // Helper function to get the correct price
  const getPrice = (ad: CombinedAd): string => {
    if (ad.petAd?.amount) return formatPrice(ad.petAd.amount);
    if (ad.agricultureAd?.amount) return formatPrice(ad.agricultureAd.amount);
    if (ad.kidsAd?.amount) return formatPrice(ad.kidsAd.amount);
    if (ad.serviceAd?.amount) return formatPrice(ad.serviceAd.amount);
    if (ad.equipmentAd?.amount) return formatPrice(ad.equipmentAd.amount);
    if (ad.gadgetAd?.amount) return formatPrice(ad.gadgetAd.amount);
    if (ad.laptopAd?.amount) return formatPrice(ad.laptopAd.amount);
    if (ad.fashionAd?.amount) return formatPrice(ad.fashionAd.amount);
    if (ad.householdAd?.amount) return formatPrice(ad.householdAd.amount);
    if (ad.beautyAd?.amount) return formatPrice(ad.beautyAd.amount);
    if (ad.constructionAd?.amount) return formatPrice(ad.constructionAd.amount);
    if (ad.jobAd?.salaryRange) return formatPrice(ad.jobAd.salaryRange);
    if (ad.hireAd?.salaryRange) return formatPrice(ad.hireAd.salaryRange);
    if (ad.vehicleAd?.amount) return formatPrice(ad.vehicleAd.amount);
    if (ad.propertyAd?.amount) return formatPrice(ad.propertyAd.amount);
    return 'Price on request';
  };

  // Helper function to get the correct plan
  const getPlan = (ad: CombinedAd): string => {
    if (ad.petAd?.plan) return ad.petAd.plan;
    if (ad.agricultureAd?.plan) return ad.agricultureAd.plan;
    if (ad.kidsAd?.plan) return ad.kidsAd.plan;
    if (ad.serviceAd?.plan) return ad.serviceAd.plan;
    if (ad.equipmentAd?.plan) return ad.equipmentAd.plan;
    if (ad.gadgetAd?.plan) return ad.gadgetAd.plan;
    if (ad.laptopAd?.plan) return ad.laptopAd.plan;
    if (ad.fashionAd?.plan) return ad.fashionAd.plan;
    if (ad.householdAd?.plan) return ad.householdAd.plan;
    if (ad.beautyAd?.plan) return ad.beautyAd.plan;
    if (ad.constructionAd?.plan) return ad.constructionAd.plan;
    if (ad.jobAd?.plan) return ad.jobAd.plan;
    if (ad.hireAd?.plan) return ad.hireAd.plan;
    if (ad.vehicleAd?.plan) return ad.vehicleAd.plan;
    if (ad.propertyAd?.plan) return ad.propertyAd.plan;
    return 'free';
  };

  // Helper function to get the correct description
  const getDescription = (ad: CombinedAd): string => {
    if (ad.petAd?.description) return ad.petAd.description;
    if (ad.agricultureAd?.description) return ad.agricultureAd.description;
    if (ad.kidsAd?.description) return ad.kidsAd.description;
    if (ad.serviceAd?.description) return ad.serviceAd.description;
    if (ad.equipmentAd?.description) return ad.equipmentAd.description;
    if (ad.gadgetAd?.description) return ad.gadgetAd.description;
    if (ad.laptopAd?.description) return ad.laptopAd.description;
    if (ad.fashionAd?.description) return ad.fashionAd.description;
    if (ad.householdAd?.description) return ad.householdAd.description;
    if (ad.beautyAd?.description) return ad.beautyAd.description;
    if (ad.constructionAd?.description) return ad.constructionAd.description;
    if (ad.jobAd?.description) return ad.jobAd.description;
    if (ad.hireAd?.description) return ad.hireAd.description;
    if (ad.vehicleAd?.description) return ad.vehicleAd.description;
    if (ad.propertyAd?.description) return ad.propertyAd.description;
    return 'No description available';
  };

  // Take only first 4 items for display (2 rows of 2)
  const displayAds = ads;
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
                  image={getImage(ad)} 
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
                  gadgetCondition={ad.gadgetAd?.condition}
                  gadgetBrand={ad.gadgetAd?.gadgetBrand}
                  fashionMaterial={ad.fashionAd?.fashionMaterial}
                  fashionType={ad.fashionAd?.fashionType}
                  jobType={ad.hireAd?.jobType}
                  workMode={ad.hireAd?.workMode}
                  condition={ad.agricultureAd?.condition}
                  brand={ad.agricultureAd?.brand}
                  beautyBrand={ad.beautyAd?.beautyBrand}
                  beautyType={ad.beautyAd?.beautyType}
                  constructionType={ad.constructionAd?.constructionType}
                  constructionBrand={ad.constructionAd?.constructionBrand}
                  breed={ad.petAd?.breed}
                  age={ad.petAd?.age}
                  ageGroup={ad.kidsAd?.ageGroup}
                  gender={ad.kidsAd?.gender}
                  serviceExperience={ad.serviceAd?.serviceExperience}
                  pricingType={ad.serviceAd?.pricingType}
                  equipmentCondition={ad.equipmentAd?.condition}
                  equipmentBrand={ad.equipmentAd?.brand}
                  householdCondition={ad.householdAd?.condition}
                  householdType={ad.householdAd?.householdType}
                  laptopCondition={ad.laptopAd?.condition}
                  laptopBrand={ad.laptopAd?.laptopBrand}
                  adType={
                    ad.vehicleAd ? 'vehicle' : 
                    ad.propertyAd ? 'property' : 
                    ad.petAd ? 'pet' :
                    ad.agricultureAd ? 'agriculture' :
                    ad.kidsAd ? 'kids' :
                    ad.serviceAd ? 'service' :
                    ad.equipmentAd ? 'equipment' :
                    ad.gadgetAd ? 'gadget' :
                    ad.laptopAd ? 'laptop' :
                    ad.fashionAd ? 'fashion' :
                    ad.householdAd ? 'household' :
                    ad.beautyAd ? 'beauty' :
                    ad.constructionAd ? 'construction' :
                    ad.jobAd ? 'job' :
                    ad.hireAd ? 'hire' : 'other'
                  }
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