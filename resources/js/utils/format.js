export function formatPeso(value) {
    const amount = Number(value || 0);
    return `₱${amount.toFixed(2)}`;
}

export function getProductImageUrl(imagePath) {
    if (!imagePath) {
        return '/images/carousel/image3.jpg';
    }

    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    return `/storage/${imagePath}`;
}
