import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '../lib/api';
import { toast } from 'react-hot-toast';

interface LiveChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
    isReadOnly?: boolean;
}

interface Message {
    _id: string;
    sender: {
        _id: string;
        firstName: string;
        lastName: string;
        profile?: string;
    };
    message: string;
    createdAt: string;
    seen: boolean;
}

const SOCKET_URL = "https://apiforapp.link";

export default function LiveChatModal({ isOpen, onClose, chatId, isReadOnly = false }: LiveChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatData, setChatData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserId = localStorage.getItem('userId');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        let currentSocket: Socket | null = null;

        const initChat = async () => {
            if (isOpen && chatId) {
                setIsLoading(true);
                try {
                    const res = await chatApi.getChat(chatId);
                    const chat = res.data.chat;
                    setChatData(chat);
                    setMessages(chat.messages || []);

                    // Initialize Socket
                    currentSocket = io(SOCKET_URL, {
                        path: "/socket.io",
                        transports: ["websocket"],
                    });
                    socketRef.current = currentSocket;

                    currentSocket.on('connect', () => {
                        console.log('Connected to socket');
                        currentSocket?.emit('join_room', chat._id);
                    });

                    currentSocket.on('new_message', (message: Message) => {
                        setMessages((prev) => {
                            // If this is my message, check if we already have an optimistic version
                            if (message.sender?._id === currentUserId) {
                                const optimisticIndex = prev.findIndex(m => (m as any).isOptimistic && m.message === message.message);
                                if (optimisticIndex !== -1) {
                                    const updatedMessages = [...prev];
                                    updatedMessages[optimisticIndex] = message;
                                    return updatedMessages;
                                }
                            }

                            if (prev.some(m => m._id === message._id)) return prev;
                            return [...prev, message];
                        });
                    });

                } catch (error) {
                    console.error("Error loading chat:", error);
                    toast.error("Failed to load chat");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        initChat();

        return () => {
            if (currentSocket) {
                currentSocket.disconnect();
            }
        };
    }, [isOpen, chatId, currentUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !chatId || isReadOnly) return;

        // Optimistic Update
        const optimisticMsg: any = {
            _id: `temp-${Date.now()}`,
            sender: {
                _id: currentUserId,
                firstName: '...',
                lastName: '...',
            },
            message: text,
            createdAt: new Date().toISOString(),
            seen: false,
            isOptimistic: true,
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');

        try {
            const formData = new FormData();
            formData.append('message', text);

            await chatApi.sendMessage(chatId, formData);
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
            setNewMessage(text);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-full max-w-md h-[600px] flex flex-col shadow-xl">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                {chatData?.user?.firstName?.[0] || 'U'}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold">{chatData?.user?.firstName} {chatData?.user?.lastName}</h3>
                            <p className="text-xs text-gray-500">
                                {isReadOnly && <span className="text-orange-500">Read-only mode</span>}
                                {!isReadOnly && <span className="text-green-500">You are the active handler</span>}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isOwn = msg.sender._id === currentUserId;
                            return (
                                <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-lg p-3 ${isOwn ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'
                                        }`}>
                                        <p>{msg.message}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {isReadOnly ? (
                    <div className="p-4 border-t bg-gray-100 rounded-b-lg text-center text-gray-500">
                        <p>This chat is being handled by another subadmin.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
