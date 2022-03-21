<?php

namespace App\Models;

use App\ModelFilters\GenreFilter;
use EloquentFilter\Filterable;
use App\Models\Traits\SerializeDateToIso8601;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Chelout\RelationshipEvents\Concerns\HasBelongToManyEvents;

class Genre extends Model
{
    use SoftDeletes, Traits\Uuid, Filterable, SerializeDateToIso8601, HasBelongToManyEvents;

    protected $fillable = ['name', 'is_active'];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'id' => 'string',
        'is_active' => 'boolean'
    ];
    public $incrementing = false;
    protected $keyType = 'string';

    protected $observables = [
        'belongsToManyAttached'
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class)->withTrashed(); // withTrashed(): exclusion logic for deleted items
    }

    public function modelFilter()
    {
        return $this->provideFilter(GenreFilter::class);
    }
}

