<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\CastMember;
use App\Models\Category;
use App\Models\Video;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Tests\TestCase;

abstract class BaseVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations;

    protected $video;
    protected $sendData;
    protected $serializedFields = [
        'id',
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'video_file_url',
        'thumb_file_url',
        'banner_file_url',
        'trailer_file_url',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ],
        'genres' => [
            '*' => [
                'id',
                'name',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ]
    ];

    protected function setUp():void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create([
            'opened' => false,
            'video_file' => "video_file.mp4",
            'thumb_file' => "thumb_file.jpg",
            'banner_file' => "banner_file.jpg",
            'trailer_file' => "trailer_file.mp4",
            // 'video_file' => UploadedFile::fake()->create("video_file.mp4"),
            // 'thumb_file' => UploadedFile::fake()->create("thumb_file.jpg"),
            // 'banner_file' => UploadedFile::fake()->create("banner_file.jpg"),
            // 'trailer_file' => UploadedFile::fake()->create("trailer_file.mp4"),
        ]);
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);
        $cast_member = factory(CastMember::class)->create();
        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id],
            'cast_members_id' => [$cast_member->id]
        ];
    }

    protected function assertIfFilesUrlExist(Video $video, TestResponse $response)
    {
        $fileFields = Video::$fileFields;
        $data = $response->json('data');
        $data = array_key_exists(0, $data) ? $data[0] : $data;
        foreach ($fileFields as $field) {
            $file = $video->{$field};
            //dump($data, $field, $data[$field . '_url']);
            $this->assertEquals(
                \Storage::url($video->relativeFilePath($file)),
                $data[$field . '_url']
            );
        }
    }
}
