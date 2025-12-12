import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
    const navigate = useNavigate();

    const cards = [
        {
            id: 'ocr',
            title: 'OCR Scanner',
            description: 'Automated text extraction from network diagrams and legal documents.',
            icon: '📄',
            color: 'orange',
            route: '/admin/ocr',
            isExternal: true,
            externalUrl: 'http://149.102.158.71:2101/ocr?api_key=ocr_k-DvHxnw9FNzuyoqX5gBf453NZXL5E1LllrFevcHsXs'
        },
        {
            id: 'console',
            title: 'Request Console',
            description: 'Monitor incoming user requests, approvals, and system logs in real-time.',
            icon: '📋',
            color: 'blue',
            route: '/admin/console'
        },
        {
            id: 'reports',
            title: 'Reports & Maps',
            description: 'Generate geographical reports and view asset distribution across the UK.',
            icon: '📊',
            color: 'emerald',
            route: '/admin/reports'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            orange: {
                border: 'hover:border-orange-200',
                shadow: 'hover:shadow-orange-500/5',
                bg: 'bg-orange-100/40 group-hover:bg-orange-200/40',
                text: 'text-orange-600'
            },
            blue: {
                border: 'hover:border-blue-200',
                shadow: 'hover:shadow-blue-500/5',
                bg: 'bg-blue-100/40 group-hover:bg-blue-200/40',
                text: 'text-blue-600'
            },
            emerald: {
                border: 'hover:border-emerald-200',
                shadow: 'hover:shadow-emerald-500/5',
                bg: 'bg-emerald-100/40 group-hover:bg-emerald-200/40',
                text: 'text-emerald-600'
            }
        };
        return colors[color];
    };

    return (
        <div className="flex flex-col items-center justify-center px-8 py-12 pb-40 relative z-10 w-full max-w-5xl mx-auto min-h-[calc(100vh-8rem)]">
            <div className="text-center mb-12 animate-fade-in">

                <p className="text-zinc-500 text-sm max-w-lg mx-auto">
                    Manage network requests, access reports, and process OCR documents from a single centralized hub.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full animate-fade-in">
                {cards.map((card) => {
                    const colorClasses = getColorClasses(card.color);
                    return (
                        <button
                            key={card.id}
                            onClick={() => {
                                if (card.isExternal) {
                                    window.open(card.externalUrl, '_blank');
                                } else {
                                    navigate(card.route);
                                }
                            }}
                            className={`group relative h-48 p-6 rounded-2xl bg-white/60 border border-zinc-200/60 ${colorClasses.border} hover:shadow-xl ${colorClasses.shadow} transition-all duration-500 text-left flex flex-col justify-between backdrop-blur-sm overflow-hidden`}
                        >
                            <div className={`absolute top-0 right-0 p-24 ${colorClasses.bg} rounded-full blur-2xl -mr-12 -mt-12 transition-colors`}></div>
                            <div className="relative">
                                <div className={`w-10 h-10 bg-white rounded-lg shadow-sm border border-zinc-100 flex items-center justify-center ${colorClasses.text} group-hover:scale-105 transition-transform duration-300`}>
                                    <span className="text-lg">{card.icon}</span>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-zinc-900">{card.title}</h3>
                                <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                            <div className={`relative flex items-center text-[10px] font-medium ${colorClasses.text} opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300`}>
                                Open
                                <svg className="ml-1 w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminHome;
