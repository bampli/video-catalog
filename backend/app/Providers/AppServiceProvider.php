<?php

namespace App\Providers;

use App\Models\Category;
// use App\Models\Genre;
// use App\Models\CastMember;
// use App\Observers\SyncModelObserver;

use App\Observers\CategoryObserver;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Category::observe(SyncModelObserver::class);
        // Genre::observe(SyncModelObserver::class);
        // CastMember::observe(SyncModelObserver::class);

        \View::addExtension('html', 'blade');
        Category::observe(CategoryObserver::class);
        
        //intercept and dump queries to DB
        // \DB::listen(function($query){
        //     dump($query->sql);
        // });
    }
}
