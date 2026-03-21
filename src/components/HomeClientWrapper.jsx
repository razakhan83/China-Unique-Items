"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import CategoryIconCarousel from "@/components/CategoryIconCarousel";
import HeroSlider from "@/components/HeroSlider";
import HomeCategories from "@/components/HomeCategories";
import SearchField from "@/components/SearchField";

export default function HomeClientWrapper({ heroSlides, categories = [], sections = [] }) {
  const router = useRouter();
  const wrapperRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let isActive = true;

    async function loadSuggestions() {
      if (!debouncedSearch.trim()) {
        if (isActive) {
          setSuggestions([]);
          setIsLoadingSuggestions(false);
        }
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/search-products?q=${encodeURIComponent(debouncedSearch.trim())}&limit=5`);
        const result = await response.json();

        if (!isActive) return;

        setSuggestions(
          Array.isArray(result?.data)
            ? result.data.map((product) => ({
                ...product,
                onSelect: () => {
                  router.push(`/products/${product.slug || product._id || product.id}`);
                  setIsFocused(false);
                },
              }))
            : [],
        );
      } catch {
        if (isActive) {
          setSuggestions([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingSuggestions(false);
        }
      }
    }

    loadSuggestions();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(event) {
    event?.preventDefault();
    setIsFocused(false);
    if (!searchTerm.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  }

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <div className="home-enter" style={{ "--home-enter-delay": "80ms" }}>
        <CategoryIconCarousel categories={categories} />
      </div>

      <div ref={wrapperRef} className="home-enter mx-auto max-w-3xl px-4 py-6 md:hidden" style={{ "--home-enter-delay": "140ms" }}>
        <SearchField
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          onSubmit={handleSearchSubmit}
          onClear={() => {
            setSearchTerm("");
            setDebouncedSearch("");
            setSuggestions([]);
            setIsFocused(false);
          }}
          onFocus={() => setIsFocused(true)}
          isFocused={isFocused}
          suggestions={suggestions}
          emptyLabel={isLoadingSuggestions ? "Searching..." : `No products found for "${debouncedSearch}"`}
        />
      </div>

      <div className="animate-fadeIn">
        <HomeCategories sections={sections} />
      </div>
    </>
  );
}
