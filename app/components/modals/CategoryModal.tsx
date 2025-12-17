import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  StyleSheet
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';


interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (category: string) => void;
}


const CategoryModal: React.FC<Props> = ({ visible, onClose, onSelect }) => {
    const [selectedMain, setSelectedMain] = useState<string | null>(null);

    const vehicleCategories = ['car', 'bus', 'tricycle'];
    const propertyCategories = [
       'Commercial Property For Rent',
       'Commercial Property For Sale',
       'House and Apartment Property For Rent',
       'House and Apartment Property For Sale',
       'Land and Plot For Rent',
       'Lands and Plot For Sale',
       'Short Let Property',
       'Event Center And Venues'
  ];

  const agricultureCategories = [
     'Fresh Produce (fruits, vegetables, grains)',
     'Livestock (poultry, goats, cattle, pigs, etc.)',
     'Seeds & Seedlings',
     'Animal Feed',
     'Fertilizers',
     'Farm Tools & Equipment',
     'Agro Chemicals (pesticides, herbicides)',
     'Farm Services (plowing, irrigation, consultancy)'
  ];


  const kidsCategories = [
   'Baby Clothes',
  'Kids Clothes',
  'Shoes',
  'Toys & Games',
  'Baby Gear (strollers, car seats, carriers)',
  'Feeding (bottles, high chairs, breast pumps)',
  'Furniture (cribs, cots, wardrobes)',
  'Health & Safety (monitors, baby gates)',
  'School Supplies (bags, books, stationery)'
  ];

  const petsCategories = [
     'Dogs',
  'Cats',
  'Birds',
  'Fish & Aquarium',
  'Small Pets (rabbits, hamsters, guinea pigs)',
  'Pet Accessories',
  'Pet Food'
  ];

  const servicesCategories = [
      'Tech & IT',
  'Lessons & Training',
  'Cleaning',
  'Repairs & Maintenance',
  'Painting & Well Finishing',
  'Plumbing',
  'Electrical Wiring & Installation',
  'Furniture Assembly',
  'Beauty & Wellness',
  'Creative & Media',
  'Event Planning & Coordination',
  'Dj Services',
  'MC / Host Services'
  ];

  const equipmentsCategories = [
    'Industrial Machines',
  'Construction Equipments',
  'Power Tools',
  'Manufacturing Equipment',
  'Medical & Laboratory Equipment',
  'Kitchen & Restaurant Equipment',
  'Printing & Packaging Machines',
  'Agricultural Machinery',
  'Cleaning & Laundry Equipment',
  'Office Equipment'
  ];

  const gadgetCategories = [
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
  ];

  const laptopsCategories = [
     'Laptops',
  'Desktop Computers',
  'Computer Accessories',
  'Monitors',
  'Printers & Scanners',
  'Networking Equipment',
  'Storage Devices',
  'Software',
  'Others'
  ];

  const fashionCategories = [
     'Clothing',
  'Footwear',
  'Bags',
  'Jewellery',
  'Watches',
  'Accessories',
  'Eyewear (Glasses & Sunglasses)',
  'Wedding & Event Wear'
  ];

  const householdCategories = [
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
  ];

  const beautyCategories = [
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
  ];

  const constructionCategories = [
    'Building Material',
  'Electrical Equipment & Tools',
  'Plumbing Material & Fittings',
  'Paints & Finishes',
  'Hand Tools',
  'Safety Equipment & Workwear',
  'Repair & Maintenance Services',
  'Construction Equipment',
  'Roofing Materials',
  'Flooring & Tiles'
  ];

  const jobsCategories = [
    'Jobs',
  'Jobs for Hire',
  'Jobs for sale'
  ];

  const hireCategories = [
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
     'Hi re Event Planning for Hire',
      'Hire DJ Services',
     'Hire MC / Host Services'
  ];

  const getCategoryList = () => {
  switch(selectedMain) {
    case 'vehicle': return vehicleCategories;
    case 'property': return propertyCategories;
    case 'agriculture': return agricultureCategories;
    case 'kids': return kidsCategories;
    case 'pets': return petsCategories;
    case 'services': return servicesCategories;
    case 'equipments': return equipmentsCategories;
    case 'gadgets': return gadgetCategories;
    case 'laptops': return laptopsCategories;
    case 'fashion': return fashionCategories;
    case 'household': return householdCategories;
    case 'beauty': return beautyCategories;
    case 'construction': return constructionCategories;
    case 'jobs': return jobsCategories;
    case 'hire': return hireCategories;
    default: return [];
  }
};
  
   return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <View style={{ width: 24, }} />
               <Text style={styles.modalTitle}>Category</Text>

               <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <AntDesign name="close" size={24} color={colors.black}  />
               </TouchableOpacity>
            </View>
  
           {!selectedMain ? (
  <ScrollView showsVerticalScrollIndicator={false}>
    <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('agriculture')}>
      <Image
        source={require('../../../assets/images/agriculture-icon.png')}
        style={styles.categoryIcon} 
      />
      <Text style={styles.categoryText}>Agriculture & Food</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('pets')}>
     <Image 
       source={require('../../../assets/images/pet-icon.png')}
       style={styles.categoryIcon}
     />
      <Text style={styles.categoryText}>Animals & Pets</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

      <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('hire')}>
        <Image
          source={require('../../../assets/images/hire-icon.png')}
          style={styles.categoryIcon} 
        />
      <Text style={styles.categoryText}>Available for Hire</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

       <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('beauty')}>
       <Image
         source={require('../../../assets/images/beauty-icon.png')}
         style={styles.categoryIcon} 
       />
      <Text style={styles.categoryText}>Beauty & Health</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

     <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('construction')}>
       <Image
         source={require('../../../assets/images/construction-icon.png')}
         style={styles.categoryIcon} 
       />
      <Text style={styles.categoryText}>Building & Construction</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

      <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('equipments')}>
      <Image
        source={require('../../../assets/images/equipment-icon.png')}
        style={styles.categoryIcon} 
      />
      <Text style={styles.categoryText}>Equipment & Machinery</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

     <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('kids')}>
      <Image 
       source={require('../../../assets/images/kids-icon.png')}
       style={styles.categoryIcon}
      />
      <Text style={styles.categoryText}>For Kids</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

     <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('fashion')}>
      <Image
        source={require('../../../assets/images/fashion-icon.png')}
        style={styles.categoryIcon}
      />
      <Text style={styles.categoryText}>Fashion</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

      <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('gadgets')}>
       <Image 
         source={require('../../../assets/images/gadget-icon.png')}
         style={styles.categoryIcon}
       />
      <Text style={styles.categoryText}>Gadgets</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

     <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('household')}>
     <Image
       source={require('../../../assets/images/household-icon.png')}
       style={styles.categoryIcon} 
     />
      <Text style={styles.categoryText}>Household Items</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('services')}>
      <Image
        source={require('../../../assets/images/jobs-icon.png')}
        style={styles.categoryIcon} 
      />
      <Text style={styles.categoryText}>Jobs</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('laptops')}>
      <Image
        source={require('../../../assets/images/laptops-icon.png')}
        style={styles.categoryIcon} 
      />
      <Text style={styles.categoryText}>Laptops & Computers</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('property')}>
     <Image
       source={require('../../../assets/images/property-icon.png')}
       style={styles.categoryIcon} 
     />
      <Text style={styles.categoryText}>Property</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

      <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('vehicle')}>
      <Image
       source={require('../../../assets/images/vehicle-icon1.png')}
      style={styles.categoryIcon}
      />
      <Text style={styles.categoryText}>Vehicles</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity>

    {/* <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedMain('jobs')}>
      <Feather name="briefcase" size={20} color={colors.lightGrey} />
      <Text style={styles.categoryText}>Jobs</Text>
      <AntDesign name="right" size={16} color={colors.darkGray} />
    </TouchableOpacity> */}
  </ScrollView>
) : (
  <ScrollView>
    <TouchableOpacity style={styles.backButton} onPress={() => setSelectedMain(null)}>
      <AntDesign name="left" size={16} color={colors.blue} />
    </TouchableOpacity>

    {getCategoryList().map((cat) => (
      <TouchableOpacity
        key={cat}
        style={styles.subcategoryItem}
        onPress={() => {
          onSelect(cat);
          onClose();
          setSelectedMain(null);
        }}>
        <Text style={styles.subcategoryText}>{cat}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
)}
          </View>
        </View>
      </Modal>
    );
};


const styles = StyleSheet.create({
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.darkGray,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  closeButton: {
    position: 'relative',
    right: 0,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  categoryIcon: {
    width: 24, 
    height: 24
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    marginLeft: 12
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
    subcategoryItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  subcategoryText: {
    fontSize: 15,
    color: colors.black
  },
});

export default CategoryModal;