import React, { useEffect, useState } from 'react';

// Change auth carousel images here.
const authSlides = [
	{
		id: 1,
		image: '/images/carousel/7-11.jpg',
		title: 'School Shoes Built for Daily Comfort',
		description: 'Reliable fits for busy class schedules and active students.',
	},
	{
		id: 2,
		image: '/images/carousel/PLP_hero_editorial_banner_component_D.jpg',
		title: 'Smart Styles for Uniform Days',
		description: 'Polished and practical designs for every school week.',
	},
	{
		id: 3,
		image: '/images/carousel/Ed-Pick-3-1.jpg',
		title: 'Easy Choices for Parents',
		description: 'Choose durable school shoes in just a few clicks.',
	},
	{
		id: 4,
		image: '/images/carousel/download.jpg',
		title: 'Step Into Confidence',
		description: 'Comfort, support, and quality from SoleStore.',
	},
];

export default function AuthImageCarousel() {
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % authSlides.length);
		}, 4500);

		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className="auth-image-carousel" aria-hidden="true">
			{authSlides.map((slide, index) => (
				<div
					key={slide.id}
					className={`auth-image-carousel__slide ${index === activeIndex ? 'is-active' : ''}`}
					style={{
						backgroundImage: `linear-gradient(155deg, rgba(10, 33, 73, 0.58), rgba(11, 94, 215, 0.42)), url(${slide.image})`,
					}}
				>
					<div className="auth-image-carousel__content">
						<h3>{slide.title}</h3>
						<p>{slide.description}</p>
					</div>
				</div>
			))}

			<div className="auth-image-carousel__dots">
				{authSlides.map((slide, index) => (
					<button
						type="button"
						key={slide.id}
						className={`auth-image-carousel__dot ${index === activeIndex ? 'is-active' : ''}`}
						onClick={() => setActiveIndex(index)}
						aria-label={`Go to auth slide ${index + 1}`}
					/>
				))}
			</div>
		</div>
	);
}
