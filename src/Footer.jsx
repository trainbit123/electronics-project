import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111827] text-gray-400 border-t border-gray-800">

      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shrink-0">
                <span className="text-white font-black text-xs">M</span>
              </div>
              <span className="text-white font-bold text-base tracking-tight">TechMatch</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Your destination for electronics and smart technology.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded border border-gray-700 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded border border-gray-700 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded border border-gray-700 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-8 h-8 rounded border border-gray-700 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Smartphones', to: '/mobiles' },
                { label: 'Laptops',     to: '/laptops' },
                { label: 'Tablets',     to: '/tablets' },
                { label: 'Accessories', to: '/accessories' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Customer Support</h4>
            <ul className="space-y-2.5">
              {['Contact Us', 'Help Center', 'Shipping & Delivery', 'Returns & Refunds'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5">
              {['About Us', 'Careers'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms & Conditions'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} TechMatch. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            🔒 Secure Shopping &nbsp;&middot;&nbsp; Trusted by thousands of customers
          </p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
