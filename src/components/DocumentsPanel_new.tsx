import { useState, useMemo, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setDateRange } from '../store/slices/appSlice';
import { searchPatients } from '../store/slices/patientSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ChevronDown, Search, Filter, X, User, Clock } from 'lucide-react';

const DocumentsPanel = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const patient = useAppSelector((state) => state.app.patient);
  const { dateRange } = useAppSelector((state) => state.app);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Fonction de recherche avec debounce pour éviter les flashs
  const handlePatientSearchInput = (value: string) => {
    setPatientSearchQuery(value);
    setError('');
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout
    const newTimeout = setTimeout(async () => {
      if (value.trim().length >= 2) {
        try {
          const results = await dispatch(searchPatients(value.trim())).unwrap();
          setSearchSuggestions(results.slice(0, 5));
          setShowSuggestions(true);
        } catch (err) {
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce
    
    setSearchTimeout(newTimeout);
  };

  const handlePatientSelect = (patient: any) => {
    navigate(`/workspace/${patient.id}`);
    setShowSuggestions(false);
    setPatientSearchQuery('');
  };

  const handlePatientSearchSubmit = async () => {
    if (!patientSearchQuery.trim()) {
      setError('Bitte geben Sie eine Suchanfrage ein.');
      return;
    }

    try {
      const results = await dispatch(searchPatients(patientSearchQuery.trim())).unwrap();
      
      if (results.length === 0) {
        setError('❌ Keine Patienten gefunden. Bitte überprüfen Sie Ihre Suchanfrage.');
      } else if (results.length === 1) {
        navigate(`/workspace/${results[0].id}`);
      } else {
        // Afficher les suggestions si plusieurs résultats
        setSearchSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      }
    } catch (err) {
      setError('❌ Fehler bei der Suche. Bitte versuchen Sie es erneut.');
    }
  };

  // Filtrage des rapports du patient
  const filteredReports = useMemo(() => {
    if (!patient?.reports) return [];
    
    let filtered = patient.reports;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date);
        const startDate = new Date(dateRange.startDate!);
        const endDate = new Date(dateRange.endDate!);
        return reportDate >= startDate && reportDate <= endDate;
      });
    }
    
    return filtered;
  }, [patient?.reports, searchTerm, dateRange]);

  const handleDateRangeChange = (startDate: string | null, endDate: string | null) => {
    dispatch(setDateRange({ startDate, endDate }));
  };

  const resetDateFilter = () => {
    dispatch(setDateRange({ startDate: null, endDate: null }));
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  if (!patient) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <Search className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Patient suchen
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Geben Sie den Namen oder die ID eines Patienten ein
              </p>
            </div>
            
            <div className="space-y-3 relative">
              <input
                type="text"
                placeholder="Patient suchen (Name oder ID)..."
                value={patientSearchQuery}
                onChange={(e) => handlePatientSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePatientSearchSubmit()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                          dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handlePatientSelect(suggestion)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {suggestion.first_name} {suggestion.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {suggestion.id} | {suggestion.primary_condition}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
              
              <button
                onClick={handlePatientSearchSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg 
                          transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Patient suchen
              </button>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 dark:text-red-400 text-sm text-center p-2 bg-red-50 dark:bg-red-900/20 rounded"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dokumente</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Dokumente durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      dark:bg-gray-700 dark:text-white transition-all duration-200"
          />
        </div>
        
        {/* Date Filter */}
        {showDateFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Von</label>
                <input
                  type="date"
                  value={dateRange.startDate || ''}
                  onChange={(e) => handleDateRangeChange(e.target.value, dateRange.endDate)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bis</label>
                <input
                  type="date"
                  value={dateRange.endDate || ''}
                  onChange={(e) => handleDateRangeChange(dateRange.startDate, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                />
              </div>
              <button
                onClick={resetDateFilter}
                className="mt-6 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-grow overflow-y-auto p-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Dokumente gefunden</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {patient.reports?.length === 0 
                ? 'Für diesen Patienten sind noch keine Dokumente verfügbar.'
                : 'Ihre Suchkriterien ergaben keine Treffer. Versuchen Sie andere Filter.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {report.type}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {report.summary}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(report.date).toLocaleDateString('de-DE')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {report.doctor}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPanel;
