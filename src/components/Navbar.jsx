'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

import SearchField from '@/components/SearchField';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import MyOrdersButton from '@/components/MyOrdersButton';
import AuthModal from '@/components/AuthModal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

function NavbarContent({ categories }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const {
    cartCount = 0,
    activeCategory = 'all',
    setActiveCategory = () => {},
    isSidebarOpen = false,
    setIsSidebarOpen = () => {},
    openSidebar = () => {},
    openCart = () => {},
  } = useCart() || {};

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const suggestions = useMemo(() => [], []);

  function handleCategoryClick(categoryId) {
    setActiveCategory(categoryId);
    setIsSidebarOpen(false);
    setIsCategoriesOpen(false);
    const url = categoryId === 'all' ? '/products' : `/products?category=${categoryId}`;
    router.push(url);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearchOpen(false);
    setIsFocused(false);
    router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  }

  function navLinkClass(path) {
    return cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      pathname === path
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );
  }

  const mobileItems = [
    { href: '/', label: 'Home', icon: Store },
    { href: '/products', label: 'All Products', icon: LayoutGrid },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur">
      <div className="relative border-b border-border/60 bg-primary px-4 py-2 text-primary-foreground">
        <div className="mx-auto max-w-7xl overflow-hidden text-xs font-medium uppercase tracking-[0.16em]">
          <div className="marquee-track flex gap-16 whitespace-nowrap">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-16">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5" />
                  Imported homeware with a refined finish
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5" />
                  Free delivery above Rs. 3000
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <header className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Button variant="ghost" size="icon" onClick={openSidebar} aria-label="Open menu">
          <Menu />
        </Button>

        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.12em] text-primary">China Unique</p>
            <p className="truncate text-xs text-muted-foreground">Home and lifestyle store</p>
          </div>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          <Link href="/" className={navLinkClass('/')}>Home</Link>
          <Link href="/products" className={navLinkClass('/products')}>All Products</Link>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoriesOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Categories
              <ChevronDown className={cn('size-4 transition-transform', isCategoriesOpen && 'rotate-180')} />
            </button>
            {isCategoriesOpen ? (
              <div className="absolute left-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-[0_18px_50px_rgba(10,61,46,0.12)]">
                <button
                  type="button"
                  onClick={() => handleCategoryClick('new-arrivals')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Sparkles className="size-4 text-accent-foreground" />
                  New Arrivals
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('special-offers')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Tag className="size-4 text-accent-foreground" />
                  Special Offers
                </button>
                {categories.filter(c => c.id !== 'special-offers' && c.id !== 'new-arrivals').map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryClick(category.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Tag className="size-4 text-muted-foreground" />
                    {category.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={isSearchOpen ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setIsSearchOpen((value) => !value)}
            aria-label="Toggle search"
          >
            {isSearchOpen ? <X /> : <Search />}
          </Button>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
            aria-label="Open cart"
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-primary-foreground">
                {cartCount}
              </span>
            ) : null}
          </button>

          {session ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image} alt={session.user?.name || 'User'} />
                      <AvatarFallback>{(session.user?.name || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/orders')}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <User />
              </Button>
            </div>
          )}
          
          <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        </div>
      </header>

      {isSearchOpen ? (
        <div className="border-t border-border/70 bg-background/85">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <SearchField
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onSubmit={handleSearchSubmit}
              onClear={() => {
                setSearchTerm('');
                setIsFocused(false);
              }}
              onFocus={() => setIsFocused(true)}
              isFocused={isFocused}
              suggestions={suggestions}
              showSuggestions={false}
              emptyLabel={`No products found for "${debouncedSearch}"`}
            />
          </div>
        </div>
      ) : null}

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[min(70vw,22rem)] min-w-[16rem]">
          <SheetHeader>
            <SheetTitle>Browse the store</SheetTitle>
            <SheetDescription>Navigation and category shortcuts in one place.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 pt-2">
            <div className="flex flex-col gap-2">
              {mobileItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    pathname === href ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Accordion className="w-full">
                <AccordionItem value="categories" className="border-none">
                  <AccordionTrigger className="bg-muted/60 px-3 py-3 hover:bg-muted hover:no-underline [&[data-state=open]]:bg-muted/80">
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="size-4" />
                      <span className="text-sm font-medium">Shop by Category</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-0">
                    <div className="flex flex-col gap-1.5 pl-4">
                      <button
                        type="button"
                        onClick={() => handleCategoryClick('new-arrivals')}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                          activeCategory === 'new-arrivals' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <Sparkles className="size-4" />
                        New Arrivals
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCategoryClick('special-offers')}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                          activeCategory === 'special-offers' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <Tag className="size-4" />
                        Special Offers
                      </button>
                      {categories.filter(c => c.id !== 'special-offers' && c.id !== 'new-arrivals').map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategoryClick(category.id)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                            activeCategory === category.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                          )}
                        >
                          <Tag className="size-4" />
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="pt-2">
              <MyOrdersButton isMobile />
            </div>

            {session && (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image} alt={session.user?.name || 'User'} />
                    <AvatarFallback>{(session.user?.name || 'U').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="truncate text-sm font-semibold">{session.user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    router.push('/settings');
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors bg-muted/60 text-foreground hover:bg-muted"
                >
                  <Settings className="size-4" />
                  Account Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            )}

            <div className="mt-auto pt-6">
              {!session ? <GoogleSignInButton /> : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function Navbar({ categories = [] }) {
  return (
    <Suspense fallback={<div className="h-16 border-b border-border bg-card" />}>
      <NavbarContent categories={categories} />
    </Suspense>
  );
}
