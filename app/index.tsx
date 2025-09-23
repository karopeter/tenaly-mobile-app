import { useState, useRef } from 'react';
import {  
   View,
    Text, 
    Image, 
    Dimensions,
    StyleSheet, 
    StatusBar,
    FlatList, 
    TouchableOpacity
  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
 import { LinearGradient } from 'expo-linear-gradient';
 import { useRouter } from 'expo-router';

const {width, height} = Dimensions.get('window');
const COLORS = { primary: "#FFFFFF", white: "#fff", gray: "#CDCDD7", blue: "#5555DD" }

const slides = [
  {
    id: '1',
    image: require('../assets/images/board1.png'),
    title: 'Buy and Sell with Confidence',
    subtitle: "Whether you're listing products or making purchases, Tenaly gives you a seamless and secure marketplace experience-built for ease, speed and trust",
  },
  {
    id: '2',
    image: require('../assets/images/board2.png'),
    title: 'Verification that Builds Trust',
    subtitle: "Stand out with verified business details and documents so users know they're dealing with a credible, legitimate brand.",
  },
  {
    id: '3',
    image: require('../assets/images/board3.png'),
    title: 'Track Your Sales and Growth',
    subtitle: "Access real-time analytics, monitor your listings' performance, and stay informed with insights that help you make smarter business decisions.",
  },
];

type SlideItem = {
   id: string;
  image: any; 
  title: string;
  subtitle: string;
}

const Slide = ({ item }: { item: SlideItem }) => {
  return (
    <View
      style={{
        width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}
    >
      <Image
        source={item.image}
        style={{
          height: height * 0.4,
          width: width * 0.9,
          resizeMode: 'contain',
        }}
      />
      {/* Indicator */}
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              item.id === slides[index].id && {
                backgroundColor: COLORS.blue,
                width: 45,
              },
            ]}
          />
        ))}
      </View>
      {/* Title & Subtitle */}
      <Text style={[styles.title, { marginTop: 15 }]}>{item.title}</Text>
      <Text style={styles.subTitle}>{item.subtitle}</Text>
    </View>
  );
};




const SplashScreen = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef<FlatList<any>>(null);
  const router = useRouter();

   const updateCurrentSlideIndex = (e: any) => {
     const contentOffsetX = e.nativeEvent.contentOffset.x;
     const currentIndex = Math.round(contentOffsetX / width);
     setCurrentSlideIndex(currentIndex);
  };

  const goNextSlide = () => {
     const nextSlideIndex = currentSlideIndex + 1;
     if (nextSlideIndex !== slides.length) {
       const offset = nextSlideIndex * width;
     ref?.current?.scrollToOffset({offset});
     setCurrentSlideIndex(nextSlideIndex);
     }
  };


    const skip = () => {
     const lastSlideIndex = slides.length - 1;
     const offset = lastSlideIndex * width;
     ref?.current?.scrollToOffset({offset});
     setCurrentSlideIndex(lastSlideIndex);
  }

  const Footer = () => {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}
    >
      {currentSlideIndex === slides.length - 1 ? (
        <View style={{ height: 50, flexDirection: 'row' }}>
          <TouchableOpacity 
            style={[styles.btn]}
            onPress={() => router.push('/auth/login')}
            >
            <LinearGradient
              colors={['#00A8DF', '#1031AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 52,
                borderRadius: 8,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={styles.nextText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ width: 15 }} />
          <TouchableOpacity
            style={styles.btnSkip}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.skipText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.btnSkip} onPress={skip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
            <View style={{ width: 15 }} />
            <TouchableOpacity style={[styles.btn]} onPress={goNextSlide}>
            <LinearGradient
              colors={['#00A8DF', '#1031AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 52,
                borderRadius: 8,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={styles.nextText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

 

  return(
    <SafeAreaView 
       style={{ 
          flex: 1,
          backgroundColor: COLORS.primary,
          justifyContent: 'center'
        }}>
        <StatusBar backgroundColor={COLORS.primary} />
        <FlatList 
          ref={ref}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          pagingEnabled
          data={slides} 
          contentContainerStyle={{height: height * 0.75 }} 
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => <Slide item={item} />} />
          <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   title: {
    color: '#525252',
    fontSize: 22,
    marginTop: 2,
    fontWeight: 'bold',
    textAlign: 'center'
   },
   subTitle: {
    color: '#868686',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 10,
    maxWidth: '85%',
    textAlign: 'center',
    lineHeight: 22,
    flexShrink: 1,
    flexWrap: 'wrap'
   },
   indicator: {
     height: 2.5,
     width: 10,
     backgroundColor: COLORS.gray,
     marginHorizontal: 3,
     borderRadius: 2,
   },
   btn: {
   flex: 1,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
   } ,
   btnSkip: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDCDD7',
    backgroundColor: 'transparent'
   },
   nextText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
   },
   skipText: {
    color: '#525252',
    fontWeight: '500',
    fontSize: 16,
   }
});

export default SplashScreen;