import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { searchPatients, setSearchQuery } from '../store/slices/patientSlice';
import { AuthService } from '../services/authService';
import AnimatedPage from '../components/AnimatedPage';
import PatientSearchBar from '../components/PatientSearchBar';
import { motion } from 'framer-motion';
import AppHeader from '../components/AppHeader';
import type { Patient } from '../services/api';

const PatientSearchPage = () => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = window.setTimeout(async () => {
      if (query.trim().length >= 2) {
        try {
          const results = await dispatch(searchPatients(query.trim())).unwrap();
          setSuggestions(results.slice(0, 5));
          setShowSuggestions(true);
        } catch (err) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    setSearchTimeout(newTimeout);
  }, [dispatch, searchTimeout]);

  useEffect(() => {
    // Vérifier l'authentification
    if (!AuthService.isAuthenticated()) {
      navigate('/');
      return;
    }
    
    // Ne plus charger automatiquement les patients au démarrage
    // dispatch(searchPatients(''));
  }, [dispatch, navigate]);

  const handleSearch = async () => {
    if (!localSearchQuery.trim()) {
      setError('Bitte geben Sie eine Patienten-ID, Nachname oder Vorname ein.');
      return;
    }

    setError('');
    setShowSuggestions(false);
    dispatch(setSearchQuery(localSearchQuery));
    
    try {
      const results = await dispatch(searchPatients(localSearchQuery)).unwrap();
      
      if (results.length === 0) {
        // Afficher un message d'erreur au lieu de rediriger
        setError('❌ Keine Patienten gefunden. Bitte überprüfen Sie Ihre Suchanfrage und versuchen Sie es erneut.');
        setShowSuggestions(false);
      } else if (results.length === 1) {
        // Si un seul patient trouvé, naviguer directement
        navigate(`/workspace/${results[0].id}`);
      } else {
        // Si plusieurs patients, naviguer vers le premier ou afficher la liste
        navigate(`/workspace/${results[0].id}`);
      }
    } catch (err) {
      setError('❌ Fehler bei der Suche. Bitte versuchen Sie es erneut.');
    }
  };

  const handlePatientSelect = useCallback((patientId: string) => {
    navigate(`/workspace/${patientId}`);
  }, [navigate]);

  const handleSkip = () => {
    navigate('/workspace/empty');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    setError('');
    
    // Use debounced search
    debouncedSearch(value);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSuggestionClick = (patient: Patient) => {
    setLocalSearchQuery(patient.first_name + ' ' + patient.last_name);
    setShowSuggestions(false);
    handlePatientSelect(patient.id);
  };

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen bg-transparent">
        <AppHeader />
        <div className="flex-grow flex flex-col items-center justify-center p-4 -mt-20">
          <div className="w-full max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tighter">Willkommen bei radGPT</h1>
              <p className="text-lg text-muted-foreground">Suchen Sie nach einem Patienten, um zu beginnen.</p>
            </motion.div>
            
            <motion.div 
              className="w-full relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PatientSearchBar
                value={localSearchQuery}
                onChange={handleInputChange}
                onSearch={handleSearch}
                placeholder="Patienten-ID, Nachname oder Vorname eingeben..."
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handleSuggestionClick(patient)}
                      className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {patient.id} | Geboren: {patient.birth_date}
                      </div>
                      {patient.primary_condition && (
                        <div className="text-sm text-muted-foreground">
                          {patient.primary_condition}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {/* Remove loading indicator */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8"
              >
                <button
                  onClick={handleSkip}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors underline"
                >
                  Ohne Patient fortfahren
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default PatientSearchPage;
