'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProductCategoryNames } from '@/lib/productCategories';
import { getPrimaryProductImage } from '@/lib/productImages';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';

export default function ProductModal({ product, onClose }) {
    const { addToCart } = useCart();

    if (!product) return null;

    const formatPrice = (raw) => {
        let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
        if (!cleanNumbers) return 'Rs. 0';
        return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
    };

    const categories = getProductCategoryNames(product);
    const primaryImage = getPrimaryProductImage(product);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 animate-fadeIn"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fadeInUp"
                    style={{ willChange: 'transform, opacity' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>

                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2 relative bg-gray-50 aspect-square md:aspect-auto md:min-h-[300px] overflow-hidden group">
                            {primaryImage?.url ? (
                                <Image
                                    src={primaryImage.url}
                                    alt={product.Name || product.name || 'Product'}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    {...getBlurPlaceholderProps(primaryImage.blurDataURL)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <i className="fa-solid fa-image text-6xl opacity-20"></i>
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {categories.length > 0 ? (
                                    categories.map((cat, i) => (
                                        <Badge key={i} variant="emerald">
                                            {cat}
                                        </Badge>
                                    ))
                                ) : (
                                    <Badge variant="emerald">Premium Item</Badge>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                                {product.Name || product.name}
                            </h2>
                            <div className="text-3xl font-extrabold text-[#0A3D2E] mb-4 tracking-tight">
                                {formatPrice(product.Price || product.price)}
                            </div>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                                {product.Description || product.description || "Discover the perfect addition to your collection. This premium item from China Unique Store is crafted with quality and elegance in mind."}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4">
                                <Button
                                    onClick={() => {
                                        addToCart(product);
                                        onClose();
                                    }}
                                    className="flex-1 w-full"
                                >
                                    <i className="fa-solid fa-cart-plus mr-2"></i> Add to Cart
                                </Button>

                                <a
                                    href={`https://wa.me/923001234567?text=${encodeURIComponent(`Hi Kifayatly Store, I would like to order:\n\n*${product.Name || product.name || 'Premium Item'}*\nPrice: ${formatPrice(product.Price || product.price)}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 w-full"
                                >
                                    <Button variant="default" className="w-full bg-[#25D366] hover:bg-[#1ebe5d] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 shadow-sm hover:shadow-md">
                                        <i className="fa-brands fa-whatsapp text-xl mr-2"></i> Order via WhatsApp
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
