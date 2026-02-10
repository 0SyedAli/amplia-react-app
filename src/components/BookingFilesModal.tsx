import { useState, useEffect } from 'react'
import { filesApi, getImageUrl } from '../lib/api'
import { toast } from 'react-hot-toast'

interface BookingFilesModalProps {
    isOpen: boolean
    onClose: () => void
    bookingId: string
}

export default function BookingFilesModal({ isOpen, onClose, bookingId }: BookingFilesModalProps) {
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [newFileName, setNewFileName] = useState('')
    const [newFileYear, setNewFileYear] = useState(new Date().getFullYear().toString())
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchFiles()
        }
    }, [isOpen, bookingId])

    const fetchFiles = async () => {
        try {
            setLoading(true)
            const res = bookingId
                ? await filesApi.getByBookingId(bookingId)
                : await filesApi.getAll()
            setFiles(res.data.files || [])
        } catch (error) {
            console.error('Error fetching files:', error)
            toast.error('Failed to load files')
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile) {
            toast.error('Please select a file')
            return
        }
        if (!newFileName) {
            toast.error('Please enter a file name')
            return
        }

        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('name', newFileName)
            formData.append('year', newFileYear)
            formData.append('bookingId', bookingId)

            await filesApi.upload(formData)
            toast.success('File uploaded successfully')

            // Reset form
            setNewFileName('')
            setSelectedFile(null)
            // Refresh list
            fetchFiles()
        } catch (error: any) {
            console.error('Error uploading file:', error)
            toast.error(error.response?.data?.message || 'Failed to upload file')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return

        try {
            await filesApi.delete(fileId)
            toast.success('File deleted')
            fetchFiles()
        } catch (error) {
            console.error('Error deleting file:', error)
            toast.error('Failed to delete file')
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                {/* Modal content */}
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 w-full">
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
                            <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                                {bookingId ? `Files for Booking: ${bookingId.slice(-8).toUpperCase()}` : 'Upload Global File'}
                            </h3>

                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Upload New File</h4>
                                <form onSubmit={handleUpload} className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            placeholder="File Name"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                        />
                                        <input
                                            type="number"
                                            value={newFileYear}
                                            onChange={(e) => setNewFileYear(e.target.value)}
                                            placeholder="Year"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            onChange={handleFileSelect}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                        />
                                        <button
                                            type="submit"
                                            disabled={uploading || !selectedFile}
                                            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 min-w-max"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files</h4>
                                {loading ? (
                                    <div className="text-center py-4">Loading...</div>
                                ) : files.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        No files uploaded yet
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                        {files.map((file) => (
                                            <li key={file._id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm hover:bg-gray-50">
                                                <div className="flex w-0 flex-1 items-center">
                                                    <svg className="h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                        <span className="truncate font-medium">{file.name}</span>
                                                        <span className="flex-shrink-0 text-gray-400">({file.year})</span>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex-shrink-0 flex items-center gap-4">
                                                    <a href={getImageUrl(file.url, 'file')} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-600 hover:text-primary-500">
                                                        View
                                                    </a>
                                                    <button onClick={() => handleDelete(file._id)} className="text-red-500 hover:text-red-700">
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
