"use client";

import React, { useState } from 'react';
import type { Business, User } from '@/types';
import { SimplifiedAdminPanel } from './SimplifiedAdminPanel';

interface AdminPanelProps {
    allBusinesses: Business[];
    allUsers: User[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ allBusinesses, allUsers }) => {
    return (
        <SimplifiedAdminPanel allBusinesses={allBusinesses} allUsers={allUsers} />
    );
};
