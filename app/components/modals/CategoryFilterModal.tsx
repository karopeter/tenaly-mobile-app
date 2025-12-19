import React, { useState } from 'react';
import {
 View, 
 Text, 
 Modal, 
 TouchableOpacity, 
 ScrollView, 
 StyleSheet, 
 Image,
 Platform, 
 StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';
import { Category, CategoryFilterModalProps } from '@/app/types/category.types';

const CATEGORIES: Category[] = [
  {
    id: 'agriculture',
    name: 'Agriculture & Food',
    icon: require('@/assets/images/agriculture-icon.png'),
    subcategories: [
      'Food',
      'Fresh Produce (fruits, vegetables, grains)',
      'Livestock (poultry, goats, cattle, pigs, etc.)',
      'Seeds & Seedlings',
      'Animal Feed',
      'Fertilizers',
      'Farm Tools & Equipment',
      'Agro Chemicals (pesticides, herbicides)',
      'Farm Services (plowing, irrigation, consultancy)'
    ]
  },
  {
    id: 'pets',
    name: 'Animal & Pets',
    icon: require('@/assets/images/pet-category.png'),
    subcategories: [
      'Dogs',
      'Cats',
      'Birds',
      'Fish & Aquarium',
      'Small Pets (rabbits, hamsters, guinea pigs)',
      'Pet Accessories',
      'Pet Food'
    ]
  },
  {
    id: 'hire',
    name: 'Available for hire',
    icon: require('@/assets/images/hire-category.png'),
    subcategories: [
      'Hire Tech & IT',
      'Lessons & Trainings',
      'Hire Cleaners',
      'Repair & Maintain',
      'Painting & Wall Finishing',
      'Hire Plumbing',
      'Hire Eletrical Wiring & Installation',
      'Hire Furniture Assembly',
      'Hire Beauty & Wellness',
      'Hire Creative & Media',
      'Hire Event Planning for Hire',
      'Hire DJ Services',
      'Hire MC / Host Services'
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Health',
    icon: require('@/assets/images/beauty-category.png'),
    subcategories: [
      'Skin Care',
      'Hair Care',
      'Makeup & Cosmetics',
      'Fragrances (Perfume & Body Spray)',
      'Bath & Body',
      'Nail Care',
      'Beauty Tools & Accessories',
      'Personal Grooming Devices',
      'Oral Care',
      "Men's Grooming"
    ]
  },
  {
    id: 'construction',
    name: 'Building & Construction',
    icon: require('@/assets/images/construction-category.png'),
    subcategories: [
      'Building Material',
      'Eletrical Equipment & Tools',
      'Plumbing Material & Fittings',
      'Paints & Finishes',
      'Hand Tools',
      'Safety Equipment & Workwear',
      'Repair & Maintenance Services',
      'Construction Equipment',
      'Roofing Materials',
      'Flooring & Tiles'
    ]
  },
  {
    id: 'equipment',
    name: 'Equipments & Machineries',
    icon:  require('@/assets/images/equipment-category.png'),
    subcategories: [
      'Industrial Machines',
      'Construction Equipment',
      'Power Tools',
      'Manufacturing Equipment',
      'Medical & Laboratory Equipment',
      'Kitchen & Restaurant Equipment',
      'Printing & Packaging Machines',
      'Agricultural Machinery',
      'Cleaning & Laundry Equipment',
      'Office Equipment'
    ]
  },
  {
    id: 'kids',
    name: 'For Kids',
    icon: require('@/assets/images/kid-category.png'),
    subcategories: [
      'Baby Clothes',
      'Kids Clothes',
      'Shoes',
      'Toys & Games',
      'Baby Gear (strollers, car seats, carriers)',
      'Feeding (bottles, high chairs, breast pumps)',
      'Furniture (cribs, cots, wardrobes)',
      'Health & Safety (monitors, baby gates)',
      'School Supplies (bags, books, stationery)'
    ]
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: require('@/assets/images/fashion-category.png'),
    subcategories: [
      'Clothing',
      'Footwear',
      'Bags',
      'Jewellery',
      'Watches',
      'Accessories',
      'Eyewear (Glasses & Sunglasses)',
      'Wedding & Event Wear'
    ]
  },
  {
    id: 'gadgets',
    name: 'Gadgets',
    icon: require('@/assets/images/gadget-category.png'),
    subcategories: [
      'Mobile Phones',
      'Tablets',
      'Smartwatches',
      'Phone Accessories',
      'Tablet Accessories',
      'Power Banks',
      'Chargers & Cables',
      'Screen Protectors',
      'Pouch',
      'Covers',
      'Earphones / Headsets'
    ]
  },
  {
    id: 'household',
    name: 'Household Items',
    icon: require('@/assets/images/household-category.png'),
    subcategories: [
      'Furniture',
      'Home Appliances',
      'Kitchen Appliances',
      'Home Decor',
      'Lighting',
      'Bedding & Linen',
      'Curtains & Blinds',
      'Kitchenware & Cookware',
      'Cleaning Equipment',
      'Bathroom Accessories',
      'Garden & Outdoor',
      'Others'
    ]
  },
  {
    id: 'job',
    name: 'Job',
    icon: require('@/assets/images/job-category.png'),
    subcategories: ['Jobs', 'Jobs for Hire', 'Jobs for sale']
  },
  {
    id: 'laptops',
    name: 'Laptops & Computers',
    icon: require('@/assets/images/laptop-category.png'),
    subcategories: [
      'Laptops',
      'Desktop Computers',
      'Computer Accessories',
      'Monitors',
      'Printers & Scanners',
      'Networking Equipment',
      'Storage Devices',
      'Software',
      'Others'
    ]
  },
  {
    id: 'property',
    name: 'Property',
    icon: require('@/assets/images/property-category.png'),
    subcategories: [
      'Commercial Property For Rent',
      'Commercial Property For Sale',
      'House and Apartment Property For Rent',
      'House and Apartment Property For Sale',
      'Land and Plot For Rent',
      'Land and Plot For Sale',
      'Short Let Property',
      'Event Center And Venues'
    ]
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: require('@/assets/images/vehicle-category.png'),
    subcategories: ['car', 'bus', 'tricycle']
  }
];

const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({ visible, onClose, onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setShowAllCategories(false);
  };

  const handleSubcategoryClick = (subcategory: string) => {
    if (selectedCategory) {
      onCategorySelect(selectedCategory.name, subcategory);
      onClose();
      setSelectedCategory(null);
    }
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      setShowAllCategories(false);
    }
  };

  const visibleCategories = CATEGORIES.slice(0, 3);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { justifyContent: 'flex-start', alignItems: 'flex-start'}]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 20 }]}>
            {(selectedCategory || showAllCategories) && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color={colors.darkGray} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>
              {selectedCategory ? selectedCategory.name : showAllCategories ? 'All Categories' : 'All Categories'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.darkGray} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.content}>
            {selectedCategory ? (
              // Show subcategories
              <>
                {selectedCategory.subcategories.map((sub, idx) => (
                  <TouchableOpacity key={idx} style={styles.subcategoryItem} onPress={() => handleSubcategoryClick(sub)}>
                    <Text style={styles.subcategoryText}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : showAllCategories ? (
              // Show all categories
              <>
                {CATEGORIES.map((cat, index) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryItem, index === 0 && styles.categoryItemSelected]}
                    onPress={() => handleCategoryClick(cat)}
                  >
                   <View style={styles.categoryLeft}>
                    <Image 
                      source={cat.icon}
                      style={[styles.categoryIconImage, { tintColor: index === 0 ? colors.bg : colors.darkGray }]}
                    />
                    <Text style={[styles.categoryText, { color: index === 0 ? colors.bg : colors.darkGray}]}>
                      {cat.name}
                    </Text>
                   </View>
                   <Ionicons name="chevron-forward" size={20} color={index === 0 ? colors.bg : colors.darkGray} />
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              // Show top 3 + hamburger menu
              <>
                {visibleCategories.map((cat, idx) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryItem, idx === 0 && styles.categoryItemSelected]}
                    onPress={() => handleCategoryClick(cat)}
                  >
                    <View style={styles.categoryLeft}>
                      <Image 
                       source={cat.icon} 
                       style={[styles.categoryIconImage, { tintColor: idx === 0 ?  colors.bg : colors.darkGray }]}
                        />
                      <Text style={[styles.categoryText, { color: idx === 0 ? colors.bg : colors.darkGray }]}>
                         {cat.name}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={idx === 0 ? colors.bg : colors.darkGray} />
                  </TouchableOpacity>
                ))}

                {/* Hamburger Menu */}
                <TouchableOpacity 
                  style={styles.hamburgerButton} 
                  onPress={() => setShowAllCategories(true)}>
                  <Ionicons name="menu" size={24} color={colors.prikyBlue} />
                  <Text style={styles.hamburgerText}>View All Categories</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  container: {
    backgroundColor: colors.bg,
    width: '80%',
    height: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightSpot
  },
  backButton: {
    marginRight: 12
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray
  },
  content: {
    padding: 10
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightSpot,
    height: 48,
  },
  categoryItemSelected: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    borderBottomWidth: 0,
     paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  categoryIconImage: {
   width: 24,
   height: 24,
   resizeMode: 'contain'
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray
  },
  subcategoryItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightSpot
  },
  subcategoryText: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: colors.darkGray
  },
  hamburgerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.lightSpot,
    marginTop: 10,
    borderRadius: 8
  },
  hamburgerText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.prikyBlue
  }
});

export default CategoryFilterModal;