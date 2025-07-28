'use client';

export default function TestTailwindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
          Tailwind CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Primary Colors</h2>
            <div className="space-y-2">
              <div className="h-8 bg-primary-500 rounded"></div>
              <div className="h-8 bg-primary-600 rounded"></div>
              <div className="h-8 bg-primary-700 rounded"></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Buttons</h2>
            <div className="space-y-2">
              <button className="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors">
                Primary Button
              </button>
              <button className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors">
                Secondary Button
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inputs</h2>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Enter text here" 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input 
                type="email" 
                placeholder="Enter email here" 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Typography</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Small text</p>
              <p className="text-base text-gray-800">Base text</p>
              <p className="text-lg font-medium text-gray-900">Large text</p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Colors</h2>
            <div className="space-y-2">
              <div className="h-6 bg-success-500 rounded"></div>
              <div className="h-6 bg-warning-500 rounded"></div>
              <div className="h-6 bg-error-500 rounded"></div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Spacing</h2>
            <div className="space-y-2">
              <div className="h-4 bg-blue-200 rounded"></div>
              <div className="h-4 bg-blue-300 rounded"></div>
              <div className="h-4 bg-blue-400 rounded"></div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            If you can see this page with proper styling, Tailwind CSS is working correctly!
          </p>
        </div>
      </div>
    </div>
  );
} 