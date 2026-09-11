import React, { useMemo, useEffect, useRef } from 'react';
import { calculateWorthScore, getWorthVerdict } from '../worthScore';

export default function CompareModal({ product, categoryProducts, onClose }) {
    const modalRef = useRef(null);

    // 1. On mount, calculate the worth score for ALL categoryProducts
    // 2. Sort products by worth score (highest first)
    const productsWithScore = useMemo(() => {
        if (!categoryProducts || categoryProducts.length === 0) return [];
        return categoryProducts.map(p => ({
            ...p,
            _worthResult: calculateWorthScore(p, categoryProducts),
            _worthScoreNum: calculateWorthScore(p, categoryProducts).score
        })).sort((a, b) => b._worthScoreNum - a._worthScoreNum);
    }, [categoryProducts]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const bestPick = productsWithScore.length > 0 ? productsWithScore[0] : null;
    const isCurrentBest = bestPick && product && bestPick.id === product.id;

    // Color code the worth score badges: green (>=70), yellow (50-69), red (<50)
    const getScoreColor = (scoreNum) => {
        if (scoreNum >= 70) return 'bg-green-100 text-green-800';
        if (scoreNum >= 50) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
            <div ref={modalRef} className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Compare Products</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-auto p-5 sm:p-6">
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full min-w-[800px] text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-sm sm:text-base">
                                    <th className="p-4 font-semibold text-gray-600 rounded-tl-lg">Product</th>
                                    <th className="p-4 font-semibold text-gray-600">Price</th>
                                    <th className="p-4 font-semibold text-gray-600">Rating</th>
                                    <th className="p-4 font-semibold text-gray-600">Reviews</th>
                                    <th className="p-4 font-semibold text-gray-600">Discount</th>
                                    <th className="p-4 font-semibold text-gray-600">Warranty</th>
                                    <th className="p-4 font-semibold text-gray-600 rounded-tr-lg">Worth Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productsWithScore.map((p, index) => {
                                    const isCurrent = product && p.id === product.id;
                                    const isBest = index === 0;
                                    
                                    return (
                                        <tr 
                                            key={p.id} 
                                            className={`border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors ${
                                                isCurrent ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : 'border-l-4 border-l-transparent'
                                            }`}
                                        >
                                            <td className="p-4 flex items-center gap-4">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gray-100 rounded-md p-1 border border-gray-200">
                                                    <img 
                                                        src={p.thumbnail} 
                                                        alt={p.title} 
                                                        className="w-full h-full object-contain" 
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800 line-clamp-2">{p.title}</span>
                                                    <span className="text-sm text-gray-500 mt-0.5">{p.brand || 'TechMatch'}</span>
                                                    {isBest && (
                                                        <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold bg-green-100 text-green-800 rounded-full w-max border border-green-200">
                                                            ★ Best Value
                                                        </span>
                                                    )}
                                                    {isCurrent && !isBest && (
                                                        <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold bg-blue-100 text-blue-800 rounded-full w-max border border-blue-200">
                                                            Current Product
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-gray-800 whitespace-nowrap">
                                                Rs.{Number(p.price).toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-4 text-gray-700 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-yellow-400 text-lg">★</span>
                                                    <span className="font-medium">{p.rating}</span>
                                                    <span className="text-sm text-gray-400">/ 5</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-700">
                                                {p.reviews?.length || 0}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {p.discountPercentage > 0 ? (
                                                    <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                                        {p.discountPercentage}% off
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-700 text-sm">
                                                {p.warrantyInformation || 'Standard'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-3 py-1 rounded-full font-bold text-sm border ${getScoreColor(p._worthScoreNum)} border-opacity-50`}>
                                                        {p._worthScoreNum}/100
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-medium ml-1">
                                                        {getWorthVerdict(p._worthScoreNum).label}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Show a 'Best Pick' recommendation at the bottom if a different product scores higher */}
                    {!isCurrentBest && bestPick && product && (
                        <div className="mt-6 p-4 sm:p-5 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
                            <div className="p-2 sm:p-3 bg-blue-100 rounded-full text-blue-600 shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 text-base sm:text-lg">Best Pick Recommendation</h3>
                                <p className="text-blue-800 text-sm sm:text-base mt-1.5 leading-relaxed">
                                    While you're looking at <strong className="font-semibold">{product.title}</strong>, we recommend <strong className="font-semibold">{bestPick.title}</strong>. It offers better overall value with a score of <span className="font-bold">{bestPick._worthScoreNum}/100</span> based on its price, rating, and features in this category.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
