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

const ANNOUNCEMENT_ITEMS = [
  'Imported homeware with a refined finish',
  'Free delivery above Rs. 3000',
];

const MARQUEE_GAP = 64;
const MARQUEE_SPEED = 72;

function AnnouncementMarquee() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const offsetRef = useRef(0);
  const initialItems = [...ANNOUNCEMENT_ITEMS, ...ANNOUNCEMENT_ITEMS];

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) {
      return undefined;
    }

    let isVisible = false;

    const createItemNode = (text, index) => {
      const item = document.createElement('span');
      item.className = 'flex shrink-0 items-center gap-2';
      item.dataset.sourceIndex = String(index);
      item.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles size-3.5" aria-hidden="true">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063A2 2 0 0 0 14.063 15.5l-1.582 6.135a.5.5 0 0 1-.962 0z"></path>
          <path d="M20 3v4"></path>
          <path d="M22 5h-4"></path>
          <path d="M4 17v2"></path>
          <path d="M5 18H3"></path>
        </svg>
      `;
      item.append(document.createTextNode(text));
      return item;
    };

    track.replaceChildren(...ANNOUNCEMENT_ITEMS.map(createItemNode));
    track.style.gap = `${MARQUEE_GAP}px`;

    const widthsByIndex = new Array(ANNOUNCEMENT_ITEMS.length).fill(0);

    const getWidth = (node) => {
      const idx = parseInt(node.dataset.sourceIndex, 10);
      if (!widthsByIndex[idx]) {
        widthsByIndex[idx] = node.getBoundingClientRect().width;
      }
      return widthsByIndex[idx];
    };

    const getTrackWidth = () => {
      const children = Array.from(track.children);
      if (!children.length) {
        return 0;
      }

      return children.reduce((total, child) => total + getWidth(child), 0) + (children.length - 1) * MARQUEE_GAP;
    };

    const fillViewport = () => {
      const viewportWidth = viewport.getBoundingClientRect().width;

      if (!viewportWidth) {
        return;
      }

      let totalWidth = getTrackWidth();
      if (!totalWidth) {
        return;
      }

      let nextIndex = track.children.length % ANNOUNCEMENT_ITEMS.length;

      while (totalWidth < viewportWidth * 2) {
        track.append(createItemNode(ANNOUNCEMENT_ITEMS[nextIndex], nextIndex));
        totalWidth = getTrackWidth();
        nextIndex = (nextIndex + 1) % ANNOUNCEMENT_ITEMS.length;
      }
    };


    const recycleLeadingItems = () => {
      let firstChild = track.firstElementChild;
      const nodesToMove = [];
      let totalShift = 0;

      while (firstChild) {
        const shiftWidth = getWidth(firstChild) + MARQUEE_GAP;

        if (-offsetRef.current < totalShift + shiftWidth) {
          break;
        }

        totalShift += shiftWidth;
        nodesToMove.push(firstChild);
        firstChild = firstChild.nextElementSibling;
      }

      if (nodesToMove.length > 0) {
        offsetRef.current += totalShift;
        track.append(...nodesToMove);
      }
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateTrackPosition = () => {
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    };

    const step = (timestamp) => {
      if (!isVisible || mediaQuery.matches) {
        lastTimestampRef.current = timestamp;
        animationFrameRef.current = window.requestAnimationFrame(step);
        return;
      }

      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;
      offsetRef.current -= MARQUEE_SPEED * deltaSeconds;
      recycleLeadingItems();
      updateTrackPosition();
      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    const resizeObserver = new ResizeObserver(() => {
      widthsByIndex.fill(0);
      fillViewport();
      recycleLeadingItems();
      updateTrackPosition();
    });

    resizeObserver.observe(viewport);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTimestampRef.current = null;
        }
      },
      { threshold: 0 }
    );

    intersectionObserver.observe(viewport);

    fillViewport();
    updateTrackPosition();
    animationFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="flex min-h-4 w-full items-center overflow-hidden text-xs font-medium uppercase tracking-[0.16em] leading-none"
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform"
        style={{ gap: `${MARQUEE_GAP}px` }}
      >
        {initialItems.map((text, index) => (
          <span key={`${text}-${index}`} className="flex shrink-0 items-center gap-2">
            <Sparkles className="size-3.5" aria-hidden="true" />
            <span>{text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
  const navActionButtonClass =
    'nav-icon-button relative rounded-2xl border border-border/60 bg-card/85 p-0 text-foreground transition-[transform,background-color,border-color,color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:border-primary/18 hover:bg-background hover:text-foreground active:scale-[0.96]';

  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur">
      <div className="relative flex min-h-9 items-center border-b border-border/60 bg-primary py-2 text-primary-foreground">
        <AnnouncementMarquee />
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
          <DropdownMenu open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Categories
                <ChevronDown className={cn('size-4 transition-transform', isCategoriesOpen && 'rotate-180')} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 p-1" align="start" sideOffset={8}>
              <DropdownMenuItem onClick={() => handleCategoryClick('new-arrivals')}>
                <Sparkles className="text-accent-foreground" />
                <span>New Arrivals</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryClick('special-offers')}>
                <Tag className="text-accent-foreground" />
                <span>Special Offers</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.filter(c => c.id !== 'special-offers' && c.id !== 'new-arrivals').map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <Tag className="text-muted-foreground" />
                  <span>{category.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-2 self-center">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => setIsSearchOpen((value) => !value)}
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
            className={cn(
              `nav-search-toggle overflow-hidden ${navActionButtonClass}`,
              isSearchOpen
                ? 'is-open border-primary/18 bg-background text-primary'
                : ''
            )}
          >
            <span className="relative flex size-5 items-center justify-center">
              <Search className={cn('navbar-toggle-icon navbar-toggle-icon-search', isSearchOpen && 'is-hidden')} />
              <X className={cn('navbar-toggle-icon navbar-toggle-icon-close', isSearchOpen && 'is-visible')} />
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={openCart}
            className={`nav-cart-button overflow-visible ${navActionButtonClass}`}
            aria-label="Open cart"
          >
            <span className="relative flex size-5 items-center justify-center">
              <ShoppingBag className="size-[1.05rem]" />
            </span>
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold leading-none text-primary-foreground">
                {cartCount}
              </span>
            ) : null}
          </Button>

          {session ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className={`nav-profile-button flex items-center justify-center overflow-hidden ${navActionButtonClass}`}
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
                className={`nav-profile-button overflow-hidden ${navActionButtonClass}`}
              >
                <span className="relative flex size-5 items-center justify-center">
                  <User className="size-5" />
                </span>
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
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleCategoryClick('new-arrivals')}
                          className={cn(
                            mobileSidebarButtonClass,
                            activeCategory === 'new-arrivals'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/55 text-foreground hover:bg-muted'
                          )}
                        >
                          <Sparkles />
                          New Arrivals
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleCategoryClick('special-offers')}
                          className={cn(
                            mobileSidebarButtonClass,
                            activeCategory === 'special-offers'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/55 text-foreground hover:bg-muted'
                          )}
                        >
                          <Tag />
                          Special Offers
                        </Button>
                        {categories.filter(c => c.id !== 'special-offers' && c.id !== 'new-arrivals').map((category) => (
                          <Button
                            key={category.id}
                            type="button"
                            variant="ghost"
                            onClick={() => handleCategoryClick(category.id)}
                            className={cn(
                              mobileSidebarButtonClass,
                              activeCategory === category.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/55 text-foreground hover:bg-muted'
                            )}
                          >
                            <Tag />
                            {category.label}
                          </Button>
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      router.push('/settings');
                    }}
                    className="h-auto justify-start rounded-xl bg-muted/55 px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Settings />
                    Account Settings
                  </Button>
                  {session.user?.isAdmin ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        router.push('/admin');
                      }}
                      className="h-auto justify-start rounded-xl bg-muted/55 px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <LayoutGrid />
                      Admin Panel
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      signOut();
                    }}
                    className="h-auto justify-start rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  >
                    <LogOut />
                    Logout
                  </Button>
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
