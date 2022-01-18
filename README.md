[![ci](https://github.com/bampli/video-catalog/actions/workflows/cloudbuild.yaml/badge.svg)](https://github.com/bampli/video-catalog/actions/workflows/cloudbuild.yaml)

# video-catalog
Fc2 video-catalog app

## Video Catalog

Containers based on docker-compose configuration files:

- Video Catalog API backend powered by Laravel/PHP
- React Frontend powered by node

```
CONTAINER ID   NAMES                IMAGE
5d4579dd6414   micro-videos-nginx   video-catalog_nginx
4ceec6411d66   micro-videos-app     video-catalog_app
f9970c75aac5   micro-videos-redis   redis:alpine
f2d734be7408   micro-videos-db      video-catalog_db
```

## Backend

Extracted from https://github.com/bampli/laravel-microservice-quickstart/tree/devgc

## Templates

```
php artisan make:model <model>
php artisan migrate:refresh --seed
php artisan make:migration create_category_video_table
php artisan make:migration create_genre_video_table
php artisan make:migration create_category_genre_table
php artisan make:migration create_cast_member_video_table
php artisan make:rule GenreHasCategoriesRule
php artisan storage:link
php artisan make:resource CategoryResource
php artisan model:filter CategoryFilter

gcloud kms encrypt
gcloud kms decrypt

```

## Frontend upgrades

```
material-ui/core @4.12.3
material-ui/icons @4.11.2
material-ui/lab@4.0.0-alpha.60
notistack @1.0.10
redux @4.1.2
reduxsauce @1.2.1
use-debounce @7.0.1

```