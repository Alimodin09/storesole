import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel.jsx';

const categories = [
	{
		id: 1,
		name: 'Formal School Shoes',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M3 7h18l-1.2 11a2 2 0 0 1-2 1.8H6.2a2 2 0 0 1-2-1.8L3 7Z" />
				<path d="M8 7V5.7A2.7 2.7 0 0 1 10.7 3h2.6A2.7 2.7 0 0 1 16 5.7V7" />
			</svg>
		),
		description: 'Polished pairs for assemblies, church events, and uniform days.'
	},
	{
		id: 2,
		name: 'PE / Rubber Shoes',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
			</svg>
		),
		description: 'Light, flexible shoes for PE class and active school days.'
	},
	{
		id: 3,
		name: 'Black Leather Shoes',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M3 15c2.2-.2 4.1-1.4 5.1-3.4l1-2 3.1 2.3c1 .7 2.1 1.1 3.3 1.1H21v2.2a2.8 2.8 0 0 1-2.8 2.8H5.8A2.8 2.8 0 0 1 3 15.2V15Z" />
				<path d="M14 13h2" />
			</svg>
		),
		description: 'Durable everyday school shoes with a clean, formal finish.'
	},
	{
		id: 4,
		name: 'White School Shoes',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="m12 3 1.7 3.4L17 8l-3.3 1.6L12 13l-1.7-3.4L7 8l3.3-1.6L12 3Z" />
				<path d="m18.5 13.5.9 1.8 1.8.9-1.8.9-.9 1.8-.9-1.8-1.8-.9 1.8-.9.9-1.8Z" />
				<path d="m5.5 14.5.8 1.5 1.5.8-1.5.8-.8 1.5-.8-1.5-1.5-.8 1.5-.8.8-1.5Z" />
			</svg>
		),
		description: 'Bright, neat shoes for approved school uniform styles.'
	}
];

// Change hero carousel images here.
const carouselItems = [
	{
		id: 1,
		title: 'School-Ready Comfort for Every Day',
		image: '/images/carousel/7-11.jpg',
		subtitle: 'Durable school shoes built to keep up with class, recess, and the long walk home.',
		ctaLabel: 'Shop Now'
	},
	{
		id: 2,
		title: 'Smart Style for School Uniforms',
		image: '/images/carousel/PLP_hero_editorial_banner_component_D.jpg',
		subtitle: 'Clean, polished designs that look sharp with uniforms and stay comfortable all day.',
		ctaLabel: 'Shop Now'
	},
	{
		id: 3,
		title: 'Built for Busy School Mornings',
		image: '/images/carousel/Ed-Pick-3-1.jpg',
		subtitle: 'Easy-to-wear pairs with supportive comfort for active students and packed schedules.',
		ctaLabel: 'Shop Now'
	},
	{
		id: 4,
		title: 'Everyday School Shoes Made Simple',
		image: '/images/carousel/download.jpg',
		subtitle: 'Practical, affordable, and reliable footwear for students who need comfort that lasts.',
		ctaLabel: 'Shop Now'
	}
];

const testimonials = [
	{
		id: 1,
		name: 'Emma Johnson',
		text: 'Best school shoes I\'ve ever bought! Super comfortable and durable.',
		rating: 5,
		image: 'https://i.pravatar.cc/150?img=1'
	},
	{
		id: 2,
		name: 'James Smith',
		text: 'Great quality and amazing customer service. Highly recommend!',
		rating: 5,
		image: 'https://i.pravatar.cc/150?img=2'
	},
	{
		id: 3,
		name: 'Sarah Williams',
		text: 'Love the variety of styles and the prices are very reasonable.',
		rating: 4,
		image: 'https://i.pravatar.cc/150?img=3'
	}
];

