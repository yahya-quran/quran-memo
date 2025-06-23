import React, { useState } from 'react';
import { BookOpen, User, UserCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signIn, signUp } = useAuthStore();

  const validateForm = () => {
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقتين');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = isSignUp 
        ? await signUp(email, password, role)
        : await signIn(email, password);

      if (result.error) {
        // Translate common Supabase errors to Arabic
        const errorMessages: { [key: string]: string } = {
          'Invalid login credentials': 'بيانات تسجيل الدخول غير صحيحة',
          'User already registered': 'المستخدم مسجل مسبقاً',
          'Email not confirmed': 'لم يتم تأكيد البريد الإلكتروني',
          'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
          'Unable to validate email address: invalid format': 'تنسيق البريد الإلكتروني غير صحيح',
        };
        
        setError(errorMessages[result.error] || result.error);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-primary-light/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary p-4 rounded-full shadow-lg">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="font-headings text-4xl font-bold text-secondary mb-2">
            دار داركوم
          </h1>
          <h2 className="text-xl text-gray-700 mb-2">
            مدير جلسات تحفيظ القرآن الكريم
          </h2>
          <p className="text-sm text-gray-600">
            {isSignUp ? 'إنشاء حساب جديد للانضمام' : 'تسجيل الدخول إلى حسابك'}
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="example@domain.com"
                dir="ltr"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Role Selection (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  نوع الحساب *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center justify-center space-x-2 space-x-reverse p-4 border-2 rounded-lg transition-all duration-200 ${
                      role === 'student'
                        ? 'border-primary bg-primary-light text-primary-dark shadow-md'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">طالب</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex items-center justify-center space-x-2 space-x-reverse p-4 border-2 rounded-lg transition-all duration-200 ${
                      role === 'teacher'
                        ? 'border-primary bg-primary-light text-primary-dark shadow-md'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <UserCheck className="h-5 w-5" />
                    <span className="font-medium">معلم</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {role === 'teacher' 
                    ? 'يمكن للمعلم إنشاء الجلسات وتقييم الطلاب' 
                    : 'يمكن للطالب الانضمام للجلسات وتسجيل الحفظ'
                  }
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn-primary text-lg py-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جاري المعالجة...</span>
                  </div>
                ) : (
                  isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول'
                )}
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="text-center pt-4 border-t">
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:text-primary-dark transition-colors duration-200 font-medium"
              >
                {isSignUp 
                  ? 'لديك حساب بالفعل؟ سجل الدخول' 
                  : 'ليس لديك حساب؟ أنشئ حساباً جديداً'
                }
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 دار داركوم - جميع الحقوق محفوظة</p>
          <p className="mt-1">تطوير حلول تقنية لخدمة القرآن الكريم</p>
        </div>
      </div>
    </div>
  );
};