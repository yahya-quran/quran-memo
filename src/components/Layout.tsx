import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { LogOut, BookOpen, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, userRole, signOut } = useAuthStore();

  const handleSignOut = async () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await signOut();
    }
  };

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case 'teacher': return 'معلم';
      case 'student': return 'طالب';
      default: return 'مستخدم';
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'teacher': return 'text-primary bg-primary-light';
      case 'student': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-white to-primary-light/10">
      <header className="bg-white shadow-lg border-b-4 border-primary sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-primary p-2 rounded-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="text-right">
                <h1 className="font-headings text-xl font-bold text-secondary">
                  دار داركوم
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">
                  مدير جلسات تحفيظ القرآن
                </p>
              </div>
            </div>
            
            {/* User Info and Actions */}
            {user && (
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {user.email}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(userRole)}`}>
                      {getRoleDisplayName(userRole)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                  title="تسجيل الخروج"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-secondary text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="font-headings text-lg font-bold">دار داركوم</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              تطوير حلول تقنية لخدمة القرآن الكريم
            </p>
            <p className="text-xs text-gray-400">
              © 2024 جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};