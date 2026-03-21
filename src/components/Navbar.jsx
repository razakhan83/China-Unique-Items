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
import { ScrollArea } from '@/components/ui/scroll-area';
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
    router.push(url, { scroll: true });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearchOpen(false);
    setIsFocused(false);
    router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`, { scroll: true });
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
  const mobileSidebarButtonClass =
    'flex w-full min-h-10 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-[background-color,transform,color] duration-200 active:scale-[0.96]';

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

      <header className="relative z-20 mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Button variant="ghost" size="icon" onClick={openSidebar} aria-label="Open menu" className="md:hidden">
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
          <Link href="/products" scroll={true} className={navLinkClass('/products')}>All Products</Link>
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
              <div className="absolute left-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-[0_18px_50px_rgba(10,61,46,0.12)]">
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

        <div className="ml-auto flex items-center gap-2 self-center">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => setIsSearchOpen((value) => !value)}
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
            className={cn(
              'nav-icon-button nav-search-toggle relative overflow-hidden rounded-2xl border border-transparent bg-transparent text-muted-foreground',
              isSearchOpen && 'is-open border-primary/15 bg-primary/8 text-primary'
            )}
          >
            <span className="relative flex size-5 items-center justify-center">
              <Search className={cn('navbar-toggle-icon navbar-toggle-icon-search', isSearchOpen && 'is-hidden')} />
              <X className={cn('navbar-toggle-icon navbar-toggle-icon-close', isSearchOpen && 'is-visible')} />
            </span>
          </Button>
          <button
            type="button"
            onClick={openCart}
            className="nav-cart-button relative inline-flex size-11 items-center justify-center rounded-2xl border border-border/75 bg-background/95 text-foreground shadow-[0_12px_28px_rgba(10,61,46,0.08),0_2px_6px_rgba(10,61,46,0.05)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:border-primary/20 hover:bg-card hover:shadow-[0_18px_34px_rgba(10,61,46,0.12),0_3px_8px_rgba(10,61,46,0.06)] active:scale-[0.96]"
            aria-label="Open cart"
          >
            <ShoppingBag className="size-[1.05rem]" />
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
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="nav-icon-button nav-profile-button relative flex items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-card/85 p-0 text-foreground shadow-[0_10px_24px_rgba(10,61,46,0.06)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:border-primary/18 hover:bg-background hover:shadow-[0_16px_30px_rgba(10,61,46,0.1)] active:scale-[0.96]"
                  >
                    <Avatar className="size-9">
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
                    {session.user?.isAdmin ? (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    ) : null}
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
                size="icon-lg"
                onClick={() => setIsAuthModalOpen(true)}
                className="nav-icon-button nav-profile-button rounded-2xl border border-border/60 bg-card/85 text-muted-foreground shadow-[0_10px_24px_rgba(10,61,46,0.06)] transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:border-primary/18 hover:bg-background hover:text-foreground hover:shadow-[0_16px_30px_rgba(10,61,46,0.1)] active:scale-[0.96]"
              >
                <User />
              </Button>
            </div>
          )}
          
          <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        </div>
      </header>

      <div
        data-state={isSearchOpen ? 'open' : 'closed'}
        aria-hidden={!isSearchOpen}
        className={cn(
          'navbar-search-shell relative z-10 grid overflow-hidden border-t bg-background/80 backdrop-blur transition-[grid-template-rows,opacity,border-color] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
          isSearchOpen ? 'grid-rows-[1fr] border-border/70 opacity-100' : 'pointer-events-none grid-rows-[0fr] border-transparent opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="navbar-search-inner mx-auto max-w-4xl px-4 py-4">
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
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[min(76vw,22rem)] min-w-[16rem] px-4 pb-4 pt-5">
          <SheetHeader className="sheet-stagger-item px-1">
            <SheetTitle>Browse the store</SheetTitle>
            <SheetDescription>Navigation and category shortcuts in one place.</SheetDescription>
          </SheetHeader>

          <ScrollArea className="sheet-stagger min-h-0 flex-1 pr-2">
            <div className="flex min-h-full flex-col gap-2.5 pt-3">
              <div className="flex flex-col gap-1.5">
                {mobileItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      mobileSidebarButtonClass,
                      pathname === href
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/55 text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <Accordion className="w-full">
                  <AccordionItem value="categories" className="border-none">
                    <AccordionTrigger className="rounded-xl bg-muted/55 px-3.5 py-2.5 hover:bg-muted hover:no-underline [&[data-state=open]]:bg-muted/80">
                      <div className="flex items-center gap-3">
                        <LayoutGrid className="size-4" />
                        <span className="text-sm font-medium">Shop by Category</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pt-1.5 pb-0">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCategoryClick('new-arrivals')}
                          className={cn(
                            mobileSidebarButtonClass,
                            activeCategory === 'new-arrivals'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/55 text-foreground hover:bg-muted'
                          )}
                        >
                          <Sparkles className="size-4" />
                          New Arrivals
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCategoryClick('special-offers')}
                          className={cn(
                            mobileSidebarButtonClass,
                            activeCategory === 'special-offers'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/55 text-foreground hover:bg-muted'
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
                              mobileSidebarButtonClass,
                              activeCategory === category.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/55 text-foreground hover:bg-muted'
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

              <MyOrdersButton
                isMobile
                className="min-h-10 rounded-xl bg-muted/55 px-3.5 py-2.5 hover:bg-muted"
              />

              {session && (
                <div className="flex flex-col gap-1.5 pt-2">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-3.5 py-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user?.image} alt={session.user?.name || 'User'} />
                      <AvatarFallback>{(session.user?.name || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
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
                    className="flex min-h-10 items-center gap-3 rounded-xl bg-muted/55 px-3.5 py-2.5 text-sm font-medium text-foreground transition-[background-color,transform] duration-200 hover:bg-muted active:scale-[0.96]"
                  >
                    <Settings className="size-4" />
                    Account Settings
                  </button>
                  {session.user?.isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        router.push('/admin');
                      }}
                      className="flex min-h-10 items-center gap-3 rounded-xl bg-muted/55 px-3.5 py-2.5 text-sm font-medium text-foreground transition-[background-color,transform] duration-200 hover:bg-muted active:scale-[0.96]"
                    >
                      <LayoutGrid className="size-4" />
                      Admin Panel
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      signOut();
                    }}
                    className="flex min-h-10 items-center gap-3 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive transition-[background-color,transform] duration-200 hover:bg-destructive/20 active:scale-[0.96]"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}

              <div className="mt-auto pt-2">
                {!session ? (
                  <GoogleSignInButton className="min-h-10 rounded-xl py-2.5 shadow-none" />
                ) : null}
              </div>
            </div>
          </ScrollArea>
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
