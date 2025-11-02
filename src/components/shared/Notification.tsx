import React from 'react';

interface NotificationProps {
    notification: {
        message: string;
        type: 'success' | 'error';
    } | null;
}

export const Notification: React.FC<NotificationProps> = ({ notification }) => {
    if (!notification) return null;

    const baseClasses = 'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300';
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[notification.type]} animate-fade-in-down`}>
            {notification.message}
        </div>
    );
};

// You might want to add this to your index.html's tailwind config or a css file for the animation
/* 
@keyframes fade-in-down {
    0% {
        opacity: 0;
        transform: translateY(-20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-down {
    animation: fade-in-down 0.5s ease-out forwards;
}
*/