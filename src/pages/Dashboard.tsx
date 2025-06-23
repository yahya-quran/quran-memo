import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Users, BookOpen, Clock } from 'lucide-react';
import { useSessionStore } from '../stores/sessionStore';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { sessions, fetchSessions, createSession, loading } = useSessionStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const { error } = await createSession(title.trim(), date);
    
    if (!error) {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowCreateForm(false);
    }
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `منذ ${diffInWeeks} أسبوع`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headings text-3xl font-bold text-secondary mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-600">
            إدارة جلسات تحفيظ القرآن الكريم
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>جلسة جديدة</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الجلسات</p>
              <p className="text-2xl font-bold text-secondary">{sessions.length}</p>
            </div>
            <div className="bg-primary-light p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-primary-dark" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الجلسات هذا الشهر</p>
              <p className="text-2xl font-bold text-secondary">
                {sessions.filter(s => {
                  const sessionDate = new Date(s.date);
                  const now = new Date();
                  return sessionDate.getMonth() === now.getMonth() && 
                         sessionDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الجلسات الأخيرة</p>
              <p className="text-2xl font-bold text-secondary">
                {sessions.filter(s => {
                  const sessionDate = new Date(s.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return sessionDate >= weekAgo;
                }).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full mx-4 animate-fade-in">
            <h2 className="font-headings text-2xl font-bold text-secondary mb-6">
              إنشاء جلسة جديدة
            </h2>
            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الجلسة *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="مثال: جلسة تحفيظ سورة البقرة"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/100 حرف
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الجلسة *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الجلسة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions Grid */}
      <div>
        <h2 className="font-headings text-2xl font-bold text-secondary mb-6">
          الجلسات ({sessions.length})
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="card max-w-md mx-auto">
              <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="font-headings text-xl font-semibold text-gray-600 mb-3">
                لا توجد جلسات بعد
              </h3>
              <p className="text-gray-500 mb-6">
                ابدأ رحلتك في تحفيظ القرآن الكريم بإنشاء جلسة جديدة
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                إنشاء أول جلسة
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/session/${session.id}`)}
                className="card hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-primary-light p-3 rounded-full group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <Users className="h-6 w-6 text-primary-dark group-hover:text-white" />
                  </div>
                  <div className="text-right flex-1 mr-4">
                    <h3 className="font-headings text-xl font-semibold text-secondary mb-2 line-clamp-2">
                      {session.title}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center justify-end space-x-2 space-x-reverse text-gray-600">
                        <span className="text-sm font-medium">
                          {formatDate(session.date)}
                        </span>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-end space-x-2 space-x-reverse text-gray-500">
                        <span className="text-xs">
                          {getTimeAgo(session.created_at)}
                        </span>
                        <Clock className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-l from-primary-light to-transparent p-4 rounded-lg group-hover:from-primary group-hover:to-primary-dark transition-all duration-200">
                  <p className="text-sm text-primary-dark font-medium text-center group-hover:text-white">
                    انقر لإدارة الجلسة والطلاب
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};