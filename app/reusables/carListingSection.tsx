import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import CarCard from './CarCard';
import { CarListing } from '../types/car';
import Car1 from "../../assets/images/benz.png";

const { width: screenWidth } = Dimensions.get('window');


const PADDING = 16;
const ITEM_SPACE = 16;
const CARD_WIDTH = (screenWidth - PADDING * 2 - ITEM_SPACE) / 2;

interface CarListingSectionProps {
  onCarPress?: (car: CarListing) => void;
}

const CarListingSection: React.FC<CarListingSectionProps> = ({ onCarPress }) => {
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock API fetch - replace with real endpoint
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);

        // Mock data for now
        const mockData: CarListing[] = [
          {
            id: '1',
            price: '₦8,000,000',
            title: 'Toyota Camry 2.4 XLE',
            year: 2008,
            color: 'Blue',
            description: 'Very clean and sound Toyota, excellent condition. You can co...',
            location: 'Abule-Egba, Lagos',
            tags: ['Local Used', 'Automatic'],
            image: Car1,
          },
          {
            id: '2',
            price: '₦12,500,000',
            title: 'Honda Accord 3.5 V6',
            year: 2015,
            color: 'White',
            description: 'Well maintained Honda with low mileage. Excellent interior...',
            location: 'Ikoyi, Lagos',
            tags: ['Foreign Used', 'Automatic'],
            image: Car1,
          },
          {
            id: '3',
            price: '₦6,200,000',
            title: 'Nissan Sentra SV',
            year: 2012,
            color: 'Silver',
            description: 'Good condition Nissan with recent service history...',
            location: 'Surulere, Lagos',
            tags: ['Local Used', 'Manual'],
            image: Car1,
          },
          {
            id: '4',
            price: '₦15,000,000',
            title: 'Mercedes-Benz C300',
            year: 2018,
            color: 'Black',
            description: 'Luxury sedan in pristine condition. Full service history...',
            location: 'Victoria Island, Lagos',
            tags: ['Brand New', 'Automatic'],
            image: Car1,
          },
          {
            id: '5',
            price: '₦10,500,000',
            title: 'Ford Explorer XLT',
            year: 2019,
            color: 'Silver',
            description: 'Spacious and powerful SUV, great for families.',
            location: 'Lekki, Lagos',
            tags: ['Foreign Used', 'Automatic'],
            image: Car1,
          },
          {
            id: '6',
            price: '₦9,800,000',
            title: 'Kia Sportage LX',
            year: 2017,
            color: 'Gray',
            description: 'Compact SUV with modern features and fuel efficiency.',
            location: 'Ikeja, Lagos',
            tags: ['Local Used', 'Automatic'],
            image: Car1,
          },
        ];

        // Simulate network delay
        setTimeout(() => {
          setCars(mockData);
          setLoading(false);
        }, 1000);
      } catch (e) {
        setError('Failed to load cars');
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading cars...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }


  const pairedCars = [];
  for (let i = 0; i < cars.length; i += 2) {
    pairedCars.push(cars.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trending</Text>

      <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
        {pairedCars.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.rowContainer}>
            {row.map((car, cardIndex) => (
              <View
                key={car.id}
                style={[
                  styles.cardWrapper,
                  cardIndex === 0 ? { marginRight: ITEM_SPACE } : null,
                ]}
              >
                <CarCard {...car} onPress={() => onCarPress?.(car)} />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: PADDING,
    paddingTop: 5
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#525252',
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: ITEM_SPACE,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default CarListingSection;