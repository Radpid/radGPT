import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { searchPatients, setSearchQuery } from '../store/slices/patientSlice';
import { AuthService } from '../services/authService';
import AnimatedPage from '../components/AnimatedPage';
import PatientSearchBar from '../components/PatientSearchBar';
import { motion } from 'framer-motion';
import AppHeader from '../components/AppHeader';

const PatientSearchPage = () => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { patients, isLoading, searchQuery } = useAppSelector((state) => state.patients);

  useEffect(() => {
    // Vérifier l'authentification
    if (!AuthService.isAuthenticated()) {
      navigate('/');
      return;
    }
    
    // Charger les patients initialement
    dispatch(searchPatients(''));
  }, [dispatch, navigate]);

  const handleSearch = async () => {
    if (!localSearchQuery.trim()) {
      setError('Veuillez entrer un ID patient, nom ou prénom.');
      return;
    }

    setError('');
    dispatch(setSearchQuery(localSearchQuery));
    
    try {
      const results = await dispatch(searchPatients(localSearchQuery)).unwrap();
      
      if (results.length === 0) {
        setError('Aucun patient trouvé. Vérifiez votre recherche.');
      } else if (results.length === 1) {
        // Si un seul patient trouvé, naviguer directement
        navigate(`/workspace/${results[0].id}`);
      }
      // Si plusieurs patients trouvés, ils seront affichés dans la liste
    } catch (err) {
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    }
  };

  const handlePatientSelect = (patientId: string) => {
    navigate(`/workspace/${patientId}`);
  };

  const handleSkip = () => {
    navigate('/workspace/empty');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
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
              className="w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PatientSearchBar
                value={localSearchQuery}
                onChange={handleInputChange}
                onSearch={handleSearch}
                placeholder="Patient-ID, Nachname oder Vorname eingeben..."
              />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="text-muted-foreground">Suche läuft...</div>
                </div>
              )}

              {/* Résultats de recherche */}
              {patients.length > 0 && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-card/80 backdrop-blur-sm rounded-lg border p-4"
                >
                  <h3 className="text-lg font-semibold mb-4">Gefundene Patienten:</h3>
                  <div className="space-y-2">
                    {patients.map((patient) => (
                      <motion.div
                        key={patient.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-background/50 rounded-lg border cursor-pointer hover:bg-accent"
                        onClick={() => handlePatientSelect(patient.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
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
                          <div className="text-right text-sm text-muted-foreground">
                            {patient.reports.length} Berichte
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

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
