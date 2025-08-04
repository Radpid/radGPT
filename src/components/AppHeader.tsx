import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/userSlice';
import { unloadPatient } from '../store/slices/appSlice';
import ThemeToggle from './ThemeToggle';
import { LogOut } from 'lucide-react';
import Logo from './Logo';

const AppHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const handleLogout = () => {
    dispatch(unloadPatient());
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 h-20">
      <div className="flex items-center gap-4">
        <Logo />
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-sm text-foreground">{currentUser?.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
        </div>
        <ThemeToggle />
        <button 
          onClick={handleLogout} 
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" 
          title="Abmelden"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
