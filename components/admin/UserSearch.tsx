'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function UserSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    params.set('filter', filter);
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-4 flex gap-4">
      <input
        type="text"
        placeholder="Search users..."
        className="flex-1 px-4 py-2 border rounded-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select 
        className="px-4 py-2 border rounded-md"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="all">All Users</option>
        <option value="active">Active Users</option>
        <option value="inactive">Inactive Users</option>
      </select>
      <button 
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Search
      </button>
    </form>
  );
} 