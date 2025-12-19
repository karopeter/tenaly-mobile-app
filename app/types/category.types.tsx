import { ImageSourcePropType } from "react-native";

export interface Category {
  id: string;
  name: string;
  icon: ImageSourcePropType;
  subcategories: string[];
}

export interface CategoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onCategorySelect: (category: string, subcategory?: string) => void;
}
