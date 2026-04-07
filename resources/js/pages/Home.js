import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.js';

// Mock featured products
const featuredProducts = [
	{
		id: 1,
		name: 'Classic Black Leather School Shoes',
		price: 45.99,
		image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
		description: 'Premium leather school shoes with durable rubber sole. Perfect for daily school wear.',
		stock: 45
	},
	{
		id: 2,
		name: 'White Canvas Sneakers',
		price: 35.99,
		image: 'https://images.unsplash.com/photo-1525966222134-fceb466e6e85?w=500&h=500&fit=crop',
		description: 'Comfortable white canvas sneakers ideal for physical education and casual school wear.',
		stock: 62
	},
	{
		id: 3,
		name: 'Brown Leather Oxfords',
		price: 52.99,
		image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
		description: 'Elegant brown leather oxford shoes suitable for formal school events.',
		stock: 38
	}
];

const categories = [
	{ id: 1, name: 'Formal Shoes', icon: '👔', description: 'For special occasions' },
	{ id: 2, name: 'Athletic Shoes', icon: '⚽', description: 'For sports & PE' },
	{ id: 3, name: 'Casual Shoes', icon: '👟', description: 'For everyday wear' },
	{ id: 4, name: 'Comfort Shoes', icon: '🥾', description: 'Maximum comfort' }
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
	return (
		<div className="page--home">
			{/* Hero Section */}
			<section className="home-hero">
				<div className="container home-hero__inner">
					<p className="eyebrow">📚 Back to School Collection</p>
					<h1>Quality School Shoes for Every Student</h1>
					<p className="home-hero__subtitle">Comfortable, durable, and affordable footwear for academic excellence</p>
					<Link to="/products" className="btn btn--primary">
						Shop Now
					</Link>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="home-features">
				<div className="container">
					<article className="feature-card">
						<div className="feature-card__icon">✓</div>
						<h3>Quality Guaranteed</h3>
						<p>All our shoes meet strict quality standards for durability and comfort</p>
					</article>
					<article className="feature-card">
						<div className="feature-card__icon">🚚</div>
						<h3>Delivery & Pickup</h3>
						<p>Choose between cash on delivery or convenient store pickup</p>
					</article>
					<article className="feature-card">
						<div className="feature-card__icon">💳</div>
						<h3>Flexible Payment</h3>
						<p>Pay when you receive your order - no prepayment required</p>
					</article>
				</div>
			</section>

			{/* Categories Section */}
			<section className="home-categories">
				<div className="container">
					<h2>Shop by Category</h2>
					<div className="categories-grid">
						{categories.map(category => (
							<Link key={category.id} to="/products" className="category-card">
								<div className="category-icon">{category.icon}</div>
								<h3>{category.name}</h3>
								<p>{category.description}</p>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Featured Products Section */}
			<section className="home-featured">
				<div className="container">
					<h2 className="section-title">⭐ Featured Products</h2>
					<p className="section-subtitle">Check out our most popular school shoes</p>
					<div className="products-grid">
						{featuredProducts.map(product => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
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
					<h2>💬 What Students Say</h2>
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
								<p className="testimonial-text\">" {testimonial.text} \"</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="home-stats">
				<div className="container">
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
					<p>Subscribe to our newsletter and get 10% off your first order!</p>
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
