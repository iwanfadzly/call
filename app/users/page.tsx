'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react'
import { AddUserModal } from '@/components/modals/add-user-modal'
import { EditUserModal } from '@/components/modals/edit-user-modal'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER'
  createdAt: string
  lastLogin?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        // Mock data for now
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'Iwan Fadzly',
            email: 'iwanfadzly@gmail.com',
            role: 'ADMIN',
            createdAt: new Date().toISOString()
          }
        ]
        setUsers(mockUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Mock data fallback
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Iwan Fadzly',
          email: 'iwanfadzly@gmail.com',
          role: 'ADMIN',
          createdAt: new Date().toISOString()
        }
      ]
      setUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchUsers() // Refresh the list
      } else {
        console.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'AGENT': return 'bg-green-100 text-green-800'
      case 'VIEWER': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found matching your search.</p>
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={fetchUsers}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUserUpdated={fetchUsers}
        user={selectedUser}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description="Are you sure you want to delete this user? This will permanently remove the user and all associated data."
        itemName={selectedUser?.name || ''}
      />
    </div>
  )
}
