import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { analyticsApi } from '@/api/admin';

export const AdminDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAdmin();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [apiTest, setApiTest] = useState<any>(null);

  useEffect(() => {
    const gatherDebugInfo = () => {
      const info = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: {
          adminToken: localStorage.getItem('adminToken'),
          adminRefreshToken: localStorage.getItem('adminRefreshToken'),
        },
        adminContext: {
          user,
          isAuthenticated,
          isLoading,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        }
      };
      setDebugInfo(info);
    };

    gatherDebugInfo();
  }, [user, isAuthenticated, isLoading]);

  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await analyticsApi.getDashboardStats();
      console.log('API Test Response:', response);
      setApiTest({
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
    } catch (error: any) {
      console.error('API Test Error:', error);
      setApiTest({
        success: false,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
    }
  };

  const testBasicConnection = async () => {
    try {
      const baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.text();
      console.log('Basic connection test:', { status: response.status, data });
    } catch (error) {
      console.error('Basic connection test failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Debug Panel</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Debug Panel</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Debug Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Authentication Status</h3>
                <p className="text-sm text-gray-600">
                  Authenticated: {isAuthenticated ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-600">
                  Loading: {isLoading ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-600">
                  User: {user ? `${user.name} (${user.email})` : 'None'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Local Storage</h3>
                <p className="text-sm text-gray-600">
                  Admin Token: {debugInfo.localStorage?.adminToken ? 'Present' : 'Missing'}
                </p>
                <p className="text-sm text-gray-600">
                  Refresh Token: {debugInfo.localStorage?.adminRefreshToken ? 'Present' : 'Missing'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Environment</h3>
                <p className="text-sm text-gray-600">
                  API Base URL: {debugInfo.environment?.apiBaseUrl}
                </p>
                <p className="text-sm text-gray-600">
                  Node Env: {debugInfo.environment?.nodeEnv}
                </p>
              </div>
            </div>
          </div>

          {/* API Tests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">API Tests</h2>
            <div className="space-y-4">
              <button
                onClick={testBasicConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
              >
                Test Basic Connection
              </button>
              <button
                onClick={testApiConnection}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Test Analytics API
              </button>
              
              {apiTest && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">API Test Result</h3>
                  <div className={`p-3 rounded-md ${apiTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p className={`text-sm ${apiTest.success ? 'text-green-800' : 'text-red-800'}`}>
                      Status: {apiTest.success ? 'Success' : 'Failed'}
                    </p>
                    {apiTest.status && (
                      <p className="text-sm text-gray-600">HTTP Status: {apiTest.status}</p>
                    )}
                    {apiTest.error && (
                      <p className="text-sm text-red-600">Error: {apiTest.error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raw Debug Data */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Debug Data</h2>
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              View Debug Information
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
          
          {apiTest && (
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                View API Test Result
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};
