import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setTheme } from './store/slices/themeSlice';
import AppRouter from './routes/AppRouter';
import ParticlesBackground from './components/ParticlesBackground';
import CalendarModal from './components/CalendarModal';

function App() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    dispatch(setTheme(theme));
  }, [theme, dispatch]);

  return (
    <>
      <ParticlesBackground />
      <CalendarModal />
      <AppRouter />
    </>
  );
}

export default App;
