import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-white font-bold text-2xl mb-4">
              <span>Crop</span><span className="text-secondary">Cart</span>
            </div>
            <p className="text-neutral-400 mb-4">
              Connecting local farmers with customers for fresher, healthier food and stronger communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <div className="text-neutral-400 hover:text-white transition cursor-pointer">Home</div>
                </Link>
              </li>
              <li>
                <Link href="/browse">
                  <div className="text-neutral-400 hover:text-white transition cursor-pointer">Browse Products</div>
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works">
                  <div className="text-neutral-400 hover:text-white transition cursor-pointer">How It Works</div>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <div className="text-neutral-400 hover:text-white transition cursor-pointer">About Us</div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="text-neutral-400 hover:text-white transition cursor-pointer">Contact</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">For Partners</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register?role=farmer">
                  <div className="text-neutral-400 hover:text-white transition cursor-pointer">Become a Seller</div>
                </Link>
              </li>
              <li>
                <Link href="/register?role=delivery">
                  <div className="text-neutral-400 hover:text-white transition cursor-pointer">Delivery Partner</div>
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition">
                  Partner Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition">
                  Resources
                </a>
              </li>
              <li>
                <Link href="/dashboard">
                  <div className="text-neutral-400 hover:text-white transition cursor-pointer">Partner Login</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-neutral-400 mt-0.5" />
                <span className="text-neutral-400">123 Farm Road, Harvest Valley, CA 95678</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-neutral-400" />
                <span className="text-neutral-400">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-neutral-400" />
                <span className="text-neutral-400">info@cropcart.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="bg-neutral-700 mb-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} CropCart. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-neutral-500 hover:text-white text-sm transition">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-500 hover:text-white text-sm transition">
              Terms of Service
            </a>
            <a href="#" className="text-neutral-500 hover:text-white text-sm transition">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
