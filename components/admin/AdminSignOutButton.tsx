'use client';

import { signOut } from 'next-auth/react';
import { FaSignOutAlt } from 'react-icons/fa';

export default function AdminSignOutButton() {
  return (
    <button
      className="w-full flex items-center gap-2 text-left text-red-500 hover:underline"
      onClick={() => signOut({ callbackUrl: '/signin' })}
    >
      <FaSignOutAlt /> Sign Out
    </button>
  );
} 