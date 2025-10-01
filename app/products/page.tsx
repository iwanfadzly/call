'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Package, DollarSign } from 'lucide-react'
import { AddProductModal } from '@/components/modals/add-product-modal'
import { EditProductModal } from '@/components/modals/edit-product-modal'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'

interface Product {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  category: string
  isActive: boolean
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        // Mock data for now
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Premium Sales Course',
            sku: 'PSC-001',
            description: 'Comprehensive sales training course for professionals',
            price: 299.99,
            category: 'Training',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'AI Sales Assistant License',
            sku: 'ASA-002',
            description: 'Monthly license for AI-powered sales assistant',
            price: 99.99,
            category: 'Software',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Lead Generation Tool',
            sku: 'LGT-003',
            description: 'Advanced lead generation and management tool',
            price: 199.99,
            category: 'Software',
            isActive: false,
            createdAt: new Date().toISOString()
          }
        ]
        setProducts(mockProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      // Mock data fallback
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Sales Course',
          sku: 'PSC-001',
          description: 'Comprehensive sales training course for professionals',
          price: 299.99,
          category: 'Training',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'AI Sales Assistant License',
          sku: 'ASA-002',
          description: 'Monthly license for AI-powered sales assistant',
          price: 99.99,
          category: 'Software',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Lead Generation Tool',
          sku: 'LGT-003',
          description: 'Advanced lead generation and management tool',
          price: 199.99,
          category: 'Software',
          isActive: false,
          createdAt: new Date().toISOString()
        }
      ]
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProducts() // Refresh the list
      } else {
        console.error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your products, pricing, and inventory</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600">{product.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge className={product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-lg font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {product.price.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-500">Price</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product)}
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={fetchProducts}
      />

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onProductUpdated={fetchProducts}
        product={selectedProduct}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteProduct}
        title="Delete Product"
        description="Are you sure you want to delete this product? This will permanently remove the product and all associated data."
        itemName={selectedProduct?.name || ''}
      />
    </div>
  )
}
