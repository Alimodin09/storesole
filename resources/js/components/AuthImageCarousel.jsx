import React, { useEffect, useState } from 'react';

// Premium Login Images - dark, elegant, close-up
const loginImages = [
	{
		id: 1,
		image: '/images/carousel/login-1.jpg',
	},
	{
		id: 2,
		image: '/images/carousel/login-2.jpg',
	},
	{
		id: 3,
		image: '/images/carousel/login-3.jpg',
	},
];

// Welcoming Signup Images - brighter, lifestyle-focused
const signupImages = [
	{
		id: 1,
		image: '/images/carousel/signup-1.jpg',
	},
	{
		id: 2,
		image: '/images/carousel/signup-2.jpg',

	},
	{
		id: 3,
		image: '/images/carousel/signup-3.jpg',
	},
];

export default function AuthImageCarousel({ type = 'login' }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const slides = type === 'login' ? loginImages : signupImages;

	useEffect(() => {
		const timer = window.setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % slides.length);
		}, 5000);

		return () => window.clearInterval(timer);
	}, [slides.length]);

	return (
		<div className="auth-image-carousel" aria-hidden="true">
			{slides.map((slide, index) => (
				<div
					key={slide.id}
					className={`auth-image-carousel__slide ${index === activeIndex ? 'is-active' : ''}`}
					style={{
						backgroundImage: `url(${slide.image})`,
					}}
				>
					<div className="auth-image-carousel__overlay"></div>
				</div>
			))}
		</div>
	);
}
