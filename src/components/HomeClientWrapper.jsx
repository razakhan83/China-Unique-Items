"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import CategoryIconCarousel from "@/components/CategoryIconCarousel";
import HeroSlider from "@/components/HeroSlider";
import HomeCategories from "@/components/HomeCategories";
import ProductGridClient from "@/components/ProductGridClient";
import SearchField from "@/components/SearchField";
import { getProductCategoryNames } from "@/lib/productCategories";

export default function HomeClientWrapper({ products, heroSlides, categories = [], sections = [] }) {
  const wrapperRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    const term = debouncedSearch.toLowerCase();
    return products
      .filter((product) => {
        const name = (product.Name || product.name || "").toLowerCase();
        const categories = getProductCategoryNames(product);
        return (
          name.includes(term) ||
          categories.some((category) => (category || "").toLowerCase().includes(term))
        );
      })
      .slice(0, 5)
      .map((product) => ({
        ...product,
        onSelect: handleSuggestionClick,
      }));
  }, [debouncedSearch, products]);

  function handleSearchSubmit(event) {
    event?.preventDefault();
    setIsFocused(false);
    setHasSearched(Boolean(searchTerm.trim()));
  }

  function handleSuggestionClick(product) {
    setSearchTerm(product.Name || product.name || "");
    setHasSearched(true);
    setIsFocused(false);
  }

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <CategoryIconCarousel categories={categories} />

      <div ref={wrapperRef} className="mx-auto max-w-3xl px-4 py-6 md:hidden">
        <SearchField
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setHasSearched(false);
          }}
          onSubmit={handleSearchSubmit}
          onClear={() => {
            setSearchTerm("");
            setDebouncedSearch("");
            setHasSearched(false);
            setIsFocused(false);
          }}
          onFocus={() => setIsFocused(true)}
          isFocused={isFocused}
          suggestions={suggestions}
          buttonLabel="Find"
          emptyLabel={`No products found for "${debouncedSearch}"`}
        />
      </div>

      {hasSearched ? (
        <div className="animate-fadeIn">
          <ProductGridClient initialProducts={products} forceSearchTerm={searchTerm} hideSearch />
        </div>
      ) : (
        <div className="animate-fadeIn">
          <HomeCategories sections={sections} />
        </div>
      )}
    </>
  );
}