export default function Home() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [touchStart, setTouchStart] = useState(0);

	useEffect(() => {
		const autoPlay = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
		}, 5500);

		return () => clearInterval(autoPlay);
	}, []);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
	};

	const handleTouchStart = (e) => {
		setTouchStart(e.touches[0].clientX);
	};

	const handleTouchEnd = (e) => {
		const touchEnd = e.changedTouches[0].clientX;
		if (touchStart - touchEnd > 50) {
			nextSlide(); // Swipe left
		}
		if (touchEnd - touchStart > 50) {
			prevSlide(); // Swipe right
		}
	};

	return (
		<div className="page--home">
			{/* Hero Section */}
			<section className="home-hero">
				<div className="container home-hero__inner">
					<p className="eyebrow">SoleStore School Shoes</p>
					<h1>School-Ready Shoes That Look Sharp and Feel Comfortable</h1>
					<p className="home-hero__subtitle">Find durable, comfortable school shoes for daily wear, uniform days, and active students who need support from the first bell to the last.</p>
					<Link to="/products" className="btn btn--primary">
						Shop Now
					</Link>
				</div>
			</section>

			{/* Image Carousel Section */}
			<section className="home-carousel">
				<div className="container">
					<div className="home-carousel__heading">
						<p className="eyebrow">Featured School Shoe Styles</p>
						<h2>Explore the latest looks for everyday school comfort</h2>
						<p>Swipe, click, or let the carousel move automatically while you browse the most useful styles for SoleStore customers.</p>
					</div>
					<div
						className="carousel-wrapper"
						onTouchStart={handleTouchStart}
						onTouchEnd={handleTouchEnd}
					>
						<div className="carousel-container">
							{carouselItems.map((item, index) => (
								<div
									key={item.id}
									className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
									style={{
										backgroundImage: `url(${item.image})`,
										opacity: index === currentSlide ? 1 : 0,
										pointerEvents: index === currentSlide ? 'auto' : 'none'
									}}
								>
									<div className="carousel-overlay">
										<h2>{item.title}</h2>
										<p>{item.subtitle}</p>
										<Link to="/products" className="btn btn--primary">
											{item.ctaLabel || `Explore ${item.title}`}
										</Link>
									</div>
								</div>
							))}
						</div>

						{/* Navigation Buttons */}
						<button
							className="carousel-btn carousel-btn--prev"
							onClick={prevSlide}
							aria-label="Previous slide"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<path d="m15 18-6-6 6-6" />
							</svg>
						</button>
						<button
							className="carousel-btn carousel-btn--next"
							onClick={nextSlide}
							aria-label="Next slide"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<path d="m9 18 6-6-6-6" />
							</svg>
						</button>

						{/* Dot Indicators */}
						<div className="carousel-dots">
							{carouselItems.map((_, index) => (
								<button
									key={index}
									className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
									onClick={() => setCurrentSlide(index)}
									aria-label={`Go to slide ${index + 1}`}
								/>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="home-features">
				<div className="container">
					<div className="section-heading home-features__heading">
						<p className="eyebrow">Why Families Choose SoleStore</p>
						<h2 className="section-title">Simple support for busy school mornings</h2>
						<p className="section-subtitle">Every detail is built around school shoe shopping, from comfort to delivery to payment convenience.</p>
					</div>
					<div className="home-features__grid">
						<article className="feature-card">
							<div className="feature-card__icon">✓</div>
							<h3>Quality Guaranteed</h3>
							<p>Durable school shoes made to handle daily wear, long walks, and active students.</p>
						</article>
						<article className="feature-card">
							<div className="feature-card__icon">🚚</div>
							<h3>Delivery & Pickup</h3>
							<p>Choose quick delivery or convenient pickup when you need school shoes fast.</p>
						</article>
						<article className="feature-card">
							<div className="feature-card__icon">💳</div>
							<h3>Flexible Payment</h3>
							<p>Pay when you receive your order, with no extra stress for back-to-school shopping.</p>
						</article>
					</div>
				</div>
			</section>

			{/* Categories Section */}
			<section className="home-categories">
				<div className="container">
					<h2 className="section-title">Shop by Category</h2>
					<p className="section-subtitle">Choose the right style for school days, activities, and everyday comfort.</p>
					<div className="categories-grid">
						{categories.map(category => (
							<Link key={category.id} to="/products" className="category-card">
								<div className="category-icon">{category.icon}</div>
								<h3 className="category-title">{category.name}</h3>
								<p className="category-description">{category.description}</p>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Featured Products Section */}
			<section className="home-featured">
				<div className="container">
					<h2 className="section-title">Featured School Shoes</h2>
					<p className="section-subtitle">Swipe through new admin-added products and add your picks to cart.</p>
					<FeaturedProductsCarousel />
					<div className="featured-cta">
						<Link to="/products" className="btn btn--primary">
							View All Products
						</Link>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="home-testimonials">
				<div className="container">
					<div className="section-heading">
						<h2 className="section-title">What Students Say</h2>
						<p className="section-subtitle">Real feedback from customers who use SoleStore school shoes every day.</p>
					</div>
					<div className="testimonials-grid">
						{testimonials.map(testimonial => (
							<div key={testimonial.id} className="testimonial-card">
								<div className="testimonial-header">
									<img src={testimonial.image} alt={testimonial.name} className="testimonial-avatar" />
									<div>
										<h4>{testimonial.name}</h4>
										<div className="stars">
											{'⭐'.repeat(testimonial.rating)}
										</div>
									</div>
								</div>
								<p className="testimonial-text">"{testimonial.text}"</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="home-stats">
				<div className="container">
					<div className="section-heading">
						<h2 className="section-title">SoleStore Performance</h2>
					</div>
					<div className="stat-item">
						<h3>10K+</h3>
						<p>Happy Customers</p>
					</div>
					<div className="stat-item">
						<h3>500+</h3>
						<p>Products Available</p>
					</div>
					<div className="stat-item">
						<h3>4.8★</h3>
						<p>Average Rating</p>
					</div>
					<div className="stat-item">
						<h3>24/7</h3>
						<p>Customer Support</p>
					</div>
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="home-newsletter">
				<div className="container">
					<h2>Get Special Offers</h2>
					<p>Receive school shoe promos and updates. No spam, just useful offers.</p>
					<form className="newsletter-form">
						<input type="email" placeholder="Enter your email" required />
						<button type="submit" className="btn btn--primary">Subscribe</button>
					</form>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="home-cta">
				<div className="container">
					<h2>Ready to Find Your Perfect Shoes?</h2>
					<p>Explore our complete collection of school shoes today</p>
					<Link to="/products" className="btn btn--primary">
						Shop Now
					</Link>
				</div>
			</section>
		</div>
	);
}
