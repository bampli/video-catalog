<?php

namespace Tests\Traits;

use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\Resources\Json\JsonResource;

trait TestResources
{
    protected function assertResource(TestResponse $response, JsonResource $resource)
    {
        $response->assertJson($resource->response()->getData(true));
    }
}

// THIS IS HERE FOR DOCUMENTATION ONLY
// Extracted from CategoryControllerTest
//
// public function testStore()
//     {
//         $data = [
//             'name' => 'test'
//         ];
//         $response = $this->assertStore($data, $data + ['description' => null, 'is_active' => true, 'deleted_at' => null]);
//         $response->assertJsonStructure([
//             'data' => $this->serializedFields
//         ]);

//         $data = [
//             'name' => 'test',
//             'description' => 'description',
//             'is_active' => false
//         ];
//         $this->assertStore($data, $data + ['description' => 'description', 'is_active' => false]);

//         $id = $response->json('data.id');
//         $resource = new CategoryResource(Category::find($id));
//         $this->assertResource($response, $resource);

//         // $array = (new CategoryResource(Category::first()))->response()->getData(true);
//         // $response->assertJson($array);

//         // $json = (new CategoryResource(Category::first()))->response()->content();
//         // "{"data":{"id":"1fb378e6-cdd2-44b3-9711-d35d5955b4a4","name":"test",
//         // "description":"description","is_active":false,"deleted_at":null,
//         // "created_at":"2021-10-27 18:55:36","updated_at":"2021-10-27 18:55:36"}}"
//         //
//         // $json = (new CategoryResource(Category::first()))->response()->getData(true);
//         // array:1 [
//         //     "data" => array:7 [
//         //       "id" => "83bd7748-76e5-41d5-8299-38f722eea1c7"
//         //       "name" => "HoneyDew"
//         //       "description" => null
//         //       "is_active" => true
//         //       "deleted_at" => null
//         //       "created_at" => "2021-10-27 18:47:50"
//         //       "updated_at" => "2021-10-27 18:47:50"
//         //     ]
//         //   ]
//         // dump($json);
//     }