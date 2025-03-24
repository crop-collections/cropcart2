import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Category } from '@shared/schema';
import { 
  Carrot, 
  Apple, 
  Egg, 
  Wheat, 
  Flower2, 
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  icon: LucideIcon;
}

// Map of icons to use for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'carrot': Carrot,
  'apple-alt': Apple,
  'egg': Egg,
  'wheat-awn': Wheat,
  'seedling': Flower2,
  'ellipsis-h': MoreHorizontal,
};

// Helper to get icon component
const getCategoryIcon = (iconName: string): LucideIcon => {
  return CATEGORY_ICONS[iconName] || MoreHorizontal;
};

function CategoryCard({ category, icon: Icon }: CategoryCardProps) {
  // Convert hex color to tailwind-style rgba for background
  const getBgColorStyle = (color: string) => {
    return { backgroundColor: `${color}10` }; // 10% opacity version of the color
  };

  return (
    <Link href={`/browse?category=${category.id}`}>
      <div className="bg-neutral-100 rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
          style={getBgColorStyle(category.color)}
        >
          <Icon className="h-6 w-6" style={{ color: category.color }} />
        </div>
        <h3 className="font-medium">{category.name}</h3>
      </div>
    </Link>
  );
}

export default function CategoryList() {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-neutral-100 rounded-lg p-4 text-center animate-pulse">
            <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-neutral-200 rounded w-20 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error loading categories. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
      {categories.map((category: Category) => (
        <CategoryCard 
          key={category.id} 
          category={category} 
          icon={getCategoryIcon(category.icon)}
        />
      ))}
    </div>
  );
}
