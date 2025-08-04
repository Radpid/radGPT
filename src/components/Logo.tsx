import { BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Logo = ({ className = '' }: { className?: string }) => {
    const navigate = useNavigate();
    return (
        <div 
            className={`flex items-center gap-3 cursor-pointer ${className}`}
            onClick={() => navigate('/search')}
            title="Zur Aktensuche"
        >
            <BrainCircuit className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground tracking-tighter">radGPT</span>
        </div>
    );
};
export default Logo;
