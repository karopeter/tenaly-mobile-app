import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { colors } from '../constants/theme';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

const PostCustomButton: React.FC<CustomButtonProps> = ({ title, onPress, loading, disabled }) => {
   return (
     <TouchableOpacity
       style={[
        styles.button, disabled && styles.buttonDisabled
       ]}
       onPress={onPress}
       disabled={disabled || loading}
       activeOpacity={0.8}
     >
     {loading ? (
        <ActivityIndicator color={colors.bg} />
     ): (
      <Text style={styles.text}>{title}</Text>
     )}
     </TouchableOpacity>
   );
}


const styles = StyleSheet.create({
  button: {
    
  }
})


export default PostCustomButton;