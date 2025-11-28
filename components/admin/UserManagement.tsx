
import React, { useState, useRef, useEffect } from 'react';
import type { User, ForumMessage, ContactMessage } from '../../types';
import { TrashIcon, NoSymbolIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface UserManagementProps {
    forumMessages: ForumMessage[];
    contactMessages: ContactMessage[];
    users: User[];
    actions: any;
}

export const UserManagement: React.FC<UserManagementProps> = ({ forumMessages, contactMessages, users, actions }) => {
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const adminUser = users.find(u => u.isAdmin);

    useEffect(() => {
        if (isChatModalOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [contactMessages, isChatModalOpen]);

    const deleteForumMessage = async (id: string) => {
        if (window.confirm('Supprimer ce message ?')) {
            await actions.deleteForumMessage(id);
        }
    };

    const banUser = (userId: string) => {
        alert(`L'utilisateur ${userId} a été banni (Simulation).`);
    };

    const usersWithContactMessages = users.filter(user => 
        !user.isAdmin && contactMessages.some(msg => msg.user.id === user.id)
    );

    const handleOpenChat = (user: User) => {
        setSelectedUser(user);
        setIsChatModalOpen(true);
    };

    const handleCloseChat = () => {
        setSelectedUser(null);
        setIsChatModalOpen(false);
        setReplyMessage('');
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedUser) return;

        const adminReply = {
            user: selectedUser,
            message: replyMessage,
            timestamp: new Date().toISOString(),
            isFromAdmin: true,
        };

        await actions.sendContactMessage(adminReply);
        setReplyMessage('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-bold mb-4">Gestion du Forum</h3>
                <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {forumMessages.map(msg => (
                        <div key={msg.id} className="p-2 border-b border-gray-700 flex justify-between items-start">
                            <div>
                                <p className="font-bold">{msg.user.name}</p>
                                <p className="text-sm text-gray-300">{msg.message}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => deleteForumMessage(msg.id)} className="p-2 text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
                                <button onClick={() => banUser(msg.user.id)} className="p-2 text-yellow-400 hover:text-yellow-300"><NoSymbolIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                     {forumMessages.length === 0 && <p className="text-gray-400 text-center p-4">Aucun message dans le forum.</p>}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold mb-4">Gestion du Chat Contact</h3>
                <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {usersWithContactMessages.map(user => {
                        const lastMessage = contactMessages
                            .filter(msg => msg.user.id === user.id)
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                        
                        return (
                             <div key={user.id} className="p-2 border-b border-gray-700">
                                <p className="font-bold">{user.name}</p>
                                <p className="text-sm text-gray-300 truncate">{lastMessage?.message || 'Aucun message'}</p>
                                <button onClick={() => handleOpenChat(user)} className="text-sm text-yellow-400 mt-1 hover:underline">Répondre</button>
                            </div>
                        )
                    })}
                     {usersWithContactMessages.length === 0 && <p className="text-gray-400 text-center p-4">Aucune conversation.</p>}
                </div>
            </div>
            
            {isChatModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg w-full max-w-lg h-[70vh] flex flex-col shadow-2xl">
                        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                            <h4 className="text-lg font-bold">Chat avec {selectedUser.name}</h4>
                            <button onClick={handleCloseChat} className="p-1 rounded-full hover:bg-gray-700">
                                <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                            </button>
                        </header>
                        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {contactMessages
                                .filter(msg => msg.user.id === selectedUser.id)
                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                .map(msg => (
                                    <div key={msg.id} className={`flex items-start gap-3 ${msg.isFromAdmin ? 'flex-row-reverse' : ''}`}>
                                        <img 
                                            src={msg.isFromAdmin ? adminUser?.profilePictureUrl : selectedUser.profilePictureUrl} 
                                            alt={msg.isFromAdmin ? adminUser?.name : selectedUser.name}
                                            className="w-10 h-10 rounded-full object-cover" 
                                        />
                                        <div className={`p-3 rounded-xl max-w-xs ${msg.isFromAdmin ? 'bg-green-700' : 'bg-gray-700'}`}>
                                            <p className="text-white">{msg.message}</p>
                                            <span className="text-xs text-gray-300 block text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                ))
                            }
                             <div ref={chatEndRef} />
                        </main>
                        <footer className="p-4 border-t border-gray-700 flex-shrink-0">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                                    placeholder="Répondre..."
                                    className="flex-grow bg-gray-700 border-gray-600 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <button onClick={handleSendReply} className="p-3 bg-green-500 rounded-full text-white hover:bg-green-600 transition">
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};
