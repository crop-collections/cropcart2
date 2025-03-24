import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import ProductCard from '@/components/products/product-card';
import { Sliders, Search, Filter } from 'lucide-react';
import { Category, Product } from '@shared/schema';

// Parse query parameters from URL
const useQueryParams = () => {
  const [location] = useLocation();
  return new URLSearchParams(location.split('?')[1]);
};

export default function Browse() {
  const queryParams = useQueryParams();
  const initialCategoryId = queryParams.get('category') || '';
  const initialSearchQuery = queryParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [filterOpen, setFilterOpen] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Fetch products with filters
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/products', selectedCategory, currentPage],
    queryOptions: {
      refetchOnWindowFocus: false,
    },
  });

  // Filter and sort products
  const filteredProducts = products
    .filter((product: Product) => {
      // Apply category filter
      if (selectedCategory && product.categoryId !== parseInt(selectedCategory)) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply organic filter
      if (organicOnly && !product.organic) {
        return false;
      }
      
      return true;
    })
    .sort((a: Product, b: Product) => {
      // Apply sorting
      if (sortOrder === 'price-low') {
        return Number(a.price) - Number(b.price);
      } else if (sortOrder === 'price-high') {
        return Number(b.price) - Number(a.price);
      }
      
      // Default to newest
      return b.id - a.id;
    });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Find the selected category name
  const selectedCategoryName = selectedCategory
    ? categories.find((cat: Category) => cat.id === parseInt(selectedCategory))?.name || 'All Products'
    : 'All Products';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Filters sidebar - hidden on mobile */}
        <Card className="w-full md:w-64 hidden md:block">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Narrow down your search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="all-categories"
                      checked={!selectedCategory}
                      onCheckedChange={() => setSelectedCategory('')}
                    />
                    <label
                      htmlFor="all-categories"
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      All Categories
                    </label>
                  </div>
                  
                  {categories.map((category: Category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategory === category.id.toString()}
                        onCheckedChange={() => setSelectedCategory(category.id.toString())}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Product Type</h3>
                <div className="flex items-center">
                  <Checkbox
                    id="organic-only"
                    checked={organicOnly}
                    onCheckedChange={(checked) => setOrganicOnly(checked === true)}
                  />
                  <label
                    htmlFor="organic-only"
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Organic Only
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Sort By</h3>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedCategory('');
                  setOrganicOnly(false);
                  setSortOrder('newest');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="w-full md:flex-1">
          {/* Search and filter controls */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <form onSubmit={handleSearch} className="flex-1 flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    type="text"
                    placeholder="Search products..."
                    className="pl-9 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="ml-2">Search</Button>
              </form>
              
              <div className="flex gap-2">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  className="md:hidden"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{selectedCategoryName}</h1>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </p>
            </div>
          </div>
          
          {/* Mobile filters - shown when filter button is clicked */}
          {filterOpen && (
            <Card className="mb-6 md:hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={!selectedCategory ? "default" : "outline"}
                        className="justify-start h-auto py-2"
                        onClick={() => setSelectedCategory('')}
                      >
                        All Categories
                      </Button>
                      
                      {categories.map((category: Category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                          className="justify-start h-auto py-2"
                          onClick={() => setSelectedCategory(category.id.toString())}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Product Type</h3>
                    <div className="flex items-center">
                      <Checkbox
                        id="mobile-organic-only"
                        checked={organicOnly}
                        onCheckedChange={(checked) => setOrganicOnly(checked === true)}
                      />
                      <label
                        htmlFor="mobile-organic-only"
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Organic Only
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedCategory('');
                        setOrganicOnly(false);
                        setSortOrder('newest');
                        setSearchQuery('');
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setFilterOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-neutral-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-neutral-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
                      <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-destructive">Error loading products. Please try again later.</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No products found matching your criteria. Try adjusting your filters.</p>
            </div>
          )}
          
          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }} 
                    isActive={currentPage > 1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive={currentPage === 1} href="#" onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(1);
                  }}>
                    1
                  </PaginationLink>
                </PaginationItem>
                {currentPage > 3 && <PaginationEllipsis />}
                {currentPage > 2 && (
                  <PaginationItem>
                    <PaginationLink href="#" onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage - 1);
                    }}>
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                {currentPage !== 1 && (
                  <PaginationItem>
                    <PaginationLink isActive href="#" onClick={(e) => e.preventDefault()}>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
