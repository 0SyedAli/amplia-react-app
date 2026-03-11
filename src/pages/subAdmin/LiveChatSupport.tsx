import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { chatApi } from '../../lib/api';
import { io, Socket } from 'socket.io-client';
import LiveChatModal from '../../components/LiveChatModal';

const API_BASE_URL = "https://apiforapp.link/Amplia/";

export default function LiveChatSupport() {
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const currentSubAdminId = localStorage.getItem('userId');

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['liveChats'],
        queryFn: () => chatApi.getAll(),
        refetchInterval: 10000, // Poll every 10s as backup
    });

    const joinMutation = useMutation({
        mutationFn: (chatId: string) => chatApi.join(chatId),
        onSuccess: () => {
            refetch();
        },
    });

    const leaveMutation = useMutation({
        mutationFn: (chatId: string) => chatApi.leave(chatId),
        onSuccess: () => {
            refetch();
        },
    });

    // Socket connection for real-time updates
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const socket = io(API_BASE_URL, {
            transports: ['websocket'],
            auth: { token },
        });
        socketRef.current = socket;

        socket.on('new_chat', () => {
            refetch();
        });

        socket.on('chat_updated', () => {
            refetch();
        });

        socket.on('subadmin_joined', () => {
            refetch();
        });

        socket.on('subadmin_left', () => {
            refetch();
        });

        return () => {
            socket.disconnect();
        };
    }, [refetch]);

    const handleJoinChat = (chatId: string) => {
        joinMutation.mutate(chatId);
    };

    const handleLeaveChat = (chatId: string) => {
        leaveMutation.mutate(chatId);
    };

    const handleOpenChat = (chat: any) => {
        setSelectedChat(chat);
        setIsChatModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolved':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card bg-red-50 text-red-700">
                <p>Error loading chats. Please try again.</p>
            </div>
        );
    }

    const chats = data?.data?.chats || [];
    const liveChats = chats.filter((c: any) => !c.booking); // Live chats are those without a booking

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Live Chat Support</h1>
                <p className="text-gray-600">{liveChats.length} live chats</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {['pending', 'active', 'resolved'].map((status) => {
                    const count = liveChats.filter((c: any) => c.status?.toLowerCase() === status).length;
                    return (
                        <div key={status} className="card">
                            <p className="text-gray-600 text-sm capitalize">{status === 'pending' ? 'Waiting' : status}</p>
                            <p className="text-2xl font-bold text-gray-800">{count}</p>
                        </div>
                    );
                })}
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left p-3">User</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Handled By</th>
                                <th className="text-left p-3">Started</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liveChats.map((chat: any) => {
                                const activeSubAdminId = typeof chat.activeSubAdmin === 'object' ? chat.activeSubAdmin?._id : chat.activeSubAdmin;
                                const isOwner = activeSubAdminId === currentSubAdminId;
                                const isLocked = chat.activeSubAdmin && !isOwner;

                                return (
                                    <tr key={chat._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">
                                            <div>
                                                <p className="font-medium">{chat.user?.firstName} {chat.user?.lastName}</p>
                                                <p className="text-sm text-gray-500">{chat.user?.email || ''}</p>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(chat.status)}`}>
                                                {chat.status === 'pending' ? 'Waiting for response' : chat.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {chat.activeSubAdmin ? (
                                                <div className="flex items-center">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 ${isOwner ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                                                        {chat.activeSubAdmin.firstName?.[0] || 'A'}
                                                    </span>
                                                    {chat.activeSubAdmin.firstName} {chat.activeSubAdmin.lastName}
                                                    {isOwner && <span className="ml-2 text-xs text-green-600">(You)</span>}
                                                </div>
                                            ) : (
                                                <span className="text-yellow-600 italic">Not assigned - User waiting!</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-gray-600 text-sm">
                                            {new Date(chat.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                {/* View Chat */}
                                                <button
                                                    onClick={() => handleOpenChat(chat)}
                                                    className="text-primary-600 hover:text-primary-800"
                                                >
                                                    View Chat
                                                </button>

                                                {/* Join/Leave */}
                                                {chat.status !== 'resolved' && (
                                                    <>
                                                        {isOwner ? (
                                                            <button
                                                                onClick={() => handleLeaveChat(chat._id)}
                                                                className="text-red-600 hover:text-red-800 ml-2"
                                                                disabled={leaveMutation.isPending}
                                                            >
                                                                Leave
                                                            </button>
                                                        ) : !isLocked ? (
                                                            <button
                                                                onClick={() => handleJoinChat(chat._id)}
                                                                className="text-green-600 hover:text-green-800 ml-2"
                                                                disabled={joinMutation.isPending}
                                                            >
                                                                Join
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 ml-2 text-xs">Locked</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {liveChats.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No live chats at the moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Chat Modal */}
            {selectedChat && (
                <LiveChatModal
                    isOpen={isChatModalOpen}
                    onClose={() => {
                        setIsChatModalOpen(false);
                        setSelectedChat(null);
                    }}
                    chatId={selectedChat._id}
                    isReadOnly={(() => {
                        const activeSubAdminId = typeof selectedChat.activeSubAdmin === 'object' ? selectedChat.activeSubAdmin?._id : selectedChat.activeSubAdmin;
                        return !!activeSubAdminId && activeSubAdminId !== currentSubAdminId;
                    })()}
                />
            )}
        </div>
    );
}
