import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loadPatient, loadPatientById, loadChatHistory } from '../store/slices/appSlice';
import AnimatedPage from '../components/AnimatedPage';
import ChatPanel from '../components/ChatPanel';
import DocumentsPanel from '../components/DocumentsPanel';
import { Loader2 } from 'lucide-react';
import AppHeader from '../components/AppHeader';

const WorkspacePage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { patient } = useAppSelector((state) => state.app);
  const currentUser = useAppSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (patientId) {
      if (patientId === 'empty') {
        dispatch(loadPatient('empty'));
      } else if (!patient || patient.id !== patientId) {
        // Charger le patient et son historique de chat
        dispatch(loadPatientById(patientId)).then(() => {
          dispatch(loadChatHistory(patientId));
        });
      }
    }
  }, [patientId, patient, currentUser, dispatch, navigate]);

  if (!currentUser) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="h-screen w-screen bg-transparent text-foreground flex flex-col overflow-hidden">
        <AppHeader />        
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6 overflow-hidden">
          <div className="min-h-0">
            <ChatPanel />
          </div>
          <div className="min-h-0">
            <DocumentsPanel />
          </div>
        </main>
      </div>
    </AnimatedPage>
  );
};
export default WorkspacePage;
