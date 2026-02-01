import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, AlertCircle, Globe } from 'lucide-react';
import outkarLogo from '@/assets/outkar-logo.jpeg';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [role, setRole] = useState<'worker' | 'hirer'>(
    (searchParams.get('role') as 'worker' | 'hirer') || 'hirer'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (mode === 'signup' && fullName.trim().length < 2) {
        setError('Please enter your full name');
        return false;
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src={outkarLogo} alt="OutKar" className="h-10 w-10 rounded-lg object-cover" />
            <span className="font-display font-bold text-2xl text-foreground">OutKar</span>
          </Link>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === 'signin'
              ? 'Sign in to access your dashboard'
              : 'Join OutKar to find or offer services'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>I want to</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-4 rounded-lg border-2 text-left transition-all ${role === 'hirer'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setRole('hirer')}
                    >
                      <span className="font-semibold text-foreground block">Hire Workers</span>
                      <span className="text-sm text-muted-foreground">Find help for my needs</span>
                    </button>
                    <button
                      type="button"
                      className={`p-4 rounded-lg border-2 text-left transition-all ${role === 'worker'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setRole('worker')}
                    >
                      <span className="font-semibold text-foreground block">Find Work</span>
                      <span className="text-sm text-muted-foreground">Offer my services</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name (any language)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    You can type in Hindi, Kannada, Telugu, Tamil, or any Indian language
                  </p>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-muted-foreground mt-6">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => setMode('signin')}
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8">
        <div className="max-w-md text-center">
          <img src={outkarLogo} alt="OutKar" className="w-20 h-20 rounded-2xl mx-auto mb-8 object-cover" />
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            {mode === 'signin'
              ? 'Welcome Back to OutKar'
              : role === 'worker'
                ? 'Start Earning Today'
                : 'Find Help You Can Trust'}
          </h2>
          <p className="text-primary-foreground/80">
            {mode === 'signin'
              ? 'Access your dashboard to manage your profile, view requests, and connect with opportunities.'
              : role === 'worker'
                ? 'Create your profile, showcase your skills, and connect with hirers looking for your expertise.'
                : 'Browse verified workers, read reviews, and hire the right person for your needs with confidence.'}
          </p>
        </div>
      </div>
    </div>
  );
}
