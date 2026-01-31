import { 
  ChefHat, 
  SprayCan, 
  Car, 
  Wrench, 
  Zap, 
  TreePine, 
  Paintbrush, 
  Hammer, 
  Baby, 
  Heart 
} from "lucide-react";

export const JOB_CATEGORIES = [
  { id: 'cook', name: 'Cook', icon: ChefHat, description: 'Professional home chefs' },
  { id: 'cleaner', name: 'Cleaner', icon: SprayCan, description: 'House cleaning services' },
  { id: 'driver', name: 'Driver', icon: Car, description: 'Personal & delivery drivers' },
  { id: 'plumber', name: 'Plumber', icon: Wrench, description: 'Plumbing & pipe repairs' },
  { id: 'electrician', name: 'Electrician', icon: Zap, description: 'Electrical work & repairs' },
  { id: 'gardener', name: 'Gardener', icon: TreePine, description: 'Garden & lawn care' },
  { id: 'painter', name: 'Painter', icon: Paintbrush, description: 'Interior & exterior painting' },
  { id: 'carpenter', name: 'Carpenter', icon: Hammer, description: 'Woodwork & furniture' },
  { id: 'babysitter', name: 'Babysitter', icon: Baby, description: 'Childcare services' },
  { id: 'caretaker', name: 'Caretaker', icon: Heart, description: 'Elder & patient care' },
] as const;

export type JobCategoryId = typeof JOB_CATEGORIES[number]['id'];
