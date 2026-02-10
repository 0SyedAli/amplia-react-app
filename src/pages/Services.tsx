import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { servicesApi, categoriesApi, getImageUrl } from '../lib/api'

export default function Services() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: 'monthly',
    categoryId: '',
    isActive: true,
    plans: 'standard',
  })

  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', searchQuery, selectedCategory],
    queryFn: () => servicesApi.getAll(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      handleCloseModal()
      toast.success('Service created successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create service')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      handleCloseModal()
      toast.success('Service updated successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update service')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete service')
    }
  })

  const handleOpenModal = (service: any = null) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: String(service.price || ''),
        billingCycle: service.billingCycle || 'monthly',
        categoryId: service.category?._id || service.category || '',
        isActive: service.isActive !== false,
        plans: typeof service.plans === 'string' ? service.plans : 'standard',
      })


      setFeatures(service.features || [])
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        billingCycle: 'monthly',
        categoryId: '',
        isActive: true,
        plans: 'standard',
      })
      setFeatures([])
    }
    setCoverFile(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()])
      setFeatureInput('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formDataToSubmit = new FormData()
    formDataToSubmit.append('name', formData.name)
    formDataToSubmit.append('description', formData.description)
    formDataToSubmit.append('price', formData.price)
    formDataToSubmit.append('billingCycle', formData.billingCycle)
    formDataToSubmit.append('category', formData.categoryId)
    formDataToSubmit.append('isActive', String(formData.isActive))
    formDataToSubmit.append('features', JSON.stringify(features))
    formDataToSubmit.append('plans', formData.plans)

    if (coverFile) formDataToSubmit.append('cover', coverFile)

    if (editingService) {
      updateMutation.mutate({ id: editingService._id, data: formDataToSubmit })
    } else {
      createMutation.mutate(formDataToSubmit)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id)
    }
  }

  const filteredServices = servicesData?.data?.services?.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? (s.category?._id === selectedCategory || s.category === selectedCategory) : true
    return matchesSearch && matchesCategory
  }) || []

  const categories = categoriesData?.data?.categories || []

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Services</h1>
          <p className="text-gray-500 mt-1">Manage all available services and plans</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          + Add New Service
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search services..."
            className="input w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="input w-full"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse h-64 bg-gray-100"></div>
          ))
        ) : filteredServices.map((service: any) => (
          <div key={service._id} className="card hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center overflow-hidden border">
                  {service.cover ? (
                    <img src={getImageUrl(service.cover, 'cover')} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-600 font-bold text-lg">{service.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{service.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border">
                    {service.category?.name || 'No Category'}
                  </span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {service.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
              {service.description || 'No description available for this service.'}
            </p>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium uppercase">
                  {typeof service.plans === 'string' ? service.plans : (Array.isArray(service.plans) ? service.plans[0]?.name : (typeof service.plans === 'object' ? (service.plans as any)?.name : 'standard'))}
                </span>
                <span className="font-bold text-primary-600">

                  $ {service.price} <span className="text-[10px] font-normal text-gray-400">/{service.billingCycle}</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal(service)}
                className="btn-secondary flex-1 text-xs py-2"
              >
                Edit Details
              </button>
              <button
                onClick={() => handleDelete(service._id)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        ))}

        {!servicesLoading && filteredServices.length === 0 && (
          <div className="col-span-full py-20 text-center card bg-gray-50">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <i className="fas fa-search fa-2x"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingService ? 'Edit Service' : 'Create New Service'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times fa-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name *</label>
                    <input
                      type="text"
                      required
                      className="input w-full"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      className="input w-full"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        required
                        className="input w-full"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Cycle *</label>
                      <select
                        className="input w-full"
                        value={formData.billingCycle}
                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Plan *</label>
                    <select
                      required
                      className="input w-full"
                      value={formData.plans}
                      onChange={(e) => setFormData({ ...formData, plans: e.target.value })}
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      className="input w-full h-24 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image</label>
                    <div className="mt-1 flex items-center gap-4">
                      {(coverFile || editingService?.cover) && (
                        <div className="w-20 h-20 rounded-lg border overflow-hidden shrink-0">
                          <img
                            src={coverFile ? URL.createObjectURL(coverFile) : getImageUrl(editingService?.cover, 'cover')}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Features</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder="Add feature..."
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border text-sm">
                          <span className="truncate flex-1">{feature}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="text-red-400 hover:text-red-600 px-2"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.isActive}
                          onChange={() => setFormData({ ...formData, isActive: true })}
                        />
                        <span className="text-sm">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!formData.isActive}
                          onChange={() => setFormData({ ...formData, isActive: false })}
                        />
                        <span className="text-sm">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-200"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
