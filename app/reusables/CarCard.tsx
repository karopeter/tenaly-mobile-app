import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface CarCardProps {
  id: string;
  price: string;
  title: string;
  year?: number;
  color?: string;
  description: string;
  location: string;
  carKeyFeatures?: string;
  carType?: string;
  propertyType?: string;
  transmission?: string;
  propertyFacilities?: string;
  ownershipStatus?: string;
  propertyDuration?: string;
  squareMeter?: string;
  tags: string[];
  image?: string | null;
  businessName?: string;
  profileImage?: string | null;
  isVerified?: boolean;
  plan?: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  onPress?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({
  id,
  price,
  title,
  year,
  color,
  description,
  location,
  tags,
  image,
  carKeyFeatures,
  carType,
  propertyType,
   transmission,
  propertyFacilities,
  ownershipStatus,
  propertyDuration,
  businessName,
  squareMeter,
  profileImage,
  isVerified = false,
  plan = 'free',
  onPress,
}) => {
  const cardWidth = (screenWidth - 44) / 2; 

  const imageUri = image && typeof image === 'string' && image.trim() !== ''
    ? { uri: image.trim() }
    : require('../../assets/images/benz.png'); 

  return (
    <TouchableOpacity
       style={[styles.cardContainer, { width: cardWidth }]} 
       onPress={onPress}>
      {/* Image & Badges */}
      <View style={styles.imageContainer}>
        <Image 
          source={imageUri} 
          style={styles.carImage}
           resizeMode="cover"
         />
         <View style={styles.basicBadge}>
              <Image 
                source={require('../../assets/images/prem.png')}
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText}>{plan.toUpperCase()}</Text>
         </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
           {/* Price */}
        <Text style={styles.price}>{price}</Text>

         {/* Title */}
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>

        {/* Year & Color */}
        {(year || color) && (
          <Text style={styles.subtitle}>
            {year && color ? `${year} • ${color}` : year || color}
          </Text>
        )}

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Image 
            source={require('../../assets/images/location.png')}
            style={{
              width: 9.33,
              height:13.33
            }}
          />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>
        
        {/* Fix this style */}
        <View style={styles.boxContainer}>
          {carType ? (
            <View style={styles.localBox}>
              <Text style={styles.localText}>{carType}</Text>
            </View>
          ): null}

          {propertyType ? (
            <View style={styles.localBox}>
              <Text style={styles.localText}>{propertyType}</Text>
            </View>
          ): null}

          {transmission ? (
            <View style={styles.localBox}>
               <Text style={styles.localText}>{transmission}</Text>
            </View>
          ): null}

          {propertyDuration ? (
            <View style={styles.localBox}>
              <Text style={styles.localText}>{propertyDuration}</Text>
            </View>
          ): null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.limWhite
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    height: 140,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
   basicBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: colors.lightBlue,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    color: colors.bg,
    fontSize: 12,
    marginRight: 1,
  },
  badgeText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '600',
  },
  planBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.shadePurple,
    borderRadius: 4,
    height: 35,
    width: 99,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.green,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
  },
  price: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.blue,
    marginBottom: 8,
    fontFamily: 'WorkSans_500Medium',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 5,
    fontFamily: 'WorkSans_600SemiBold'
  },
  localText: {
     color: colors.darkGray,
     fontWeight: '500',
     fontSize: 10,
     fontFamily: 'WorkSans_500Medium',
     textAlign: "center"
  },
  subtitle: {
    fontSize: 12,
    color: colors.darkShadeGray,
    marginBottom: 6,
    fontFamily: 'WorkSans_500Medium',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    color:  colors.lightShadeGray,
    flex: 1,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
  },
  description: {
    fontSize: 11,
    color:  colors.lightShadeGray,
    lineHeight: 15,
    textAlign: "left",
    marginBottom: 12,
      fontFamily: 'WorkSans_500Medium',
  },
  businessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  boxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  contactButton: {
    backgroundColor: colors.shadePurple,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  localBox: {
   backgroundColor: colors.lightWhite,
   borderRadius: 6,
   paddingVertical: 4,
   paddingHorizontal: 10,
   alignItems: "center",
   justifyContent: "center"
  },
  localType: {
    fontSize: 10,
    color: colors.darkShadeGray,
    fontWeight: '500',
  },
  contactButtonText: {
    color: colors.bg,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CarCard;