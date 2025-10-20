import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, MapPin, Calendar, X, Send } from 'lucide-react';

interface FoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date_found: string;
  image_url?: string;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface LostItem {
  id: string;
  title: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

export default function FoundItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [showMatchDialog, setShowMatchDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date_found: '',
  });

  const categories = ['Electronics', 'Documents', 'Keys', 'Wallet', 'Jewelry', 'Clothing', 'Bags', 'Other'];

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const fetchFoundItems = async () => {
    try {
      const { data, error } = await supabase
        .from('found_items')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching found items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLostItems = async () => {
    try {
      const { data, error } = await supabase
        .from('lost_items')
        .select(`
          id,
          title,
          user_id,
          profiles (
            full_name
          )
        `)
        .eq('status', 'active');

      if (error) throw error;
      setLostItems(data || []);
    } catch (error) {
      console.error('Error fetching lost items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('found_items').insert({
        ...formData,
        user_id: user.id,
        status: 'active',
      });

      if (error) throw error;

      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        date_found: '',
      });
      setShowForm(false);
      fetchFoundItems();
    } catch (error: any) {
      alert('Error posting found item: ' + error.message);
    }
  };

  const handleNotifyOwner = async (item: FoundItem) => {
    setSelectedItem(item);
    await fetchLostItems();
    setShowMatchDialog(true);
  };

  const sendNotification = async (lostItemId: string, lostItemOwnerId: string) => {
    if (!user || !selectedItem) return;

    try {
      const { error } = await supabase.from('notifications').insert({
        recipient_id: lostItemOwnerId,
        sender_id: user.id,
        found_item_id: selectedItem.id,
        lost_item_id: lostItemId,
        message: `Someone found an item matching your lost item. They found: ${selectedItem.title}`,
        type: 'match',
        status: 'pending',
      });

      if (error) throw error;

      alert('Notification sent to the owner!');
      setShowMatchDialog(false);
      setSelectedItem(null);
    } catch (error: any) {
      alert('Error sending notification: ' + error.message);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Found Items</h1>
            <p className="text-gray-600">Browse or report items that have been found</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Report Found Item</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search found items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Found: {new Date(item.date_found).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Posted by: {item.profiles?.full_name || 'Anonymous'}
                  </p>
                  {item.user_id === user?.id && (
                    <button
                      onClick={() => handleNotifyOwner(item)}
                      className="text-sm text-green-600 hover:text-green-700 font-semibold"
                    >
                      Notify Owner
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No found items yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Report Found Item</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Black Leather Wallet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Provide detailed description of the item you found..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Found
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Central Park, NYC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Found
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_found}
                  onChange={(e) => setFormData({ ...formData, date_found: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Post Found Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMatchDialog && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Notify Lost Item Owner</h2>
              <button
                onClick={() => {
                  setShowMatchDialog(false);
                  setSelectedItem(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Select a lost item to notify its owner about your found item: <strong>{selectedItem.title}</strong>
              </p>

              <div className="space-y-3">
                {lostItems.map((lostItem) => (
                  <div
                    key={lostItem.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{lostItem.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Owner: {lostItem.profiles?.full_name || 'Anonymous'}
                        </p>
                      </div>
                      <button
                        onClick={() => sendNotification(lostItem.id, lostItem.user_id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                ))}

                {lostItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No lost items available to match</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
