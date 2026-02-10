import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { categoriesApi, getImageUrl } from '../lib/api'

export default function Categories() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleCloseModal()
      toast.success('Category created successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create category')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleCloseModal()
      toast.success('Category updated successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update category')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    }
  })

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== false,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        isActive: true,
      })
    }
    setIconFile(null)
    setCoverFile(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formDataToSubmit = new FormData()
    formDataToSubmit.append('name', formData.name)
    formDataToSubmit.append('description', formData.description)
    formDataToSubmit.append('isActive', String(formData.isActive))

    if (iconFile) formDataToSubmit.append('icon', iconFile)
    if (coverFile) formDataToSubmit.append('cover', coverFile)

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: formDataToSubmit })
    } else {
      createMutation.mutate(formDataToSubmit)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This might fail if services are linked to it.')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 text-red-700">
        <p>Error loading categories. Please try again.</p>
      </div>
    )
  }

  const categories = data?.data?.categories || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          + Add Category
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Icon</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category: any) => (
                <tr key={category._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden border">
                      {category.icon ? (
                        <img src={getImageUrl(category.icon, 'icon')} alt={category.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-gray-400">No Icon</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{category.name}</td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">
                    {category.description || 'No description'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${category.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {category.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="text-primary-600 hover:text-primary-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    placeholder="Category Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="input w-full h-24 resize-none"
                    placeholder="Category Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="input w-full"
                    value={String(formData.isActive)}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon Image</label>
                    <div className="space-y-2">
                      {editingCategory?.icon && !iconFile && (
                        <div className="w-16 h-16 border rounded overflow-hidden">
                          <img src={getImageUrl(editingCategory.icon, 'icon')} alt="icon" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                        className="text-xs w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                    <div className="space-y-2">
                      {editingCategory?.cover && !coverFile && (
                        <div className="w-16 h-16 border rounded overflow-hidden">
                          <img src={getImageUrl(editingCategory.cover, 'cover')} alt="cover" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        className="text-xs w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
