import { Link } from 'react-router-dom';
import outkarLogo from '@/assets/outkar-logo.jpeg';

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={outkarLogo} alt="OutKar" className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-display font-bold text-xl">OutKar</span>
            </Link>
            <p className="text-primary-foreground/70 max-w-sm">
              The trusted marketplace for hiring skilled blue-collar and household workers. 
              Find verified professionals for all your home and business needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Find Workers
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup&role=worker" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Become a Worker
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/60 text-sm">
          <p>&copy; {new Date().getFullYear()} OutKar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
