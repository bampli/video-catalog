<?php

use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;

class VideoSeeder extends Seeder
{
    private $allGenres;
    private $relations = [
        'genres_id' => [],
        'categories_id' => []
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dir = \Storage::getDriver()->getAdapter()->getPathPrefix();
        \File::deleteDirectory($dir, true);

        $self = $this;
        $this->allGenres = Genre::all();
        Model::reguard();   // enable mass assignment
        factory(\App\Models\Video::class, 20)
            ->make()
            ->each(function (Video $video) use($self) {
                $self->fetchRelations();
                \App\Models\Video::create(
                    array_merge(            // first parameter is overridden
                        $video->toArray(),
                        [
                            'thumb_file' => $self->getImageFile(),
                            'banner_file' => $self->getImageFile(),
                            'trailer_file' => $self->getImageFile(),
                            'video_file' => $self->getVideoFile(),
                        ],
                        $this->relations
                    )
                );
            });
        Model::unguard();
    }

    public function fetchRelations()
    {
        $subGenres = $this->allGenres->random(5)->load('categories');
        $categoriesId = [];
        foreach ($subGenres as $genre) {
            array_push($categoriesId, ...$genre->categories->pluck('id')->toArray());
        }
        $categoriesId = array_unique($categoriesId);
        $genresId = $subGenres->pluck('id')->toArray();
        $this->relations['categories_id'] = $categoriesId;
        $this->relations['genres_id'] = $genresId;
    }

    public function getImageFile()
    {
        return new UploadedFile(
            storage_path('faker/thumbs/Small_Image.jpg'),
            'Small_Image.jpg'
        );
    }

    public function getVideoFile()
    {
        return new UploadedFile(
            storage_path('faker/videos/Canoas_monkey_jump.mp4'),
            'Canoas_monkey_jump.mp4'
        );
    }

    /**
     * OLD VERSION: Run the database seeds.
     *
     * @return void
     */
    // public function run()
    // {
    //     $genres = Genre::all();
    //     factory(\App\Models\Video::class, 100)
    //         ->create()
    //         ->each(function (Video $video) use($genres){
    //             $subGenres = $genres->random(5)->load('categories');
    //             $categoriesId = [];
    //             // Both cases below without/with ... operator:
    //             // # [[1,2,3]]
    //             // foreach ($subGenres as $genre) {
    //             //     array_push($categoriesId, $genre->categories->pluck('id')->toArray());
    //             // }
    //             // # [1,2,3]
    //             foreach ($subGenres as $genre) {
    //                 array_push($categoriesId, ...$genre->categories->pluck('id')->toArray());
    //             }
    //             $categoriesId = array_unique($categoriesId);
    //             $video->categories()->attach($categoriesId);
    //             $video->genres()->attach($subGenres->pluck('id')->toArray());
    //         });
    // }

}
