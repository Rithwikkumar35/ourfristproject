import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Send, User } from 'lucide-react';

interface ChatRoom {
  id: string;
  loser_id: string;
  finder_id: string;
  created_at: string;
  lost_items?: {
    title: string;
  };
  found_items?: {
    title: string;
  };
  loser_profile?: {
    full_name: string;
  };
  finder_profile?: {
    full_name: string;
  };
}

interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export default function Chat() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      const subscription = supabase
        .channel(`chat:${selectedRoom.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `chat_room_id=eq.${selectedRoom.id}`,
          },
          (payload) => {
            fetchMessages(selectedRoom.id);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          lost_items (
            title
          ),
          found_items (
            title
          ),
          loser_profile:profiles!chat_rooms_loser_id_fkey (
            full_name
          ),
          finder_profile:profiles!chat_rooms_finder_id_fkey (
            full_name
          )
        `)
        .or(`loser_id.eq.${user.id},finder_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatRooms(data || []);
      if (data && data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRoom || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        chat_room_id: selectedRoom.id,
        sender_id: user.id,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      alert('Error sending message: ' + error.message);
    }
  };

  const getOtherPersonName = (room: ChatRoom) => {
    if (user?.id === room.loser_id) {
      return room.finder_profile?.full_name || 'Finder';
    }
    return room.loser_profile?.full_name || 'Owner';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
        <div className="flex h-full">
          <div className="w-1/3 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Chats</h2>
            </div>

            <div className="divide-y">
              {chatRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                    selectedRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {getOtherPersonName(room)}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {room.lost_items?.title || 'Chat'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {chatRooms.length === 0 && (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No chats yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Accept a notification to start chatting
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white">
            {selectedRoom ? (
              <>
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherPersonName(selectedRoom)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        About: {selectedRoom.lost_items?.title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-semibold mb-1 opacity-75">
                              {message.profiles?.full_name}
                            </p>
                          )}
                          <p className="break-words">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-blue-100' : 'text-gray-600'
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

    
