import { useState, useEffect } from 'react'
import { filesApi, getImageUrl } from '../../lib/api'
import { toast } from 'react-hot-toast'
import BookingFilesModal from '../../components/BookingFilesModal'
import FileEditModal from '../../components/FileEditModal'

const topTabsData = [
    { id: 1, title: 'All' },
    { id: 2, title: '2021' },
    { id: 3, title: '2022' },
    { id: 4, title: '2023' },
    { id: 5, title: '2024' },
    { id: 6, title: '2025' },
    { id: 7, title: '2026' },
];

export default function FilesManagement() {
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedTab, setSelectedTab] = useState('All')
    const [search, setSearch] = useState('')

    // Modals
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<any>(null)

    useEffect(() => {
        fetchFiles()
    }, [selectedTab, search])

    const fetchFiles = async () => {
        try {
            setLoading(true)
            const params: any = {}
            if (selectedTab !== 'All') params.year = selectedTab
            if (search) params.search = search

            const res = await filesApi.getAll(params)
            setFiles(res.data.files || [])
        } catch (error) {
            console.error('Error fetching files:', error)
            toast.error('Failed to load files')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return
        try {
            await filesApi.delete(id)
            toast.success('File deleted successfully')
            fetchFiles()
        } catch (error) {
            console.error('Error deleting file:', error)
            toast.error('Failed to delete file')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Files Management</h1>
                <button
                    onClick={() => setUploadModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Global File
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
                    {topTabsData.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.title)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedTab === tab.title
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left p-4">File Name</th>
                                <th className="text-left p-4">Year</th>
                                <th className="text-left p-4">Linked To</th>
                                <th className="text-left p-4">Date Uploaded</th>
                                <th className="text-left p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : files.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-gray-500">
                                        No files found
                                    </td>
                                </tr>
                            ) : (
                                files.map((file: any) => (
                                    <tr key={file._id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                                </svg>
                                                <span className="font-medium text-gray-900">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{file.year}</td>
                                        <td className="p-4">
                                            {file.booking ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Booking: {file.booking._id?.slice(-8).toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Global
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <a
                                                    href={getImageUrl(file.url, 'file')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="View"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setSelectedFile(file)
                                                        setEditModalOpen(true)
                                                    }}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <BookingFilesModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                bookingId="" // Empty for global files
            />

            {selectedFile && (
                <FileEditModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false)
                        setSelectedFile(null)
                    }}
                    file={selectedFile}
                    onSuccess={fetchFiles}
                />
            )}
        </div>
    )
}
