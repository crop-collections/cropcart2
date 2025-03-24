import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProductForm from '@/components/products/product-form';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  Leaf,
  Box,
  BarChart3
} from 'lucide-react';
import { Product } from '@shared/schema';

export default function DashboardProducts() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Protect this page for farmers only
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'farmer') {
      setLocation('/dashboard');
    } else if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch products for this farmer
  const { 
    data: products = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/products'],
    select: (data) => data.filter((product: Product) => product.farmerId === user?.id),
    enabled: !!user?.id,
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('DELETE', `/api/products/${productId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  // Handle product deletion
  const handleDeleteProduct = async (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProductMutation.mutateAsync(productId);
    }
  };

  // Handle edit product click
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Close modal after successful form submission
  const handleFormSuccess = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  // Filter products based on search term and active tab
  const filteredProducts = products
    .filter((product: Product) => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tab filter
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'organic') return matchesSearch && product.organic;
      if (activeTab === 'featured') return matchesSearch && product.featured;
      if (activeTab === 'low-stock') return matchesSearch && product.stock < 10;
      
      return matchesSearch;
    })
    .sort((a: Product, b: Product) => b.id - a.id); // Sort by newest first

  // Guard for farmers only
  if (!isAuthenticated || (user && user.role !== 'farmer')) {
    return null; // The useEffect hook will handle redirection
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Products</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage your farm products
          </p>
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Box className="h-5 w-5 mr-2 text-primary" />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{products.length}</p>
            <p className="text-muted-foreground text-sm">Products listed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Leaf className="h-5 w-5 mr-2 text-secondary" />
              Organic Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {products.filter((product: Product) => product.organic).length}
            </p>
            <p className="text-muted-foreground text-sm">Organic certified</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="h-5 w-5 mr-2 text-accent" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {products.filter((product: Product) => product.stock < 10).length}
            </p>
            <p className="text-muted-foreground text-sm">Products with less than 10 units</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>Manage and update your product listings</CardDescription>
          
          <div className="mt-4 flex flex-col md:flex-row justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 md:w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="organic">Organic</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 animate-pulse">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">Error loading products. Please try again later.</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <Table>
              <TableCaption>
                A list of your products. {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <div className="h-10 w-10 rounded overflow-hidden">
                            <img 
                              src={product.imageUrls[0]} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                            <Box className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div>{product.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            Stock: {product.stock} {product.unit}s
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.categoryId}
                    </TableCell>
                    <TableCell>${Number(product.price).toFixed(2)}/{product.unit}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span>{product.stock}</span>
                        {product.stock < 10 && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 text-xs">
                            Low
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {product.organic && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Organic
                          </Badge>
                        )}
                        {product.featured && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add product modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new product to your inventory.
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Edit product modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product information.
            </DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <ProductForm product={editingProduct} onSuccess={handleFormSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
