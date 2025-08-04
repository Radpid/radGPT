import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/userSlice';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import GoogleIcon from '../components/GoogleIcon';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, currentUser } = useAppSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    username: 'dr.schmidt@klinik.de',
    password: 'password123'
  });

  useEffect(() => {
    if (currentUser) {
      navigate('/search');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(clearError());
    
    try {
      await dispatch(loginUser(formData)).unwrap();
      navigate('/search');
    } catch (err) {
      // L'erreur est gérée par le slice
      console.error('Login failed:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <AnimatedPage>
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-4">
        <motion.div 
          className="w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="bg-card/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border">
            <div className="flex flex-col items-center mb-8">
              <Logo />
              <p className="text-muted-foreground mt-4 text-center">Ihre KI-Schnittstelle für radiologische Berichte</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground">E-Mail</label>
                <div className="mt-1">
                  <input 
                    id="username" 
                    name="username" 
                    type="email" 
                    autoComplete="email" 
                    required 
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm disabled:opacity-50" 
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">Passwort</label>
                <div className="mt-1">
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    autoComplete="current-password" 
                    required 
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm disabled:opacity-50" 
                  />
                </div>
              </div>
              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Anmeldung...' : 'Anmelden'}
                </button>
              </div>
              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t"></div>
                  <span className="flex-shrink mx-4 text-muted-foreground text-xs">ODER</span>
                  <div className="flex-grow border-t"></div>
              </div>
              <div>
                <button type="button" onClick={handleSubmit} className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg shadow-lg text-sm font-semibold text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-105">
                  <GoogleIcon />
                  Mit Google anmelden
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};
export default LoginPage;
