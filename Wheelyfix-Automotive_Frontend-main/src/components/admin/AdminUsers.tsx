import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, User, Search, Trash2, AlertCircle } from 'lucide-react';
import adminApi from '@/api/admin';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'customer' | 'admin' | 'manager' | 'superadmin';
  status: 'active' | 'suspended' | 'inactive';
  isAdmin: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  loginAttempts: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  // Ensure users is always an array
  const safeUsers = users || [];
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sort: 'createdAt:desc'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      console.log('Fetching users with params:', params.toString());
      console.log('Admin token:', localStorage.getItem('admin_access_token'));
      
      const response = await adminApi.get(`/users?${params.toString()}`);
      
      console.log('API Response:', response.data);
      
      if (response.data?.data) {
        setUsers(response.data.data.users || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
        setTotalUsers(response.data.data.pagination?.totalItems || 0);
        console.log('Users set:', response.data.data.users?.length || 0);
      } else {
        console.log('No data in response:', response.data);
        setUsers([]);
        setError('No data received from server');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      setUsers([]); // Ensure users is always an array
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in as an admin.');
        toast({ 
          title: 'Authentication Required', 
          description: 'Please log in as an admin to view users.',
          variant: 'destructive' 
        });
      } else if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to view users.');
        toast({ 
          title: 'Access Denied', 
          description: 'You do not have permission to view users.',
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Error', 
          description: `Failed to load users: ${errorMessage}`, 
          variant: 'destructive' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.put(`/users/${userId}`, { role: newRole });
      toast({ title: 'Success', description: `User role updated to ${newRole}` });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({ title: 'Error', description: 'Failed to update user role', variant: 'destructive' });
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await adminApi.patch(`/users/${userId}/status`, { status: newStatus });
      toast({ title: 'Success', description: `User status updated to ${newStatus}` });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminApi.delete(`/users/${userId}`);
      toast({ title: 'Success', description: 'User deleted successfully' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };


  // Show error state if there's an authentication issue
  if (error && (error.includes('Authentication') || error.includes('Access denied'))) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Users Management</h2>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Demo Admin Credentials:</h4>
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> superadmin@wheelyfix.com<br />
                  <strong>Password:</strong> ChangeMe123!
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/admin/login'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Admin Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="text-sm text-muted-foreground">
          Total users: {totalUsers}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {safeUsers.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Contact</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {user.role === 'admin' || user.role === 'superadmin' || user.role === 'manager' ? (
                                  <ShieldCheck className="h-5 w-5 text-primary" />
                                ) : (
                                  <User className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.name || 'Unnamed User'}</div>
                            <div className="text-sm text-muted-foreground">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm">{user.email}</div>
                          <div className="text-sm text-muted-foreground">{user.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user._id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="superadmin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Select
                          value={user.status}
                          onValueChange={(value) => updateUserStatus(user._id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        {user.lastLogin && (
                          <div className="text-xs text-muted-foreground">
                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalUsers}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {safeUsers.filter(u => u.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {safeUsers.filter(u => ['admin', 'manager', 'superadmin'].includes(u.role)).length}
              </div>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {safeUsers.filter(u => u.role === 'customer').length}
              </div>
              <p className="text-sm text-muted-foreground">Customers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;