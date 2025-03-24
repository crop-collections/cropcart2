import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { VoiceInput } from '@/components/ui/voice-input';
import { FileUpload } from '@/components/ui/file-upload';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@shared/schema';

// Schema for product form
const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  unit: z.string().min(1, 'Unit is required'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative number'),
  categoryId: z.coerce.number().int().positive('Category is required'),
  organic: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price ? parseFloat(product.price as unknown as string) : 0,
      unit: product?.unit || '',
      stock: product?.stock || 0,
      categoryId: product?.categoryId || 0,
      organic: product?.organic || false,
      featured: product?.featured || false,
    },
  });

  // Set existing images if product is being edited
  useEffect(() => {
    if (product?.imageUrls) {
      setExistingImages(product.imageUrls);
    }
  }, [product]);

  // Handle file changes
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  // Remove existing image
  const handleRemoveExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  // Handle voice input for description
  const handleVoiceTranscriptChange = (transcript: string) => {
    form.setValue('description', transcript, { shouldValidate: true });
  };

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/farmer/products'] });
      toast({
        title: 'Product created',
        description: 'Your product has been created successfully.',
      });
      form.reset();
      setFiles([]);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive',
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('PUT', `/api/products/${product?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/farmer/products'] });
      toast({
        title: 'Product updated',
        description: 'Your product has been updated successfully.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: 'destructive',
      });
    },
  });

  // Form submission
  const onSubmit = async (values: ProductFormValues) => {
    const formData = new FormData();
    
    // Append all form values
    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, value.toString());
      }
    });
    
    // Append files
    files.forEach(file => {
      formData.append('images', file);
    });
    
    // Append existing images if updating
    if (product) {
      existingImages.forEach(url => {
        formData.append('existingImages', url);
      });
    }
    
    if (product) {
      await updateProductMutation.mutateAsync(formData);
    } else {
      await createProductMutation.mutateAsync(formData);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Organic Tomatoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                        <SelectItem value="bunch">bunch</SelectItem>
                        <SelectItem value="each">each</SelectItem>
                        <SelectItem value="dozen">dozen</SelectItem>
                        <SelectItem value="box">box</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (per unit)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Available quantity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Description</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <VoiceInput
                      onTranscriptChange={handleVoiceTranscriptChange}
                      initialText={field.value}
                      buttonVariant="outline"
                    />
                    <FormDescription>
                      {field.value.length}/1000 characters
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Organic Product</FormLabel>
                    <FormDescription>
                      Mark this product as certified organic
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>
                      Display this product on the featured products section
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="block mb-2">Product Images</FormLabel>
              <FileUpload
                maxFiles={5}
                onFilesChange={handleFilesChange}
                existingUrls={existingImages}
                onRemoveExisting={handleRemoveExistingImage}
              />
              <FormDescription className="mt-2">
                Upload up to 5 images. The first image will be used as the main product image.
              </FormDescription>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {createProductMutation.isPending || updateProductMutation.isPending
                  ? 'Saving...'
                  : product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
