import React from 'react';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'teacher' | 'student';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, userRole, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md w-full text-center">
          <h2 className="font-headings text-2xl font-bold text-secondary mb-4">
            يجب تسجيل الدخول
          </h2>
          <p className="text-gray-600 mb-6">
            يرجى تسجيل الدخول للمتابعة
          </p>
        </div>
      </div>
    );
  }

  if (role && userRole !== role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md w-full text-center">
          <h2 className="font-headings text-2xl font-bold text-error mb-4">
            غير مصرح لك بالوصول
          </h2>
          <p className="text-gray-600 mb-6">
            هذه الصفحة مخصصة للمعلمين فقط
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};