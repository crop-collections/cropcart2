import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import CategoryList from '@/components/products/category-list';
import ProductCard from '@/components/products/product-card';
import { Mic, Camera, Route, HandHeart, Truck, Package } from 'lucide-react';

export default function Home() {
  // Fetch featured products
  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-green-700 text-white py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-bold text-3xl md:text-5xl mb-4">Fresh from Farm to Table</h1>
            <p className="text-lg md:text-xl mb-6 text-white/90">Connect directly with local farmers for the freshest produce, dairy and more.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/browse">
                <Button size="lg" variant="default" className="bg-white text-primary hover:bg-neutral-100">
                  Shop Now
                </Button>
              </Link>
              <Link href="/register?role=farmer">
                <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/10 border-2 border-white text-white">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-2xl md:text-3xl mb-8 text-center">Browse Categories</h2>
          <CategoryList />
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-bold text-2xl md:text-3xl">Featured Products</h2>
            <Link href="/browse">
              <div className="text-primary font-medium hover:underline hidden md:flex items-center cursor-pointer">
                View All <span className="ml-1">→</span>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsLoading ? (
              // Loading skeletons
              Array(4).fill(0).map((_, index) => (
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
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No featured products available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center md:hidden">
            <Link href="/browse">
              <Button variant="link" className="text-primary">
                View All Products <span className="ml-1">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 bg-white" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-2xl md:text-3xl mb-12 text-center">How CropCart Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-primary text-2xl" />
              </div>
              <h3 className="font-bold text-xl mb-3">Browse & Order</h3>
              <p className="text-muted-foreground">Browse products from local farmers and add items to your cart for delivery or pickup.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HandHeart className="text-secondary text-2xl" />
              </div>
              <h3 className="font-bold text-xl mb-3">Support Local</h3>
              <p className="text-muted-foreground">Your purchase directly supports farmers in your community with fair pricing.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-accent text-2xl" />
              </div>
              <h3 className="font-bold text-xl mb-3">Fast Delivery</h3>
              <p className="text-muted-foreground">Get fresh products delivered to your doorstep or choose convenient pickup locations.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Farmer Portal Preview */}
      <section className="py-12 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-primary font-medium">FOR FARMERS</span>
              <h2 className="font-bold text-2xl md:text-4xl mt-2 mb-4">Easy Tools to Manage Your Farm Products</h2>
              <p className="text-muted-foreground mb-6">Join our network of farmers and gain access to a wider customer base. Our platform provides user-friendly tools to list and manage your products with ease.</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Mic className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Voice Input Features</h3>
                    <p className="text-muted-foreground text-sm">Easily describe your products using voice input - no typing required!</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Camera className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Simple Image Upload</h3>
                    <p className="text-muted-foreground text-sm">Take photos of your products directly through the app for quick listings.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Route className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Order Management</h3>
                    <p className="text-muted-foreground text-sm">Track orders, manage inventory, and communicate with customers.</p>
                  </div>
                </div>
              </div>
              
              <Link href="/register?role=farmer">
                <Button className="bg-primary hover:bg-primary/90">Become a Seller</Button>
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-xl mb-6">Product Listing Demo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-700 mb-2 font-medium" htmlFor="productName">Product Name</label>
                  <input id="productName" type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g. Organic Tomatoes" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-700 mb-2 font-medium" htmlFor="productCategory">Category</label>
                    <select id="productCategory" className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Select Category</option>
                      <option>Vegetables</option>
                      <option>Fruits</option>
                      <option>Dairy</option>
                      <option>Eggs</option>
                      <option>Herbs</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-neutral-700 mb-2 font-medium" htmlFor="productUnit">Unit</label>
                    <select id="productUnit" className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Select Unit</option>
                      <option>kg</option>
                      <option>lb</option>
                      <option>bunch</option>
                      <option>each</option>
                      <option>dozen</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-neutral-700 mb-2 font-medium" htmlFor="productPrice">Price</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">$</span>
                    <input id="productPrice" type="text" className="w-full pl-8 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="0.00" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-neutral-700 mb-2 font-medium">Product Description</label>
                  <div className="border border-neutral-300 rounded-md overflow-hidden">
                    <textarea className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" rows={3} placeholder="Describe your product..."></textarea>
                    <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-300 flex justify-between">
                      <button type="button" className="flex items-center text-accent hover:text-accent/80">
                        <Mic className="mr-2 h-4 w-4" />
                        <span className="text-sm">Voice Description</span>
                      </button>
                      <div className="text-neutral-500 text-xs">0/500</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-neutral-700 mb-2 font-medium">Product Images</label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-md p-6 text-center">
                    <div className="text-neutral-500 mb-2">
                      <Camera className="h-6 w-6 mx-auto" />
                    </div>
                    <div className="text-sm text-neutral-600 mb-1">Drag photos here or click to upload</div>
                    <div className="text-xs text-neutral-500">Maximum 5 images, 5MB each</div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button type="button" className="border border-neutral-300 text-neutral-700 font-medium py-2 px-6 rounded-md hover:bg-neutral-50 transition">Save Draft</button>
                  <button type="button" className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition">List Product</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Delivery Partner Section */}
      <section className="py-12 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-xl mb-6">Delivery Route Preview</h3>
              <div className="rounded-md overflow-hidden h-80 bg-neutral-200 flex items-center justify-center">
                <div className="text-center px-4">
                  <Route className="h-12 w-12 text-neutral-400 mb-4 mx-auto" />
                  <p className="text-muted-foreground">Interactive delivery route map would appear here</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Today's Deliveries</h4>
                <div className="space-y-2 mb-4">
                  <div className="border border-neutral-200 rounded-md p-3 hover:bg-neutral-50 transition flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-success/10 p-2 rounded-full mr-3">
                        <Package className="text-success text-sm" />
                      </div>
                      <div>
                        <div className="font-medium">Order #2389</div>
                        <div className="text-sm text-muted-foreground">3 items • 2.5 miles</div>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-success/10 text-success text-xs py-1 px-2 rounded">In Progress</span>
                    </div>
                  </div>
                  
                  <div className="border border-neutral-200 rounded-md p-3 hover:bg-neutral-50 transition flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-neutral-100 p-2 rounded-full mr-3">
                        <Package className="text-neutral-500 text-sm" />
                      </div>
                      <div>
                        <div className="font-medium">Order #2390</div>
                        <div className="text-sm text-muted-foreground">5 items • 4.8 miles</div>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-neutral-100 text-neutral-600 text-xs py-1 px-2 rounded">Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <span className="text-accent font-medium">FOR DELIVERY PARTNERS</span>
              <h2 className="font-bold text-2xl md:text-4xl mt-2 mb-4">Efficient Delivery Management</h2>
              <p className="text-muted-foreground mb-6">Join our network of delivery partners and earn money delivering fresh farm products. Our platform provides smart routing and order management tools.</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="bg-accent/10 p-2 rounded-full mr-4">
                    <Route className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Optimized Routes</h3>
                    <p className="text-muted-foreground text-sm">Smart routing algorithm to minimize travel time and maximize deliveries.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-accent/10 p-2 rounded-full mr-4">
                    <svg className="text-accent" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 18H12.01M8 21H16C17.1046 21 18 20.1046 18 19V5C18 3.89543 17.1046 3 16 3H8C6.89543 3 6 3.89543 6 5V19C6 20.1046 6.89543 21 8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Mobile App</h3>
                    <p className="text-muted-foreground text-sm">Easy-to-use mobile app for managing deliveries and tracking progress.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-accent/10 p-2 rounded-full mr-4">
                    <svg className="text-accent" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8C12 6.4087 12.6321 4.88258 13.7574 3.75736C14.8826 2.63214 16.4087 2 18 2M12 8C12 9.5913 12.6321 11.1174 13.7574 12.2426C14.8826 13.3679 16.4087 14 18 14M12 8H2M18 22C18 20.4087 17.3679 18.8826 16.2426 17.7574C15.1174 16.6321 13.5913 16 12 16M12 16C12 17.5913 11.3679 19.1174 10.2426 20.2426C9.11742 21.3679 7.5913 22 6 22M12 16H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Flexible Earnings</h3>
                    <p className="text-muted-foreground text-sm">Set your own schedule and earn competitive rates for deliveries.</p>
                  </div>
                </div>
              </div>
              
              <Link href="/register?role=delivery">
                <Button className="bg-accent hover:bg-accent/90">Become a Delivery Partner</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-bold text-2xl md:text-4xl text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">Join CropCart today and discover the best fresh produce from local farmers while supporting your community.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="default" className="bg-white text-primary hover:bg-neutral-100">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/10 border-2 border-white text-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
