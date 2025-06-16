import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SMSInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unmatched, opt-outs

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('sms_messages_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sms_messages',
          filter: 'direction=eq.inbound'
        }, 
        (payload) => {
          console.log('New SMS received:', payload);
          fetchMessages(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('sms_messages')
        .select(`
          *,
          patient:patients (
            patient_id,
            first_name,
            last_name,
            email,
            sms_opt_in
          )
        `)
        .eq('direction', 'inbound')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'unmatched') {
        query = query.is('patient_id', null);
      } else if (filter === 'opt-outs') {
        query = query.ilike('body', '%stop%');
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone?.replace(/\D/g, '');
    if (cleaned?.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Inbox
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setFilter('unmatched')}
              className={`px-3 py-1 rounded ${
                filter === 'unmatched' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Unmatched
            </button>
            <button
              onClick={() => setFilter('opt-outs')}
              className={`px-3 py-1 rounded ${
                filter === 'opt-outs' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Opt-outs
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {messages.length} {filter !== 'all' ? filter : ''} messages
        </div>
      </div>

      <div className="divide-y">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No messages found
          </div>
        ) : (
          messages.map((message) => {
            const isOptOut = message.body?.toLowerCase().includes('stop');
            
            return (
              <div key={message.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {message.patient ? (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">
                          {message.patient ? (
                            <span>
                              {message.patient.first_name} {message.patient.last_name}
                            </span>
                          ) : (
                            <span className="text-gray-600">Unknown Sender</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {formatPhoneNumber(message.from_number)}
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          {formatDate(message.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOptOut && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Opt-out
                          </span>
                        )}
                        {message.patient && !isOptOut && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Matched
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-gray-700">
                      {message.body}
                    </div>

                    {message.metadata?.fromCity && (
                      <div className="mt-1 text-xs text-gray-500">
                        From: {message.metadata.fromCity}, {message.metadata.fromState}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SMSInbox;