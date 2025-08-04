import { motion } from 'framer-motion';

const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
        {children}
    </motion.div>
);
export default AnimatedPage;
