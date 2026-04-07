<?php

namespace App\Http\Controllers;

use App\Models\ProductImage;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    private const ALLOWED_CATEGORIES = [
        'Formal School Shoes',
        'PE / Rubber Shoes',
        'Black Leather Shoes',
        'White School Shoes',
    ];

    public function index()
    {
        $products = Product::with('productImages:id,product_id,image_path')
            ->orderByDesc('id')
            ->get();

        return response()->json($products);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('productImages:id,product_id,image_path'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'size' => ['nullable', 'string', 'max:255'],
            'sizes' => ['nullable', 'array', 'min:1'],
            'sizes.*' => ['required', 'string', 'max:50'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'images' => ['nullable', 'array'],
            'images.*' => ['required', 'image', 'max:2048'],
        ]);

        $category = $this->normalizeCategory($validated['category']);
        $sizeValue = $this->resolveSizeValue($validated);

        $imagePath = $request->hasFile('image')
            ? $request->file('image')->store('products', 'public')
            : null;

        $extraImagePaths = [];
        if ($request->hasFile('images')) {
            $extraImagePaths = collect($request->file('images'))
                ->map(fn ($file) => $file->store('products', 'public'))
                ->all();
        }

        $allPaths = collect([$imagePath])
            ->merge($extraImagePaths)
            ->filter()
            ->unique()
            ->values();

        if (empty($imagePath) && $allPaths->isNotEmpty()) {
            $imagePath = $allPaths->first();
        }

        $product = Product::create([
            'name' => $validated['name'],
            'category' => $category,
            'price' => $validated['price'],
            'size' => $sizeValue,
            'stock' => $validated['stock'],
            'description' => $validated['description'] ?? '',
            'image' => $imagePath,
        ]);

        foreach ($allPaths as $path) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
            ]);
        }

        $product->load('productImages:id,product_id,image_path');

        return response()->json([
            'message' => 'Product added successfully.',
            'product' => $product,
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'size' => ['nullable', 'string', 'max:255'],
            'sizes' => ['nullable', 'array', 'min:1'],
            'sizes.*' => ['required', 'string', 'max:50'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'images' => ['nullable', 'array'],
            'images.*' => ['required', 'image', 'max:2048'],
            'removed_image_ids' => ['nullable', 'array'],
            'removed_image_ids.*' => ['required', 'integer'],
        ]);

        $category = $this->normalizeCategory($validated['category']);
        $sizeValue = $this->resolveSizeValue($validated);

        if ($request->hasFile('image')) {
            $previousMainImage = $product->image;

            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $product->image = $request->file('image')->store('products', 'public');

            if (!empty($previousMainImage)) {
                $product->productImages()->where('image_path', $previousMainImage)->delete();
            }

            ProductImage::firstOrCreate([
                'product_id' => $product->id,
                'image_path' => $product->image,
            ]);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $file->store('products', 'public'),
                ]);
            }
        }

        if (!empty($validated['removed_image_ids']) && is_array($validated['removed_image_ids'])) {
            $imagesToRemove = $product->productImages()
                ->whereIn('id', $validated['removed_image_ids'])
                ->get();

            foreach ($imagesToRemove as $image) {
                Storage::disk('public')->delete($image->image_path);

                if ($product->image === $image->image_path) {
                    $product->image = null;
                }

                $image->delete();
            }
        }

        $product->name = $validated['name'];
        $product->category = $category;
        $product->price = $validated['price'];
        $product->size = $sizeValue;
        $product->stock = $validated['stock'];
        $product->description = $validated['description'] ?? '';

        $this->syncMainImageFromGallery($product);
        $product->save();

        $product->load('productImages:id,product_id,image_path');

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product,
        ]);
    }

    public function destroy(Product $product)
    {
        $paths = $product->productImages()
            ->pluck('image_path')
            ->push((string) $product->image)
            ->filter()
            ->unique();

        foreach ($paths as $path) {
            Storage::disk('public')->delete($path);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    private function normalizeCategory(string $value): string
    {
        $normalized = trim(strtolower($value));

        $legacyMap = [
            'men' => 'Formal School Shoes',
            'women' => 'White School Shoes',
            'kids' => 'PE / Rubber Shoes',
        ];

        if (array_key_exists($normalized, $legacyMap)) {
            return $legacyMap[$normalized];
        }

        foreach (self::ALLOWED_CATEGORIES as $allowedCategory) {
            if (strtolower($allowedCategory) === $normalized) {
                return $allowedCategory;
            }
        }

        abort(422, sprintf('Category must be one of: %s.', implode(', ', self::ALLOWED_CATEGORIES)));
    }

    private function resolveSizeValue(array $validated): string
    {
        $sizes = [];

        if (!empty($validated['sizes']) && is_array($validated['sizes'])) {
            $sizes = $validated['sizes'];
        } elseif (!empty($validated['size'])) {
            $sizes = explode(',', (string) $validated['size']);
        }

        $sizes = collect($sizes)
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (empty($sizes)) {
            abort(422, 'Please provide at least one size.');
        }

        return implode(', ', $sizes);
    }

    private function syncMainImageFromGallery(Product $product): void
    {
        if (!empty($product->image)) {
            ProductImage::firstOrCreate([
                'product_id' => $product->id,
                'image_path' => $product->image,
            ]);

            return;
        }

        $firstGalleryImage = $product->productImages()
            ->orderBy('id')
            ->first();

        if ($firstGalleryImage) {
            $product->image = $firstGalleryImage->image_path;
        }
    }
}
