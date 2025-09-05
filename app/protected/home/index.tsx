import React, { useState} from 'react';
import { 
     View, 
     Text,
     KeyboardAvoidingView,
     TouchableOpacity,
     Platform,
     ScrollView,
     Image,
     TextInput,
 } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { SelectList } from 'react-native-dropdown-select-list';
import LocationSelectorModal from '@/app/components/LocationSelectorModal';
import CarListingSection from '../../reusables/carListingSection';


export default function HomeScreen() {
   const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(''); 
   const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
   const [selectedLocation, setSelectedLocation] = useState<string>('Location');

  // Dropdown data 
  const propertyData = [
    { key: '1', value: 'Commercial Property for Rent' },
    { key: '2', value: 'Commercial Property for Sale' },
    { key: '3', value: 'House & Apartment for Rent' },
     { key: '4', value: 'House & Apartment for Sale' },
     { key: '5', value: 'Land & Plots for Rent' },
    { key: '6', value: 'Land & Plots for Sale' },
     { key: '7', value: 'Event Centers' }
  ];

  const vehicleData = [
  { key: '1', value: 'Cars' },
  { key: '2', value: 'Bus' },
  { key: '3', value: 'Tricycle' },
   { key: '4', value: 'Motorcycles & Scooters'},
   { key: '5', value: 'Truck & Trailer' }
  ];


  return (
   <>
   <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#F8F8F8] mt-10">
       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
         {/* Header Section */}
         <View className="flex-row items-center justify-between mb-6 px-6">
             {/* Profile + Location */}
           <View className="flex-row gap-2 items-center">
             <Image 
               source={require("../../../assets/images/profileRight.png")}
               className="w-20 h-20 rounded-full"
            />
          <View className="flex-col gap-2">
           <Text className="text-[#525252] font-[500] text-[14px]">Welcome Golibe</Text>
           <TouchableOpacity 
              className="flex-row items-center"
               onPress={() => setIsLocationModalVisible(true)}>
               <Text className="text-sm text-gray-500">{selectedLocation}</Text>
             <AntDesign 
               name="caretdown" 
               size={10} 
               color="#8C8C8C" 
               style={{ marginLeft: 4 }} 
              />
            </TouchableOpacity>
            </View>
          </View>

         {/* Notification Icon */}
     <TouchableOpacity className="w-10 h-10 rounded-[40px] bg-[#EDEDED] justify-center items-center">
      <Image 
        source={require("../../../assets/images/notifications.png")}
         className="w-6 h-6"
        />
       </TouchableOpacity>
      </View>

      {/* Search Bar - Full Width Between Profile and Notification */}
    <View className="flex-row items-center mb-6 px-6">
    {/* Search Input */}
     <View className="flex-1 flex-row items-center" style={{ height: 44 }}>
      <TextInput
        placeholder="Search for anything"
        placeholderTextColor="#CDCDD7"
         className="flex-1 h-full pl-4 pr-12"
         style={{
         backgroundColor: '#E8E8FF',
         borderWidth: 1,
         borderColor: '#DFDFF9',
         borderTopLeftRadius: 8,
         borderBottomLeftRadius: 8,
        }}
        />
       {/* Search Icon */}
      <View
        className="absolute right-0 h-full justify-center items-center"
       style={{
         width: 44,
        backgroundColor: '#5555DD',
         borderTopRightRadius: 4,
         borderBottomRightRadius: 4,
      }}>
       <Ionicons name="search" size={20} color="#FFFFFF" />
     </View>
   </View>
</View>

{/* Dropdown Row */ }
  <View className="flex-row justify-between mb-6 px-6">
     {/* Property Dropdown */ }
   <View className="relative">
    <SelectList
      setSelected={setSelectedProperty}
         data={propertyData}
         placeholder="Property"
         boxStyles={{
            flex: 1,
            height: 44, 
            backgroundColor: '#EDEDED',
            borderWidth: 0.5,
             borderColor: '#CDCDD7',
             borderRadius: 8,
             paddingLeft: 36,
             paddingRight: 36,
             marginRight: 12
            }}
           inputStyles={{
           color: '#525252',
           fontSize: 14,
            textAlign:  'center'
           }}
           dropdownStyles={{
             maxHeight: 300,
             backgroundColor: '#FFFFFF',
             borderColor: '#CDCDD7',
             borderTopLeftRadius: 24,
             borderTopRightRadius: 24,
            borderBottomWidth: 0,
             shadowColor: '#000',
            shadowOffset: { width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            width: '100%',
            maxWidth: 300
          }}
         dropdownItemStyles={{
           borderBottomWidth: 1,
           borderBottomColor: '#EDEDED',
            paddingVertical: 16,
            paddingHorizontal: 20,
         }}
         dropdownTextStyles={{
          color: '#525252',
          fontSize: 14,
          textAlign: 'center'
          }}
         />
         {/* Property Icon */}
        <Image 
           source={require('../../../assets/images/propertyFilter.png')}
          className="absolute left-3 top-3 w-5 h-5" 
         />
          </View>

     {/* Vehicle Dropdown */ }
     <View className="relative">
       <SelectList
         setSelected={setSelectedVehicle}
          data={vehicleData}
          placeholder="Vehicle"
          boxStyles={{
           flex: 1,
           height: 44,
           backgroundColor: '#EDEDED',
            borderWidth: 0.5,
            borderColor: '#CDCDD7',
            borderRadius: 8,
            paddingLeft: 36,
            paddingRight: 36,
          }}
         inputStyles={{
          color: '#525252',
          fontSize: 14,
           textAlign: 'center'
         }}
       dropdownStyles={{
          maxHeight: 300,
          backgroundColor: '#FFFFFF',
           borderColor: '#CDCDD7',
           borderTopLeftRadius: 24,
           borderTopRightRadius: 24,
           borderBottomWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
           elevation: 3,
           width: '100%',
           maxWidth: 300,
        }}
       dropdownItemStyles={{
          borderBottomWidth: 1,
          borderBottomColor: '#EDEDED',
          paddingVertical: 16,
          paddingHorizontal: 20,
        }}
        dropdownTextStyles={{
          color: '#525252',
          fontSize: 14,
          textAlign: 'center'
        }}
        />
        {/* Vehicle Icon */ }
       <Image 
       source={require('../../../assets/images/vehicleFilter.png')}
       className="absolute left-3 top-3 w-5 h-5"
      />
   </View>
  </View>
   {/* Product Listing Section */ }
    <View className="mt-6">
     {/* <Text className="text-[#525252] text-lg font-bold mb-4">Trending</Text> */}
    <CarListingSection
      onCarPress={(car) => console.log('Selected car:', car)}
     />
    </View>
   </ScrollView>
   </KeyboardAvoidingView>
   <LocationSelectorModal
     visible={isLocationModalVisible}
      onClose={() => setIsLocationModalVisible(false)}
     onLocationSelect={(state, lga) => {
      setSelectedLocation(`${lga}, ${state}`);
     }}
    />
   </>
  );
 }