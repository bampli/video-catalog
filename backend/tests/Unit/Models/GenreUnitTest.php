<?php

namespace Tests\Unit\Models;

use App\Models\Genre;
use App\Models\Traits\SerializeDateToIso8601;
use App\Models\Traits\Uuid;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Framework\TestCase;
use Tests\Unit\Models\Chelout\RelationshipEvents\Concerns\HasBelongsToManyEvents;

class GenreUnitTest extends TestCase
{
    private $genre;

    protected function setup(): void
    {
        parent::setup();
        $this->genre = new Genre();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'is_active'];
        $this->assertEquals($fillable, $this->genre->getFillable());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class,
            Uuid::class,
            Filterable::class,
            SerializeDateToIso8601::class,
            HasBelongsToManyEvents::class,
        ];
        $genreTraits = array_keys(class_uses(Genre::class));
        $this->assertEquals($traits, $genreTraits);
    }

    public function testCasts()
    {
        $casts = ['id' => 'string', 'is_active' => 'boolean'];
        $this->assertEquals($casts, $this->genre->getCasts());
    }

    public function testIncrementing()
    {
        $this->assertFalse($this->genre->incrementing);
    }

    public function testDatesAttributes()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        $this->assertEqualsCanonicalizing($dates, $this->genre->getDates());
        $this->assertCount(count($dates), $this->genre->getDates());
    }
}
