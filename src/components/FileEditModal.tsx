import { useState, useEffect } from 'react'
import { filesApi } from '../lib/api'
import { toast } from 'react-hot-toast'

interface FileEditModalProps {
    isOpen: boolean
    onClose: () => void
    file: any
    onSuccess: () => void
}

export default function FileEditModal({ isOpen, onClose, file, onSuccess }: FileEditModalProps) {
    const [name, setName] = useState('')
    const [year, setYear] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (file) {
            setName(file.name || '')
            setYear(file.year?.toString() || '')
        }
    }, [file])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !year) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            setLoading(true)
            await filesApi.update(file._id, { name, year: Number(year) })
            toast.success('File updated successfully')
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Error updating file:', error)
            toast.error(error.response?.data?.message || 'Failed to update file')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                {/* Modal content */}
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 w-full">
                    <div className="absolute right-0 top-0 pr-4 pt-4 block">
                        <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start w-full">
                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                            <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                                Edit File Details
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="File Name"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        placeholder="Year"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
