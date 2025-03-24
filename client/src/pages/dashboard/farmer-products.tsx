import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, DollarSign, Box, Leaf, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import ProductForm from '@/components/products/product-form';
import { Product } from '@shared/schema';

export default function FarmerProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [filterText, setFilterText] = useState('');
  const [currentTab, setCurrentTab] = useState('all');

  // Fetch products owned by this farmer
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/farmer/products'],
    enabled: !!user && user.role === 'farmer',
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/farmer/products'] });
      toast({
        title: 'Product deleted',
        description: 'The product has been successfully removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete product error:', error);
    },
  });

  // Handle product deletion
  const handleDeleteProduct = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Handle product edit
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenProductDialog(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenProductDialog(false);
    setSelectedProduct(undefined);
  };

  // Filter products based on search text and tab
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(filterText.toLowerCase()) || 
                         product.description.toLowerCase().includes(filterText.toLowerCase());
    
    if (currentTab === 'all') return matchesSearch;
    if (currentTab === 'featured') return matchesSearch && product.featured;
    if (currentTab === 'organic') return matchesSearch && product.organic;
    if (currentTab === 'low-stock') return matchesSearch && product.stock < 10;
    
    return matchesSearch;
  });

  // Product success handler
  const handleProductSuccess = () => {
    setOpenProductDialog(false);
    setSelectedProduct(undefined);
    queryClient.invalidateQueries({ queryKey: ['/api/farmer/products'] });
  };

  if (!user || user.role !== 'farmer') {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You need to be logged in as a farmer to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-muted-foreground">Manage your farm products inventory</p>
        </div>
        <Button onClick={() => setOpenProductDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* Product filters and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="organic">Organic</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-full md:w-64">
          <Input
            placeholder="Search products..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      {/* Product stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Organic Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((product: Product) => product.organic).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Featured Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((product: Product) => product.featured).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((product: Product) => product.stock < 10).length}</div>
          </CardContent>
        </Card>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground mt-1">
                {filterText ? 'Try adjusting your search criteria' : 'Add your first product to get started'}
              </p>
              {!filterText && (
                <Button className="mt-4" onClick={() => setOpenProductDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Product
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: Product) => (
                <Card key={product.id} className="overflow-hidden flex flex-col">
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <img 
                        src={product.imageUrls[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Box size={48} />
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
                      {product.organic && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Leaf className="h-3 w-3 mr-1" /> Organic
                        </Badge>
                      )}
                      {product.featured && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          <Star className="h-3 w-3 mr-1" /> Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>{product.unit}</CardDescription>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        <DollarSign className="h-4 w-4 inline-block" />
                        {product.price}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="mt-2">
                      <Badge variant={product.stock < 10 ? "destructive" : "outline"}>
                        Stock: {product.stock}
                      </Badge>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Product Form Dialog */}
      <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? 'Update your product information below.'
                : 'Fill out the form below to add a new product to your inventory.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProductForm 
              product={selectedProduct} 
              onSuccess={handleProductSuccess} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}