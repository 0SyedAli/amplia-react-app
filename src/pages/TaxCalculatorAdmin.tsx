import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxCategoryApi } from '../lib/api';
import { toast } from 'react-hot-toast';

interface TaxCategory {
    _id: string;
    name: string;
    year: number;
    rate: number;
    taxType: 'Salary' | 'Business';
    filerStatus: 'Filer' | 'Non-Filer';
    description?: string;
}

export default function TaxCalculatorAdmin() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TaxCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        rate: 0,
        taxType: 'Salary',
        filerStatus: 'Filer',
        description: ''
    });

    const { data: categories, isLoading } = useQuery({
        queryKey: ['tax-categories'],
        queryFn: () => taxCategoryApi.getAll()
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => taxCategoryApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-categories'] });
            toast.success('Category created successfully');
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => taxCategoryApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-categories'] });
            toast.success('Category updated successfully');
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => taxCategoryApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-categories'] });
            toast.success('Category deleted');
        }
    });

    const openModal = (category?: TaxCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                year: category.year,
                rate: category.rate,
                taxType: category.taxType || 'Salary',
                filerStatus: category.filerStatus || 'Filer',
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                year: new Date().getFullYear(),
                rate: 0,
                taxType: 'Salary',
                filerStatus: 'Filer',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Tax Calculator Categories</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-primary-500 text-white px-4 py-2 rounded shadow hover:bg-primary-600"
                >
                    + Add Category
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Year</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Type</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Rate (%)</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : categories?.data?.data?.map((cat: TaxCategory) => (
                            <tr key={cat._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{cat.name}</td>
                                <td className="px-6 py-4">{cat.year}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.taxType === 'Business' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {cat.taxType}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.filerStatus === 'Filer' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {cat.filerStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-primary-600">{cat.rate}%</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => openModal(cat)} className="text-blue-500 hover:text-blue-700">Edit</button>
                                    <button onClick={() => {
                                        if (confirm('Are you sure?')) deleteMutation.mutate(cat._id);
                                    }} className="text-red-500 hover:text-red-700">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full mt-1 p-2 border rounded"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Year</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full mt-1 p-2 border rounded"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        className="w-full mt-1 p-2 border rounded"
                                        value={formData.rate}
                                        onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tax Type</label>
                                    <input
                                        list="taxTypes"
                                        className="w-full mt-1 p-2 border rounded"
                                        value={formData.taxType}
                                        onChange={e => setFormData({ ...formData, taxType: e.target.value })}
                                        placeholder="e.g. Salary, Business"
                                    />
                                    <datalist id="taxTypes">
                                        <option value="Salary" />
                                        <option value="Business" />
                                        <option value="Freelance" />
                                        <option value="Corporate" />
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Filer Status</label>
                                    <select
                                        className="w-full mt-1 p-2 border rounded"
                                        value={formData.filerStatus}
                                        onChange={e => setFormData({ ...formData, filerStatus: e.target.value as any })}
                                    >
                                        <option value="Filer">Filer</option>
                                        <option value="Non-Filer">Non-Filer</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    className="w-full mt-1 p-2 border rounded"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                                <button
                                    type="submit"
                                    className="bg-primary-500 text-white px-6 py-2 rounded hover:bg-primary-600"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
