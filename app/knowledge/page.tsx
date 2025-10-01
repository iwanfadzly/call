'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, BookOpen, Brain, Upload, FileText } from 'lucide-react'
import { AddKnowledgeModal } from '@/components/modals/add-knowledge-modal'
import { EditKnowledgeModal } from '@/components/modals/edit-knowledge-modal'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'

interface KnowledgeItem {
  id: string
  title: string
  content: string
  type: 'PRODUCT' | 'FAQ' | 'SCRIPT' | 'TRAINING'
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeItem | null>(null)

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    try {
      const response = await fetch('/api/knowledge')
      if (response.ok) {
        const data = await response.json()
        setKnowledge(data)
      } else {
        // Mock data for now
        const mockKnowledge: KnowledgeItem[] = [
          {
            id: '1',
            title: 'Premium Sales Course - Product Information',
            content: 'Comprehensive sales training course designed for professionals. Includes 20+ modules covering prospecting, closing techniques, objection handling, and advanced sales psychology. Perfect for sales teams looking to increase conversion rates.',
            type: 'PRODUCT',
            tags: ['sales', 'training', 'course', 'premium'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'AI Sales Assistant - Features & Benefits',
            content: 'AI-powered sales assistant that helps automate lead qualification, follow-ups, and appointment scheduling. Uses advanced NLP to understand customer intent and provide personalized responses. Integrates with CRM systems.',
            type: 'PRODUCT',
            tags: ['ai', 'assistant', 'automation', 'crm'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Common Objections - How to Handle',
            content: 'Q: "Your price is too high" A: "I understand price is important. Let me show you the ROI calculation and how this investment will pay for itself within 3 months through increased sales efficiency."',
            type: 'FAQ',
            tags: ['objections', 'pricing', 'roi'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '4',
            title: 'Cold Calling Script - Opening',
            content: 'Hi [Name], this is [Your Name] from SalesCallerAI. I know you\'re busy, so I\'ll be brief. We help sales teams like yours increase their conversion rates by 40% using AI-powered calling assistance. Do you have 30 seconds for me to explain how?',
            type: 'SCRIPT',
            tags: ['cold-calling', 'opening', 'script'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '5',
            title: 'Product Demo Best Practices',
            content: 'Always start with discovery questions. Understand their pain points before showing features. Focus on benefits, not features. Use their specific use case in the demo. End with clear next steps.',
            type: 'TRAINING',
            tags: ['demo', 'best-practices', 'training'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        setKnowledge(mockKnowledge)
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error)
      // Mock data fallback
      const mockKnowledge: KnowledgeItem[] = [
        {
          id: '1',
          title: 'Premium Sales Course - Product Information',
          content: 'Comprehensive sales training course designed for professionals. Includes 20+ modules covering prospecting, closing techniques, objection handling, and advanced sales psychology. Perfect for sales teams looking to increase conversion rates.',
          type: 'PRODUCT',
          tags: ['sales', 'training', 'course', 'premium'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'AI Sales Assistant - Features & Benefits',
          content: 'AI-powered sales assistant that helps automate lead qualification, follow-ups, and appointment scheduling. Uses advanced NLP to understand customer intent and provide personalized responses. Integrates with CRM systems.',
          type: 'PRODUCT',
          tags: ['ai', 'assistant', 'automation', 'crm'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Common Objections - How to Handle',
          content: 'Q: "Your price is too high" A: "I understand price is important. Let me show you the ROI calculation and how this investment will pay for itself within 3 months through increased sales efficiency."',
          type: 'FAQ',
          tags: ['objections', 'pricing', 'roi'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Cold Calling Script - Opening',
          content: 'Hi [Name], this is [Your Name] from SalesCallerAI. I know you\'re busy, so I\'ll be brief. We help sales teams like yours increase their conversion rates by 40% using AI-powered calling assistance. Do you have 30 seconds for me to explain how?',
          type: 'SCRIPT',
          tags: ['cold-calling', 'opening', 'script'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          title: 'Product Demo Best Practices',
          content: 'Always start with discovery questions. Understand their pain points before showing features. Focus on benefits, not features. Use their specific use case in the demo. End with clear next steps.',
          type: 'TRAINING',
          tags: ['demo', 'best-practices', 'training'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setKnowledge(mockKnowledge)
    } finally {
      setLoading(false)
    }
  }

  const handleEditKnowledge = (item: KnowledgeItem) => {
    setSelectedKnowledge(item)
    setShowEditModal(true)
  }

  const handleDeleteKnowledge = (item: KnowledgeItem) => {
    setSelectedKnowledge(item)
    setShowDeleteModal(true)
  }

  const confirmDeleteKnowledge = async () => {
    if (!selectedKnowledge) return

    try {
      const response = await fetch(`/api/knowledge/${selectedKnowledge.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchKnowledge() // Refresh the list
      } else {
        console.error('Failed to delete knowledge item')
      }
    } catch (error) {
      console.error('Error deleting knowledge item:', error)
    }
  }

  const handleImport = () => {
    // Create a file input element
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt,.md,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Handle file import logic here
        console.log('Importing file:', file.name)
        // You can implement file reading and processing logic here
      }
    }
    input.click()
  }

  const filteredKnowledge = knowledge.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === 'ALL' || item.type === selectedType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PRODUCT': return <BookOpen className="h-4 w-4" />
      case 'FAQ': return <FileText className="h-4 w-4" />
      case 'SCRIPT': return <Edit className="h-4 w-4" />
      case 'TRAINING': return <Brain className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'PRODUCT': return 'bg-blue-100 text-blue-800'
      case 'FAQ': return 'bg-green-100 text-green-800'
      case 'SCRIPT': return 'bg-purple-100 text-purple-800'
      case 'TRAINING': return 'bg-orange-100 text-orange-800'
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
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-gray-600 mt-2">Train AI with product information, scripts, and FAQs</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleImport}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Knowledge
          </Button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Types</option>
          <option value="PRODUCT">Products</option>
          <option value="FAQ">FAQs</option>
          <option value="SCRIPT">Scripts</option>
          <option value="TRAINING">Training</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredKnowledge.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(item.type)}
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <Badge className={getTypeBadgeColor(item.type)}>
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-3">{item.content}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditKnowledge(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteKnowledge(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredKnowledge.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No knowledge items found matching your search.</p>
        </div>
      )}

      {/* Modals */}
      <AddKnowledgeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onKnowledgeAdded={fetchKnowledge}
      />

      <EditKnowledgeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onKnowledgeUpdated={fetchKnowledge}
        knowledge={selectedKnowledge}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteKnowledge}
        title="Delete Knowledge Item"
        description="Are you sure you want to delete this knowledge item? This will permanently remove the knowledge and all associated data."
        itemName={selectedKnowledge?.title || ''}
      />
    </div>
  )
}
