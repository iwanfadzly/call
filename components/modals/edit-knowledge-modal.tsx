'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit, Loader2 } from 'lucide-react'

interface KnowledgeItem {
  id: string
  title: string
  content: string
  type: 'PRODUCT' | 'FAQ' | 'SCRIPT' | 'TRAINING'
  tags: string[]
}

interface EditKnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
  onKnowledgeUpdated: () => void
  knowledge: KnowledgeItem | null
}

export function EditKnowledgeModal({ isOpen, onClose, onKnowledgeUpdated, knowledge }: EditKnowledgeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'PRODUCT',
    tags: ''
  })

  useEffect(() => {
    if (knowledge) {
      setFormData({
        title: knowledge.title,
        content: knowledge.content,
        type: knowledge.type,
        tags: knowledge.tags.join(', ')
      })
    }
  }, [knowledge])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!knowledge) return

    setLoading(true)

    try {
      const response = await fetch(`/api/knowledge/${knowledge.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }),
      })

      if (response.ok) {
        onKnowledgeUpdated()
        onClose()
      } else {
        console.error('Failed to update knowledge item')
      }
    } catch (error) {
      console.error('Error updating knowledge item:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Knowledge Item
          </DialogTitle>
          <DialogDescription>
            Update knowledge content and information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter knowledge title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Product Information</SelectItem>
                  <SelectItem value="FAQ">FAQ</SelectItem>
                  <SelectItem value="SCRIPT">Sales Script</SelectItem>
                  <SelectItem value="TRAINING">Training Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the knowledge content..."
                rows={6}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Enter tags separated by commas (e.g., sales, training, ai)"
              />
              <p className="text-sm text-gray-500">Separate multiple tags with commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Knowledge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
