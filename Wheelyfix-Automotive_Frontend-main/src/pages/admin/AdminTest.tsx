import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { analyticsApi, usersApi, brandsApi, servicesApi, ordersApi } from '@/api/admin';

export const AdminTest: React.FC = () => {
  const { user, isAuthenticated } = useAdmin();
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test Analytics API
      try {
        const analyticsResponse = await analyticsApi.getDashboardStats();
        console.log('Analytics API Response:', analyticsResponse);
        results.analytics = {
          status: 'success',
          data: analyticsResponse.data,
          fullResponse: analyticsResponse
        };
      } catch (error: any) {
        console.error('Analytics API Error:', error);
        results.analytics = {
          status: 'error',
          error: error.message,
          response: error.response?.data,
          statusCode: error.response?.status
        };
      }

      // Test Users API
      try {
        const usersResponse = await usersApi.getUsers({ page: 1, limit: 5 });
        results.users = {
          status: 'success',
          data: usersResponse.data
        };
      } catch (error: any) {
        results.users = {
          status: 'error',
          error: error.message
        };
      }

      // Test Brands API
      try {
        const brandsResponse = await brandsApi.getBrands({ page: 1, limit: 5 });
        results.brands = {
          status: 'success',
          data: brandsResponse.data
        };
      } catch (error: any) {
        results.brands = {
          status: 'error',
          error: error.message
        };
      }

      // Test Services API
      try {
        const servicesResponse = await servicesApi.getServices({ page: 1, limit: 5 });
        results.services = {
          status: 'success',
          data: servicesResponse.data
        };
      } catch (error: any) {
        results.services = {
          status: 'error',
          error: error.message
        };
      }

      // Test Orders API
      try {
        const ordersResponse = await ordersApi.getOrders({ page: 1, limit: 5 });
        results.orders = {
          status: 'success',
          data: ordersResponse.data
        };
      } catch (error: any) {
        results.orders = {
          status: 'error',
          error: error.message
        };
      }

    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }

    setTestResults(results);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Test Panel</h1>
          <p className="text-gray-600">Please log in to access the test panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin API Test Panel</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Status:</strong> {user?.status || 'N/A'}</p>
              <p><strong>Permissions:</strong> {user?.permissions?.join(', ') || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Tests</h2>
          <button
            onClick={runTests}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Running Tests...' : 'Run API Tests'}
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-4">
              {Object.entries(testResults).map(([api, result]: [string, any]) => (
                <div key={api} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 capitalize">{api} API</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  {result.status === 'success' ? (
                    <div className="text-sm text-gray-600">
                      <p>Data received successfully</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            View Response Data
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      <p>Error: {result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};