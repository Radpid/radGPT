import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeCalendar, setDateRange } from '../store/slices/appSlice';
import { useState, useEffect } from 'react';

const CalendarModal = () => {
    const dispatch = useAppDispatch();
    const { isCalendarOpen, dateRange } = useAppSelector((state) => state.app);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    useEffect(() => {
        setStartDate(dateRange.startDate ? new Date(dateRange.startDate) : null);
        setEndDate(dateRange.endDate ? new Date(dateRange.endDate) : null);
    }, [isCalendarOpen]);

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (!startDate || (startDate && endDate)) {
            setStartDate(clickedDate);
            setEndDate(null);
        } else if (clickedDate < startDate) {
            setStartDate(clickedDate);
        } else {
            setEndDate(clickedDate);
        }
    };

    const handleApplyFilter = () => {
        dispatch(setDateRange({
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
        }));
        dispatch(closeCalendar());
    };

    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        dispatch(setDateRange({ startDate: null, endDate: null }));
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const startDay = (firstDayOfMonth(year, month) + 6) % 7;

    const calendarDays = Array.from({ length: numDays }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: startDay }, (_, i) => i);

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
        <AnimatePresence>
            {isCalendarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                    onClick={() => dispatch(closeCalendar())}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="bg-card rounded-2xl shadow-2xl w-full max-w-md border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-accent"><ChevronLeft /></button>
                                <h2 className="text-xl font-bold text-foreground">
                                    {currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
                                </h2>
                                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-accent"><ChevronRight /></button>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center text-sm text-muted-foreground mb-2">
                                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => <div key={day}>{day}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {emptyDays.map(i => <div key={`empty-${i}`} className="rounded-lg"></div>)}
                                {calendarDays.map(day => {
                                    const date = new Date(year, month, day);
                                    const isStart = startDate && date.getTime() === startDate.getTime();
                                    const isEnd = endDate && date.getTime() === endDate.getTime();
                                    const isInRange = startDate && endDate && date > startDate && date < endDate;
                                    const isHoverInRange = startDate && !endDate && hoverDate && date > startDate && date <= hoverDate;

                                    let classes = "p-2 border rounded-lg h-10 flex items-center justify-center cursor-pointer transition-colors";
                                    if (isStart) classes += " bg-primary text-primary-foreground rounded-r-none";
                                    else if (isEnd) classes += " bg-primary text-primary-foreground rounded-l-none";
                                    else if (isInRange || isHoverInRange) classes += " bg-primary/20 rounded-none";
                                    else classes += " hover:bg-accent";

                                    return (
                                        <div key={day} className={`flex items-center justify-center ${ (isStart || (isInRange && !isEnd)) ? 'bg-primary/20 rounded-l-lg' : ''} ${(isEnd || (isInRange && !isStart)) ? 'bg-primary/20 rounded-r-lg' : ''} ${isInRange ? '!rounded-none' : ''}`}>
                                            <button
                                                onClick={() => handleDateClick(day)}
                                                onMouseEnter={() => setHoverDate(date)}
                                                onMouseLeave={() => setHoverDate(null)}
                                                className={classes}
                                            >
                                                {day}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 bg-secondary/50 border-t flex justify-between items-center">
                            <button onClick={handleReset} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Zurücksetzen</button>
                            <button onClick={handleApplyFilter} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Filter anwenden</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CalendarModal;
