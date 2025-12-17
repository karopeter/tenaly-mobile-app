import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  StatusBar 
} from "react-native";
import { AntDesign } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import { colors } from '@/app/constants/theme';
import { FAQItem } from '@/app/types/faq.types';

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'GENERAL',
    question: 'Who can use Tenaly?',
    answer: 'Anyone looking to buy or sell vehicles and real estate can use Tenaly, including individuals, businesses, and real estate agents.',
  },
  {
    id: '2',
    category: 'GENERAL',
    question: 'How does Tenaly ensure the security of users?',
    answer: 'We verify listings, provide user verification options, and offer security guidelines to help prevent scams.',
  },
  {
    id: '3',
    category: 'GENERAL',
    question: 'Is Tenaly a direct seller of cars and properties?',
    answer: 'No, Tenaly is a marketplace that connects buyers and sellers. We do not own or sell any listed properties or vehicles.',
  },
  {
    id: '4',
    category: 'LISTING AND SELLING',
    question: 'How do I post an ad on Tenaly?',
    answer: 'Log into your account, click "Sell," select a category (Real Estate or Vehicles & Others), provide necessary details, and submit.',
  },
  {
    id: '5',
    category: 'LISTING AND SELLING',
    question: 'What information do I need to provide when listing an ad?',
    answer: 'You need accurate details such as quality images, price, description, location, contact details, and relevant documents if required.',
  },
  {
    id: '6',
    category: 'LISTING AND SELLING',
    question: 'How long does it take for my ad to be approved?',
    answer: 'Ads typically go through a verification process and are approved within 24 hours.',
  },
  {
    id: '7',
    category: 'LISTING AND SELLING',
    question: 'What happens if my listing is rejected?',
    answer: "This happens when your ads doesn't meet our guidelines, we will notify you with the reason and suggest corrections",
  },
  {
    id: '8',
    category: 'BUYING',
    question: 'How do I contact a seller?',
    answer: 'Click the desired ad, you will see a contact button on the listing to call, or send a message to the seller.',
  },
  {
    id: '9',
    category: 'BUYING',
    question: 'Does Tenaly offer buyer protection?',
    answer: 'No, transactions are done directly between buyers and sellers. Always conduct due diligence before making a payment.',
  },
  {
    id: '10',
    category: 'BUYING',
    question: 'Can I negotiate price with sellers?',
    answer: 'Yes, you can contact sellers to negotiate the price before making the purchase.',
  },
  {
    id: '11',
    category: 'BUYING',
    question: 'Can I report a fraudulent seller?',
    answer: 'Yes, you can report suspicious activity using the "Report" button on the listing or contact customer support.',
  },
  {
    id: '12',
    category: 'PREMIUM PACKAGE AND AD BOOSTING',
    question: 'What are premium ad packages?',
    answer: "These are paid plans that increase your ad's visibility, placing it at the top of searches and attracting more buyers."
  },
  {
   id: '13',
   category: 'PREMIUM PACKAGE AND AD BOOSTING',
   question: 'How much do premium packages cost?',
   answer: 'Pricing varies based on the type of boost. Check the for details.',
   link: {
    text: 'pricing page ',
    route: '/protected/pricing'
   }
  },
  {
    id: '14',
    category: 'PREMIUM PACKAGE AND AD BOOSTING',
    question: 'How can I pay for a premium ad?',
    answer: 'Payments can be made via bank transfer, credit/debit cards'
  },
  {
    id: '15',
    category: 'PREMIUM PACKAGE AND AD BOOSTING',
    question: 'How long does a premium ad stay active?',
    answer: 'The duration depends on the package choosen, typically ranging from a Month to a year.'
  },
  {
   id: '16',
   category: 'PREMIUM PACKAGE AND AD BOOSTING',
   question: 'Can I get a refund if I cancel my premium ad?',
   answer: 'No, once a premium package is activated, refunds are not available'
  },
  {
   id: '17',
   category: 'ACCOUNT AND SECURITY',
   question: 'How do I verify my account?',
   answer: 'Submit a valid ID and subscribe  for any premium package'
  },
  {
   id: '18',
   category: 'ACCOUNT AND SECURITY',
   question: 'What are the benefits of becoming a verified user?',
   answer: 'Verified users gain trust, enjoy better visibility and have access to exclusive features.'
  },
  {
   id: '19',
   category: 'ACCOUNT AND SECURITY',
   question: 'I forgot my password. How do I reset it?',
   answer: 'Click "Forgot Password" on the login page and follow the instructions to reset it, or go to the settings page, click on account actions, click on change passsword and follow the instructions to reset it'
  },
  {
   id: '20',
   category: 'ACCOUNT AND SECURITY',
   question: 'Can I change my email or phone number?',
   answer: 'Yes, go to your personal profile, click on edit, click on change email or phone number settings and follow the instructions to change it'
  },
  // {
  //  id: '21',
  //  category: 'ACCOUNT AND SECURITY',
  //  question: 'Can I deactivate my account temporarily?'
  // }
  {
   id: '21',
   category: 'CUSTOMER SUPPORT AND POLICIES',
   question: 'Where can I find help for common issues?',
   answer: 'Visit the FAQ, which has solutions for most user concerns'
  },
  {
   id: '22',
   category: 'CUSTOMER SUPPORT AND POLICIES',
   question: "How can I contact Tenaly's customer support?",
   answer: 'You can reach support via email, phone, or live chat on the website',
  },
   {
   id: '23',
   category: 'CUSTOMER SUPPORT AND POLICIES',
   question: "Can I request feature improvements?",
   answer: 'Yes, we welcome feedback and feature requests from our users',
  },
  {
   id: '24',
   category: 'CUSTOMER SUPPORT AND POLICIES',
   question: "How do I report a problem with my account?",
   answer: 'Contact customer support via email or live chat to resolve account-related issues.', 
  }
];

interface AccordionItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onPress: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isExpanded, onPress }) => {
  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity 
        style={styles.accordionHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{item.question}</Text>
        <AntDesign 
          name={isExpanded ? "up" : "down"} 
          size={16} 
          color={colors.darkGray} 
        />
      </TouchableOpacity>
      
      {isExpanded && (
       <View style={styles.accordionBody}>
         <Text style={styles.answerText}>
           {item.answer}
           {item.link && (
            <Text 
              style={styles.linkText}
              onPress={() => router.push(item.link!.route as any)}
            >
              {item.link.text}
            </Text>
           )}
           {item.link && ' for details. '}
         </Text>
       </View>
      )}
    </View>
  );
};

export default function FrequentlyAskedQuestion() {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleAccordion = (id: string) => {
   setExpandedIds(prev => 
    prev.includes(id) 
      ? prev.filter(item => item !== id)
      : [...prev, id]
   );
  };

  const groupedFAQs = faqData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrow-left" size={24} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequently asked question</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedFAQs).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            
            {items.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                isExpanded={expandedIds.includes(item.id)}
                onPress={() => toggleAccordion(item.id)}
              />
            ))}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
    backgroundColor: colors.bg,
    shadowColor: '#4D485F1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
    gap: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categorySection: {
    marginTop: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1212B8',
    fontFamily: 'WorkSans_700Bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  accordionItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    marginRight: 12,
    lineHeight: 20,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.viewGray,
    fontFamily: 'WorkSans_400Regular',
    lineHeight: 20,
  },
  linkText: {
    color: colors.blue,
    textDecorationLine: 'underline',
    fontWeight: '500'
  }
});