const Icon = ({ icon, className = "" }) => {
    // Map lucide icon names to Unicode/emoji alternatives
    const iconMap = {
        'lucide:layout-dashboard': '📊',
        'lucide:user': '👤',
        'lucide:landmark': '🏛️',
        'lucide:history': '📜',
        'lucide:calendar': '📅',
        'lucide:zap': '⚡',
        'lucide:truck': '🚚',
        'lucide:user-cog': '⚙️',
        'lucide:calendar-clock': '🕐',
        'lucide:file-bar-chart-2': '📊',
        'lucide:phone-call': '📞',
        'lucide:phone': '📞',
        'lucide:arrow-right': '→',
        'lucide:mail': '✉️',
        'lucide:x': '✕',
        'lucide:menu': '☰',
        'lucide:log-out': '🚪',
        'lucide:book-open': '📖',
        'lucide:twitter': '🐦',
        'lucide:linkedin': '💼',
        'lucide:facebook': '📘',
        'lucide:alert-circle': '⚠️',
    };

    return (
        <span className={`inline-block ${className}`} style={{ fontSize: '1.5em' }}>
            {iconMap[icon] || '•'}
        </span>
    );
};

export default Icon;
