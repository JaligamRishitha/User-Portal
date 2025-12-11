import Icon from './Icon';

const NavItem = ({ item, active, onClick, mobile = false }) => {
    const baseClass = mobile
        ? "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all"
        : "relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 group tracking-tight whitespace-nowrap";

    const activeClass = mobile
        ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
        : "nav-item-active";

    const inactiveClass = mobile
        ? "text-zinc-600 hover:bg-zinc-50"
        : "text-zinc-500 hover:text-orange-600 hover:bg-white/60";

    return (
        <button
            onClick={() => onClick(item.id)}
            className={`${baseClass} ${active ? activeClass : inactiveClass}`}
        >
            <Icon icon={item.icon} className={mobile ? "text-lg text-orange-500" : "text-base flex-shrink-0"} />
            <span className="whitespace-nowrap">{item.label}</span>
        </button>
    );
};

export default NavItem;
