import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface CarCardProps {
  price: string;
  title: string;
  year: number;
  color: string;
  description: string;
  location: string;
  tags: string[];
  image: string;
  onPress?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({
  price,
  title,
  year,
  color,
  description,
  location,
  tags,
  image,
  onPress,
}) => {
  // Calculate responsive width for each card (2 cards per row with gap)
  const cardWidth = (screenWidth - 32 - 16) / 2; // screenWidth - paddingHorizontal(32) - gap(16)

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, { width: cardWidth }]} 
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={typeof image === 'string' ? { uri: image } : image} style={styles.carImage} />
        <View style={styles.basicBadge}>
          <Text style={styles.badgeIcon}>⚡</Text>
          <Text style={styles.badgeText}>Basic</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.yearColor}>{year} {color}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.location}>{location}</Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  basicBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#6366f1',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    color: '#fff',
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  yearColor: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  description: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default CarCard;