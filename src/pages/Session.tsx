import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Plus, Users } from 'lucide-react';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';
import { EntryAccordion } from '../components/EntryAccordion';
import { PDFExport } from '../components/PDFExport';

export const Session: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  
  const { user, userRole } = useAuthStore();
  const { 
    currentSession, 
    entries, 
    fetchSession, 
    fetchEntries, 
    createEntry, 
    loading 
  } = useSessionStore();

  useEffect(() => {
    if (id) {
      fetchSession(id);
      fetchEntries(id);
    }
  }, [id, fetchSession, fetchEntries]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    const { error } = await createEntry({
      session_id: id,
      user_id: user.id,
      full_name: newEntryName,
      memorization: '',
      revision: '',
      stars: null,
      comments: null,
    });

    if (!error) {
      setNewEntryName('');
      setShowAddEntry(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <h2 className="font-headings text-2xl font-bold text-error">
          لم يتم العثور على الجلسة
        </h2>
      </div>
    );
  }

  const userEntry = entries.find(entry => entry.user_id === user?.id);
  const otherEntries = entries.filter(entry => entry.user_id !== user?.id);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Session Header */}
      <div id="session-content" className="card">
        <div className="flex justify-between items-start mb-6">
          <div className="text-right flex-1">
            <h1 className="font-headings text-3xl font-bold text-secondary mb-2">
              {currentSession.title}
            </h1>
            <div className="flex items-center justify-end space-x-2 space-x-reverse text-gray-600">
              <span>{new Date(currentSession.date).toLocaleDateString('ar-SA')}</span>
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="bg-primary-light p-3 rounded-full">
            <Users className="h-8 w-8 text-primary-dark" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2 space-x-reverse">
            {userRole === 'teacher' && (
              <PDFExport
                sessionTitle={currentSession.title}
                sessionDate={currentSession.date}
                elementId="session-content"
              />
            )}
          </div>
          
          {!userEntry && (
            <button
              onClick={() => setShowAddEntry(true)}
              className="btn-secondary flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="h-4 w-4" />
              <span>انضم للجلسة</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h2 className="font-headings text-2xl font-bold text-secondary mb-6">
              الانضمام للجلسة
            </h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={newEntryName}
                  onChange={(e) => setNewEntryName(e.target.value)}
                  className="input-field"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEntry(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-primary">
                  انضمام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-6">
        <h2 className="font-headings text-2xl font-bold text-secondary">
          المشاركون ({entries.length})
        </h2>

        {/* Current User Entry (if exists) */}
        {userEntry && (
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">بياناتك</h3>
            <EntryAccordion entry={userEntry} isCurrentUser={true} />
          </div>
        )}

        {/* Other Entries */}
        {otherEntries.length > 0 && (
          <div>
            {userEntry && (
              <h3 className="text-lg font-semibold text-gray-700 mb-4">المشاركون الآخرون</h3>
            )}
            <div className="space-y-4">
              {otherEntries.map((entry) => (
                <EntryAccordion key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12">
            <div className="card">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-headings text-xl font-semibold text-gray-600 mb-2">
                لا يوجد مشاركون بعد
              </h3>
              <p className="text-gray-500">
                كن أول من ينضم لهذه الجلسة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};