import React, { useState } from 'react';
import { ChevronDown, User, Edit3, Save, X } from 'lucide-react';
import { StarRating } from './StarRating';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import type { Database } from '../lib/supabase';

type Entry = Database['public']['Tables']['entries']['Row'];

interface EntryAccordionProps {
  entry: Entry;
  isCurrentUser?: boolean;
}

export const EntryAccordion: React.FC<EntryAccordionProps> = ({ entry, isCurrentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: entry.full_name,
    memorization: entry.memorization,
    revision: entry.revision,
    stars: entry.stars,
    comments: entry.comments || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { userRole } = useAuthStore();
  const { updateEntry } = useSessionStore();

  const canEdit = userRole === 'teacher' || isCurrentUser;
  const canEditStarsAndComments = userRole === 'teacher';

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateEntry(entry.id, formData);
    if (!error) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: entry.full_name,
      memorization: entry.memorization,
      revision: entry.revision,
      stars: entry.stars,
      comments: entry.comments || '',
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="card mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-right hover:bg-gray-50 rounded-lg transition-colors duration-200"
      >
        <ChevronDown 
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
        
        <div className="flex items-center space-x-3 space-x-reverse flex-1">
          <div className="text-right flex-1">
            <h3 className="font-medium text-gray-900 text-lg">
              {entry.full_name}
            </h3>
            {entry.stars && (
              <div className="flex items-center justify-end mt-1">
                <StarRating rating={entry.stars} readonly />
              </div>
            )}
            {isCurrentUser && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                أنت
              </span>
            )}
          </div>
          
          <div className="relative">
            <div className="bg-primary-light p-3 rounded-full flex items-center justify-center w-12 h-12">
              <span className="text-primary-dark font-bold text-sm">
                {getInitials(entry.full_name)}
              </span>
            </div>
            {isCurrentUser && (
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
                <User className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
        </div>
      </button>

      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="px-4 pb-4 border-t bg-gray-50/50">
          <div className="space-y-6 pt-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل
              </label>
              {isEditing && canEdit ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field"
                  placeholder="أدخل الاسم الكامل"
                />
              ) : (
                <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {entry.full_name}
                  </p>
                </div>
              )}
            </div>

            {/* Memorization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مجزوء الحفظ
              </label>
              {isEditing && canEdit ? (
                <textarea
                  value={formData.memorization}
                  onChange={(e) => setFormData({ ...formData, memorization: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="أدخل الآيات المحفوظة..."
                />
              ) : (
                <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 min-h-[4rem]">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {entry.memorization || (
                      <span className="text-gray-400 italic">لم يتم تحديد الحفظ بعد</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Revision */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المراجعة
              </label>
              {isEditing && canEdit ? (
                <textarea
                  value={formData.revision}
                  onChange={(e) => setFormData({ ...formData, revision: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="أدخل الآيات المراجعة..."
                />
              ) : (
                <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 min-h-[4rem]">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {entry.revision || (
                      <span className="text-gray-400 italic">لم يتم تحديد المراجعة بعد</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Stars (Teacher only) */}
            {canEditStarsAndComments && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التقييم
                </label>
                <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                  {isEditing ? (
                    <StarRating
                      rating={formData.stars}
                      onRatingChange={(rating) => setFormData({ ...formData, stars: rating })}
                    />
                  ) : (
                    <StarRating rating={entry.stars} readonly />
                  )}
                </div>
              </div>
            )}

            {/* Comments (Teacher only) */}
            {canEditStarsAndComments && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات المعلم
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="input-field h-24 resize-none"
                    placeholder="أضف ملاحظاتك هنا..."
                  />
                ) : (
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 min-h-[4rem]">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {entry.comments || (
                        <span className="text-gray-400 italic">لا توجد ملاحظات</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {canEdit && (
              <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                      <span>إلغاء</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className={`btn-primary flex items-center space-x-2 space-x-reverse ${
                        isSaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center space-x-2 space-x-reverse"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>تعديل</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};