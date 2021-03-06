<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Video;
use App\Models\Genre;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use TestValidations, TestUploads, TestSaves;
    
    public function testInvalidationThumbField()
    {
        $this->assertInvalidationFile(
            'thumb_file',
            'jpg',
            Video::THUMB_FILE_MAX_SIZE,
            'image');
    }
    
    public function testInvalidationBannerField()
    {
        $this->assertInvalidationFile(
            'banner_file',
            'jpg',
            Video::BANNER_FILE_MAX_SIZE,
            'image');
    }
    
    public function testInvalidationTrailerField()
    {
        $this->assertInvalidationFile(
            'trailer_file',
            'mp4',
            Video::TRAILER_FILE_MAX_SIZE,
            'mimetypes', ['values' => 'video/mp4']
        );
    }
    
    public function testInvalidationVideoField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            Video::VIDEO_FILE_MAX_SIZE,
            'mimetypes', ['values' => 'video/mp4']
        );
    }
    
    public function testStoreWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();

        $response = $this->json(
            'POST',
            $this->routeStore(),
            $this->sendData + $files
        );

        $response->assertStatus(201);
        $this->assertFilesOnPersist($response, $files);
        $video = Video::find($this->getIdFromResponse($response));
        $this->assertIfFilesUrlExist($video, $response);
    }
    
    public function testUpdateWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();

        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData + $files
        );

        $response->assertStatus(200);
        $this->assertFilesOnPersist($response, $files);
        $video = Video::find($this->getIdFromResponse($response));
        $this->assertIfFilesUrlExist($video, $response);

        $newFiles = [
            'thumb_file' => UploadedFile::fake()->create("thumb_file.jpg"),
            'video_file' => UploadedFile::fake()->create("video_file.mp4"),
        ];

        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData + $newFiles
        );
        $response->assertStatus(200);
        $this->assertFilesOnPersist(
            $response, 
            Arr::except($files, ['thumb_file', "video_file"]) + $newFiles
        );

        $video = Video::find($this->getIdFromResponse($response));
        \Storage::assertMissing($video->relativeFilePath($files['thumb_file']->hashName()));
        \Storage::assertMissing($video->relativeFilePath($files['video_file']->hashName()));
        $this->assertIfFilesUrlExist($video, $response);
    }

    protected function assertFilesOnPersist(TestResponse $response, $files)
    {
        $video = Video::find($this->getIdFromResponse($response));
        $this->assertFilesExistInStorage($video, $files);
    }

    protected function getFiles()
    {
        return [
            'thumb_file' => UploadedFile::fake()->create('thumb_file.jpg'),
            'banner_file' => UploadedFile::fake()->create('banner_file.jpg'),
            'trailer_file' => UploadedFile::fake()->create("trailer_file.mp4"),
            'video_file' => UploadedFile::fake()->create("video_file.mp4"),
        ];
    }

    protected function routeStore()
    {
        return route('videos.store');
    }

    protected function routeUpdate()
    {
        return route('videos.update', ['video' => $this->video->id]);
    }
    
    protected function model()
    {
        return Video::class;
    }
}
