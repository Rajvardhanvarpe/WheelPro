import React from 'react';
import clsx from 'clsx';

const StatsCard = ({ title, value, icon, iconColor, trend, trendIcon, trendColor, trendText, borderColor, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "flex min-w-[160px] flex-1 flex-col gap-2 rounded-xl p-5 bg-form-container dark:bg-gray-700 shadow-sm border-b-4 transition-all",
                borderColor,
                onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            )}
        >
            <div className="flex items-center justify-between">
                <p className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">{title}</p>
                <span className={clsx("material-symbols-outlined", iconColor)}>{icon}</span>
            </div>
            <p className="text-workshop-dark dark:text-white tracking-light text-3xl font-bold leading-tight">{value}</p>
            {trend && (
                <p className={clsx("text-xs font-bold leading-normal flex items-center gap-1", trendColor)}>
                    <span className="material-symbols-outlined text-sm">{trendIcon}</span> {trendText}
                </p>
            )}
        </div>
    );
};

export default StatsCard;
