import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taxCategoryApi } from '../lib/api'
import { toast } from 'react-hot-toast'

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  base: number;
}

interface TaxCategory {
  _id: string;
  name: string;
  year: number;
  taxType: string;
  filerStatus: string;
  brackets: TaxBracket[];
  rate: number;
}

export default function TaxSettings() {
  const queryClient = useQueryClient()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [brackets, setBrackets] = useState<TaxBracket[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['tax-categories'],
    queryFn: () => taxCategoryApi.getAll(),
  });

  const categories = useMemo(() => categoriesResponse?.data?.data || [], [categoriesResponse?.data?.data]);

  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find((c: TaxCategory) => c._id === selectedCategoryId);
      if (category) {
        setBrackets(category.brackets || []);
      }
    } else {
      setBrackets([]);
    }
  }, [selectedCategoryId, categories]);

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, brackets: TaxBracket[] }) =>
      taxCategoryApi.update(data.id, { brackets: data.brackets }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-categories'] })
      setHasChanges(false)
      toast.success('Tax brackets updated successfully!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update tax brackets')
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading categories...</div>;

  const handleAddBracket = () => {
    const lastBracket = brackets[brackets.length - 1]
    const newMin = lastBracket ? lastBracket.max + 1 : 0
    setBrackets([...brackets, { min: newMin, max: newMin + 100000, rate: 0, base: 0 }])
    setHasChanges(true)
  }

  const handleRemoveBracket = (index: number) => {
    setBrackets(brackets.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const handleUpdateBracket = (index: number, field: keyof TaxBracket, value: number) => {
    const newBrackets = [...brackets]
    newBrackets[index] = { ...newBrackets[index], [field]: value }
    setBrackets(newBrackets)
    setHasChanges(true)
  }

  const selectedCategory = categories.find((c: TaxCategory) => c._id === selectedCategoryId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tax Brackets Configuration</h1>
        <p className="text-gray-600">Connect and manage progressive tax slabs for your categories.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Tax Category</label>
            <select
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-500"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">-- Choose a Category --</option>
              {categories.map((cat: TaxCategory) => (
                <option key={cat._id} value={cat._id}>
                  {cat.year} - {cat.name} ({cat.taxType} / {cat.filerStatus})
                </option>
              ))}
            </select>
          </div>
          {hasChanges && selectedCategoryId && (
            <button
              onClick={() => updateMutation.mutate({ id: selectedCategoryId, brackets })}
              disabled={updateMutation.isPending}
              className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {selectedCategory ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selectedCategory.name} Slots</h2>
              <p className="text-sm text-gray-500">Configure progressive brackets (Annual Income)</p>
            </div>
            <button
              onClick={handleAddBracket}
              className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors"
            >
              + Add Slice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4 text-center">Min Income</th>
                  <th className="px-6 py-4 text-center">Max Income</th>
                  <th className="px-6 py-4 text-center">Tax Rate (%)</th>
                  <th className="px-6 py-4 text-center">Fixed Amount (Base)</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {brackets.map((bracket, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        className="w-full p-2 border rounded focus:ring-1 focus:ring-primary-400 text-center"
                        value={bracket.min}
                        onChange={(e) => handleUpdateBracket(index, 'min', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        className="w-full p-2 border rounded focus:ring-1 focus:ring-primary-400 text-center"
                        value={bracket.max}
                        onChange={(e) => handleUpdateBracket(index, 'max', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative max-w-[100px] mx-auto">
                        <input
                          type="number"
                          step="0.1"
                          className="w-full p-2 border rounded pr-8 text-center"
                          value={bracket.rate}
                          onChange={(e) => handleUpdateBracket(index, 'rate', Number(e.target.value))}
                        />
                        <span className="absolute right-3 top-2 text-gray-400">%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        className="w-full p-2 border rounded text-center"
                        value={bracket.base}
                        onChange={(e) => handleUpdateBracket(index, 'base', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemoveBracket(index)}
                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {brackets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      No brackets defined. This category will use its flat rate ({selectedCategory.rate}%).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-blue-50 border-t">
            <h3 className="font-semibold text-blue-800 mb-2">Bracket Logic Guide</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Min/Max Income:</strong> Defined for Annual Income.</li>
              <li>• <strong>Tax Rate:</strong> Percentage applied to income <em>above</em> the Min Income.</li>
              <li>• <strong>Fixed Amount (Base):</strong> A static tax amount added to the percentage calculation.</li>
              <li>• <strong>Example:</strong> If a user makes 1.5M and bracket is 1M-2M at 10% with 50k base: <code>Tax = (1.5M - 1M) * 10% + 50k</code>.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed rounded-xl py-20 text-center">
          <p className="text-gray-500 font-medium">Please select a tax category from the dropdown to start configuring brackets.</p>
        </div>
      )}
    </div>
  )
}
