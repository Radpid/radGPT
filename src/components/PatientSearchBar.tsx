import { Search, Filter, Calendar } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { openCalendar } from '../store/slices/appSlice';

interface PatientSearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

const PatientSearchBar = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Aktennummer, Name oder Diagnose suchen...",
  isLoading = false 
}: PatientSearchBarProps) => {
  const dispatch = useAppDispatch();
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onSearch();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full text-base pl-6 pr-32 py-4 rounded-full border bg-card shadow-lg focus:ring-2 focus:ring-ring focus:outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
        <button 
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          <Filter className="h-5 w-5" />
        </button>
        <button 
          onClick={() => dispatch(openCalendar())} 
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          <Calendar className="h-5 w-5" />
        </button>
        <div className="h-6 border-l mx-1"></div>
        <button 
          onClick={onSearch} 
          disabled={isLoading}
          className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PatientSearchBar;
