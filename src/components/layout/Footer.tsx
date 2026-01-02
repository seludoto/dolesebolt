import { Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold text-gray-900">Dolese</div>
            <div className="text-sm text-gray-500">Connecting buyers and sellers with confidence.</div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600">About</a>
              <a href="#" className="hover:text-blue-600">Contact</a>
              <a href="#" className="hover:text-blue-600">Terms</a>
              <a href="#" className="hover:text-blue-600">Privacy</a>
            </nav>

            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-blue-600">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-blue-600">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-blue-600">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} Dolese, Inc. All rights reserved.</div>
      </div>
    </footer>
  );
}
