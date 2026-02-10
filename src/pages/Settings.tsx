import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../lib/api'

interface Setting {
  _id: string
  key: string
  value: any
  description: string
  category: string
  updatedAt: string
}

export default function Settings() {
  const queryClient = useQueryClient()
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null)
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general',
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAllSettings(),
  })

  const upsertMutation = useMutation({
    mutationFn: (data: { key: string; value: any; description?: string; category?: string }) =>
      settingsApi.upsertSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setEditingSetting(null)
      setShowAddForm(false)
      setNewSetting({ key: '', value: '', description: '', category: 'general' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (key: string) => settingsApi.deleteSetting(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const handleSave = (setting: Setting) => {
    upsertMutation.mutate({
      key: setting.key,
      value: setting.value,
      description: setting.description,
      category: setting.category,
    })
  }

  const handleAdd = () => {
    let value = newSetting.value
    try {
      value = JSON.parse(newSetting.value)
    } catch {
      // Keep as string
    }
    upsertMutation.mutate({
      ...newSetting,
      value,
    })
  }

  const handleDelete = (key: string) => {
    if (confirm(`Are you sure you want to delete "${key}"?`)) {
      deleteMutation.mutate(key)
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
        <p>Error loading settings. Please try again.</p>
      </div>
    )
  }

  const settings = data?.data?.data || []

  // Group settings by category
  const groupedSettings: Record<string, Setting[]> = {}
  settings.forEach((setting: Setting) => {
    const category = setting.category || 'general'
    if (!groupedSettings[category]) {
      groupedSettings[category] = []
    }
    groupedSettings[category].push(setting)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">App Settings</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          + Add Setting
        </button>
      </div>

      {/* Add New Setting Form */}
      {showAddForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Setting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Key</label>
              <input
                type="text"
                className="input"
                placeholder="setting_key"
                value={newSetting.key}
                onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={newSetting.category}
                onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="tax">Tax</option>
                <option value="payment">Payment</option>
                <option value="notification">Notification</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Value (JSON or string)</label>
              <textarea
                className="input h-24"
                placeholder='{"key": "value"} or simple string'
                value={newSetting.value}
                onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <input
                type="text"
                className="input"
                placeholder="Description of this setting"
                value={newSetting.description}
                onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleAdd} className="btn-primary">
              Save Setting
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Settings List by Category */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <div key={category} className="card mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 capitalize">
            {category} Settings
          </h2>
          <div className="space-y-4">
            {categorySettings.map((setting) => (
              <div key={setting._id} className="border rounded-lg p-4">
                {editingSetting?._id === setting._id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {setting.key}
                      </span>
                    </div>
                    <textarea
                      className="input h-24"
                      value={
                        typeof editingSetting.value === 'object'
                          ? JSON.stringify(editingSetting.value, null, 2)
                          : String(editingSetting.value)
                      }
                      onChange={(e) => {
                        let value = e.target.value
                        try {
                          value = JSON.parse(e.target.value)
                        } catch {
                          // Keep as string
                        }
                        setEditingSetting({ ...editingSetting, value })
                      }}
                    />
                    <input
                      type="text"
                      className="input"
                      value={editingSetting.description}
                      onChange={(e) => setEditingSetting({ ...editingSetting, description: e.target.value })}
                      placeholder="Description"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(editingSetting)}
                        className="btn-primary"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSetting(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {setting.key}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {setting.description || 'No description'}
                      </p>
                      <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto max-h-24">
                        {typeof setting.value === 'object'
                          ? JSON.stringify(setting.value, null, 2)
                          : String(setting.value)}
                      </pre>
                      <p className="text-gray-400 text-xs mt-2">
                        Last updated: {new Date(setting.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingSetting(setting)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </button>
                      {setting.key !== 'tax_brackets' && (
                        <button
                          onClick={() => handleDelete(setting.key)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(groupedSettings).length === 0 && (
        <div className="card text-center text-gray-500">
          No settings found. Click "Add Setting" to create one.
        </div>
      )}
    </div>
  )
}
