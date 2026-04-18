import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel.jsx';

const categories = [
  {
    id: 1,
    name: 'Formal School Shoes',
    image: '/images/categories/formal.jpg',
    description: 'Polished pairs for assemblies, church events, and uniform days.'
  },
  {
    id: 2,
    name: 'PE / Rubber Shoes',
    image: '/images/categories/pe.jpg',
    description: 'Light, flexible shoes for PE class and active school days.'
  },
  {
    id: 3,
    name: 'Black Leather Shoes',
    image: '/images/categories/black.jpg',
    description: 'Durable everyday school shoes with a clean, formal finish.'
  },
  {
    id: 4,
    name: 'White School Shoes',
    image: '/images/categories/white.jpg',
    description: 'Bright, neat shoes for approved school uniform styles.'
  }
];

const heroSlides = [
	{
		id: 1,
		label: 'Premium school footwear',
		title: 'Built for the school day, styled for confidence',
		subtitle: 'Clean, durable pairs with comfort-first construction and a polished finish for class, play, and everything in between.',
		image: '/images/carousel/7-11.jpg'
	},
	{
		id: 2,
		label: 'All-day comfort',
		title: 'Move through every lesson with ease',
		subtitle: 'Practical school shoes that stay comfortable from the first bell to the last trip home.',
		image: '/images/carousel/PLP_hero_editorial_banner_component_D.jpg'
	},
	{
		id: 3,
		label: 'Easy shopping',
		title: 'Find trusted school shoes without the clutter',
		subtitle: 'Clear product details, simple navigation, and a fast add-to-cart flow made for busy families.',
		image: '/images/carousel/Ed-Pick-3-1.jpg'
	},
	{
		id: 4,
		label: 'Reliable essentials',
		title: 'Comfort-first shoes for everyday school routines',
		subtitle: 'Reliable pairs for students who need support, neat style, and durability every day.',
		image: '/images/carousel/download.jpg'
	}
];

const trustItems = [
	{
		title: 'Free Delivery',
		text: 'On qualifying orders.',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M3 7h11v10H3z" />
				<path d="M14 10h4l3 3v4h-7z" />
				<circle cx="7.5" cy="18" r="1.8" />
				<circle cx="18.5" cy="18" r="1.8" />
			</svg>
		)
	},
	{
		title: 'Easy Returns',
		text: 'Straightforward return support.',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M7 7H4v3" />
				<path d="M4 7c2-3 5.2-4.5 8.6-4.2C16 3.1 19 5.7 20 9" />
				<path d="M17 17h3v-3" />
				<path d="M20 17c-2 3-5.2 4.5-8.6 4.2C8 20.9 5 18.3 4 15" />
			</svg>
		)
	},
	{
		title: 'Secure Payment',
		text: 'Protected checkout flow.',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M12 3 20 7v5c0 4.4-3 8-8 10-5-2-8-5.6-8-10V7z" />
				<path d="M9.5 12.2 11 13.7l3.6-4.1" />
			</svg>
		)
	},
	{
		title: 'Quality Guaranteed',
		text: 'Durable school shoes made to last.',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="m12 3 1.7 3.4L17 8l-3.3 1.6L12 13l-1.7-3.4L7 8l3.3-1.6L12 3Z" />
				<path d="M8.3 13.8 6 21l6-2 6 2-2.3-7.2" />
			</svg>
		)
	}
];

export default function Home() {
	const [activeHeroIndex, setActiveHeroIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [isTextVisible, setIsTextVisible] = useState(true);

	useEffect(() => {
		// Start image transition immediately
		setIsTransitioning(true);
		
		// Hide text first, then show after delay
		setIsTextVisible(false);
		
		const textShowTimer = window.setTimeout(() => {
			setIsTextVisible(true);
		}, 220); // Text starts 220ms after image

		// Reset transition state when image finishes (900ms)
		const resetTimer = window.setTimeout(() => {
			setIsTransitioning(false);
		}, 900); // Total image duration

		return () => {
			window.clearTimeout(textShowTimer);
			window.clearTimeout(resetTimer);
		};
	}, [activeHeroIndex]);

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setActiveHeroIndex((previous) => (previous + 1) % heroSlides.length);
		}, 5000);

		return () => window.clearInterval(intervalId);
	}, []);

	const activeSlide = heroSlides[activeHeroIndex];

	return (
		<div className="page--home storefront-home">
			<section className="storefront-home__hero">
				<div className={`storefront-home__hero-banner ${isTransitioning ? 'is-transitioning' : ''}`}>
					<img
						src={activeSlide.image}
						alt={activeSlide.title}
						className="storefront-home__hero-image"
					/>
					<div className="storefront-home__hero-overlay" aria-hidden="true" />
					<div className="container">
						<div className="storefront-home__hero-copy">
							{/* Animated text section */}
						<div className={`storefront-home__hero-text ${isTextVisible ? 'is-visible' : ''}`}>
								<p className="storefront-home__hero-label">{activeSlide.label}</p>
								<h1>{activeSlide.title}</h1>
								<p className="storefront-home__hero-subtitle">{activeSlide.subtitle}</p>
							</div>

							{/* Static actions section - NOT animated */}
							<div className="storefront-home__hero-actions">
								<Link to="/products" className="btn btn--primary">Shop Collection</Link>
								<Link to="/products?category=Formal%20School%20Shoes" className="btn btn--secondary">Browse categories</Link>

							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="storefront-home__categories">
				<div className="container">
					<div className="storefront-home__section-head">
						<p className="eyebrow">Shop by Category</p>
						<h2>Find the right pair for every routine</h2>
					</div>
					<div className="storefront-home__categories-grid">
						{categories.map((category) => (
							<article key={category.id} className="storefront-home__category-card">
								<Link to={`/products?category=${encodeURIComponent(category.name)}`} className="storefront-home__category-link">
									<div className="storefront-home__category-media">
										<img src={category.image} alt={category.name} />
									</div>
									<div className="storefront-home__category-content">
										<h3>{category.name}</h3>
										<p>{category.description}</p>
										<span>Shop now</span>
									</div>
								</Link>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="storefront-home__featured">
				<div className="container">
					<div className="storefront-home__section-head storefront-home__featured-head">
						<p className="eyebrow">Featured Products</p>
						<h2>Featured This Week</h2>
					</div>
					<div className="storefront-home__featured-shell">
						<FeaturedProductsCarousel showControls />
					</div>
				</div>
			</section>

			<section className="storefront-home__trust">
				<div className="container storefront-home__trust-grid">
					{trustItems.map((item) => (
						<article key={item.title} className="storefront-home__trust-item">
							<div className="storefront-home__trust-icon" aria-hidden="true">{item.icon}</div>
							<h3>{item.title}</h3>
							<p>{item.text}</p>
						</article>
					))}
				</div>
			</section>
		</div>
	);
}
