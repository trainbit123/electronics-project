import React, { useMemo } from 'react';
import { calculateWorthScore, getWorthVerdict } from '../worthScore';

const CircularGauge = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-green-500";
  if (score < 50) colorClass = "text-red-500";
  else if (score < 75) colorClass = "text-yellow-500";

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          className="text-gray-200"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
        />
        <circle
          className={`transition-all duration-1000 ease-in-out ${colorClass}`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
        />
      </svg>
      <div className="absolute text-2xl font-bold text-gray-800">
        {score}
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, max, tooltip }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  let colorClass = "bg-green-500";
  if (percentage < 50) colorClass = "bg-red-500";
  else if (percentage < 75) colorClass = "bg-yellow-500";

  return (
    <div className="mb-3" title={tooltip}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-500 font-medium">{Math.round(value)}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${colorClass} h-2 rounded-full transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const StarDisplay = ({ rating }) => {
  return (
    <div className="flex items-center space-x-1 text-yellow-400 text-lg">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? '★' : star - 0.5 <= rating ? '⯨' : '☆'}
        </span>
      ))}
      <span className="text-gray-600 text-sm ml-2 font-medium">({rating})</span>
    </div>
  );
};

const WorthBuyingSection = ({ product, categoryProducts = [] }) => {
  if (!product) return null;

  const worthData = calculateWorthScore(product, categoryProducts);
  const { score = 0, breakdown = {}, strengths = [], weaknesses = [], buyFor = [], avoidFor = [] } = worthData || {};
  const verdict = getWorthVerdict(score) || { text: 'Unknown', emoji: '❓', type: 'consider', explanation: '' };

  const averageCategoryPrice = useMemo(() => {
    if (!categoryProducts.length) return 0;
    const sum = categoryProducts.reduce((acc, p) => acc + (p.price || 0), 0);
    return sum / categoryProducts.length;
  }, [categoryProducts]);

  return (
    <section className="bg-gray-50 py-8 px-4 rounded-xl mt-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">🔍</span> Is This Worth Buying?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Overall Verdict */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Overall Score</h3>
            <CircularGauge score={Math.round(score)} />
            <div className="mt-4">
              <span className="inline-block px-4 py-1 rounded-full bg-gray-100 font-semibold text-gray-800 text-lg">
                {verdict.emoji} {verdict.text}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{verdict.explanation}</p>
          </div>

          {/* 2. Score Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <ProgressBar label="Rating Quality" value={breakdown.ratingQuality || 0} max={30} />
              <ProgressBar label="Value for Money" value={breakdown.valueForMoney || 0} max={25} />
              <ProgressBar label="Review Confidence" value={breakdown.reviewConfidence || 0} max={15} />
              <ProgressBar label="Product Info" value={breakdown.productInfo || 0} max={10} />
              <ProgressBar label="Warranty & Returns" value={breakdown.warrantyReturns || 0} max={10} />
              <ProgressBar label="Availability" value={breakdown.availability || 0} max={10} />
            </div>
          </div>

          {/* 3. Value for Money */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Value for Money</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Product Price:</span>
                <span className="font-bold text-gray-800">Rs.{Number(product.price).toLocaleString("en-IN")}</span>
              </div>
              {averageCategoryPrice > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category Avg:</span>
                  <span className="font-semibold text-gray-500">Rs.{Number(averageCategoryPrice).toLocaleString("en-IN")}</span>
                </div>
              )}
              {product.discountPercentage > 0 && (
                <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                  {product.discountPercentage}% OFF
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {product.price < averageCategoryPrice 
                  ? "Priced lower than average for this category." 
                  : "Premium pricing for this category."}
              </p>
            </div>
          </div>

          {/* 4. Rating & Reviews */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-between">
              Rating & Reviews
              <StarDisplay rating={product.rating || 0} />
            </h3>
            
            {(product.reviews && product.reviews.length > 0) ? (
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                {product.reviews.map((review, idx) => (
                  <div key={idx} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-700">{review.reviewerName}</span>
                      <span className="text-xs text-yellow-500 font-bold">★ {review.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No reviews available yet.</p>
            )}
            
            {(!product.reviews || product.reviews.length < 5) && (
              <div className="mt-4 p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                ⚠️ Low review count. Ratings may not be highly confident.
              </div>
            )}
          </div>

          {/* 5. Product Strengths */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-green-600">Strengths</h3>
            <ul className="space-y-2">
              {strengths && strengths.length > 0 ? strengths.map((s, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-700">
                  <span className="text-green-500 mr-2">✓</span> {s}
                </li>
              )) : (
                <li className="text-sm text-gray-500">None identified</li>
              )}
            </ul>
          </div>

          {/* 6. Possible Weaknesses */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-orange-500">Weaknesses</h3>
            <ul className="space-y-2">
              {weaknesses && weaknesses.length > 0 ? weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-700">
                  <span className="text-orange-400 mr-2">⚠️</span> {w}
                </li>
              )) : (
                <li className="text-sm text-gray-500">None identified</li>
              )}
            </ul>
          </div>

          {/* 7. Who Should Buy / Who Should Avoid */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-700 mb-4">Fit Guide</h3>
             <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-600 mb-1">Good for:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {buyFor && buyFor.length > 0 ? buyFor.map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-600">{item}</li>
                    )) : <li className="text-xs text-gray-500">General users</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-500 mb-1">Not ideal for:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {avoidFor && avoidFor.length > 0 ? avoidFor.map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-600">{item}</li>
                    )) : <li className="text-xs text-gray-500">None identified</li>}
                  </ul>
                </div>
             </div>
          </div>

          {/* 8. Final Recommendation */}
          <div className={`md:col-span-3 p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between
            ${verdict.type === 'buy' ? 'bg-green-50 border-green-200' : 
              verdict.type === 'avoid' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="mb-4 md:mb-0 md:mr-6 flex-grow">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Final Recommendation</h3>
              <p className="text-gray-700">
                Based on our automated analysis of price, specifications, and user reviews, 
                this product has a score of {Math.round(score)}/100.
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-center">
               <span className={`text-2xl font-black px-8 py-4 rounded-xl shadow-sm text-white uppercase tracking-wider
                ${verdict.type === 'buy' ? 'bg-green-600' : 
                  verdict.type === 'avoid' ? 'bg-red-600' : 'bg-yellow-500'}`}>
                 {verdict.type === 'buy' ? 'BUY ✅' : verdict.type === 'avoid' ? 'SKIP ❌' : 'CONSIDER ⚠️'}
               </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WorthBuyingSection;
