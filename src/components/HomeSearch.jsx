'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomeSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="container mx-auto max-w-[600px] px-4 pt-6 mb-2">
            <form onSubmit={handleSearch} className="search-container relative flex items-center w-full">
                <i className="fa-solid fa-magnifying-glass search-icon absolute left-4 text-[#0A3D2E] text-[1.1rem]"></i>
                <input
                    id="home-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input w-full py-3 px-4 pl-12 border-2 border-[#072C21] rounded-[12px] text-base text-gray-900 placeholder:text-gray-500 outline-none transition-all shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 bg-white"
                    placeholder="Search for premium products..."
                />
                <Button type="submit" className="absolute right-2 rounded-[12px] px-6">
                    Search
                </Button>
            </form>
        </div>
    );
}
