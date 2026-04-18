<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'audience',
        'price',
        'size',
        'stock',
        'description',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    protected $appends = [
        'sizes',
        'image_paths',
    ];

    public function getSizesAttribute(): array
    {
        return collect(explode(',', (string) $this->size))
            ->map(fn ($item) => trim($item))
            ->filter()
            ->values()
            ->all();
    }

    public function getImagePathsAttribute(): array
    {
        $paths = $this->relationLoaded('productImages')
            ? $this->productImages->pluck('image_path')->all()
            : $this->productImages()->pluck('image_path')->all();

        if (!empty($this->image)) {
            array_unshift($paths, $this->image);
        }

        return collect($paths)
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function productImages()
    {
        return $this->hasMany(ProductImage::class)->orderBy('id');
    }
}
