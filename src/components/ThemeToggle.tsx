import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleTheme } from '../store/slices/themeSlice';

const ThemeToggle = () => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((state) => state.theme.theme);
    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Theme wechseln"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </motion.div>
            </AnimatePresence>
        </button>
    );
};
export default ThemeToggle;
