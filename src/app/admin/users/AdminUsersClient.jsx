'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Mail, 
  Calendar,
  MoreVertical,
  ShieldAlert,
  LogOut,
  Users as UsersIcon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AdminUsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, disabled
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null);

  const searchParams = useSearchParams();
  const [highlightedId, setHighlightedId] = useState(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      // Set highlight immediately
      setHighlightedId(id);
      
      // Delay scroll slightly to ensure table is rendered
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(`user-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Remove highlight after 3 seconds
      const clearTimer = setTimeout(() => {
        setHighlightedId(null);
      }, 3000);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [searchParams]);

  const filteredUsers = useMemo(() => {
    let result = users;

    if (statusFilter !== 'all') {
      result = result.filter(user => (statusFilter === 'active' ? !user.disabled : user.disabled));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [users, searchQuery, statusFilter]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleUserAction = async (user, updateData) => {
    setLoadingId(user._id);
    
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (data.success) {
        if (typeof updateData.disabled === 'boolean') {
          setUsers(prev => prev.map(u => u._id === user._id ? { ...u, disabled: updateData.disabled } : u));
          toast.success(`User ${updateData.disabled ? 'disabled' : 'enabled'} successfully`);
        } else if (updateData.action === 'force-logout') {
          toast.success(`User logged out from all devices`);
        }
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (error) {
      toast.error('An error occurred during user action');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">User Management</h1>
          <p className="text-muted-foreground">View and manage registered users for your store.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="surface-card border-none bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary/70">Total Users</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{users.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-primary/60">
              <UsersIcon className="size-3" />
              <span>All registered accounts</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="surface-card border-none bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-600/70">Active Users</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">
              {users.filter(u => !u.disabled).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-emerald-600/60">
              <UserCheck className="size-3" />
              <span>Allowed to login</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card border-none bg-red-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-600/70">Disabled Users</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-600">
              {users.filter(u => u.disabled).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-red-600/60">
              <UserX className="size-3" />
              <span>Blocked from login</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="disabled">Disabled Only</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 px-3 gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow 
                  key={user._id} 
                  id={`user-${user._id}`}
                  className={cn(
                    "transition-all duration-700",
                    highlightedId === user._id ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/30"
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground flex items-center gap-2">
                          {user.name}
                          {highlightedId === user._id && (
                            <Badge className="h-4 px-1 text-[10px] uppercase tracking-wider bg-primary text-primary-foreground animate-pulse">New</Badge>
                          )}
                        </span>
                        {user.phone && (
                          <span className="text-xs text-muted-foreground">{user.phone}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-3" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-3" />
                      <span suppressHydrationWarning>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.disabled ? (
                      <Badge variant="destructive" className="flex w-fit items-center gap-1 font-bold">
                        <UserX className="size-3" />
                        Disabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex w-fit items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500 font-bold">
                        <UserCheck className="size-3" />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className={user.disabled ? "text-emerald-600 focus:text-emerald-600" : "text-destructive focus:text-destructive"}
                            onClick={() => handleUserAction(user, { disabled: !user.disabled })}
                            disabled={loadingId === user._id}
                          >
                            {user.disabled ? (
                              <><UserCheck className="mr-2 size-4" /> Enable User</>
                            ) : (
                              <><UserX className="mr-2 size-4" /> Disable User</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUserAction(user, { action: 'force-logout' })}
                            disabled={loadingId === user._id || user.disabled}
                          >
                            <LogOut className="mr-2 size-4" /> Force Logout
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-muted p-3 text-muted-foreground">
                      <Search className="size-6" />
                    </div>
                    <p className="font-medium">No users found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search terms.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
            </span>{' '}
            of <span className="font-medium text-foreground">{filteredUsers.length}</span> users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="size-9 font-medium"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 flex items-start gap-4">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-700 flex-shrink-0">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <h4 className="font-bold text-amber-800">Security Note</h4>
          <p className="text-sm text-amber-700 mt-1 leading-relaxed">
            Disabling a user will prevent them from signing in to their account. If the user is currently logged in, they will be blocked upon their next authentication request. This action is manually reversible at any time by an administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
