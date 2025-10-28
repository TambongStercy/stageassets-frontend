import { Link } from 'react-router-dom';
import { FileText, Home } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
            <FileText className="w-7 h-7 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-gray-900">StageAsset</span>
        </div>

        {/* 404 Content */}
        <div className="max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page not found</h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
