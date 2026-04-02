"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CommunitySearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    params.set('filter', filter);
    router.push(`/admin/communities?${params.toString()}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    params.set('filter', e.target.value);
    router.push(`/admin/communities?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-4 flex gap-4">
      <input
        type="text"
        placeholder="Search communities..."
        className="flex-1 px-4 py-2 border rounded-md"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select
        className="px-4 py-2 border rounded-md"
        value={filter}
        onChange={handleFilterChange}
      >
        <option value="all">All Communities</option>
        <option value="private">Private Communities</option>
        <option value="public">Public Communities</option>
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