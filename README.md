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
php artisan make:migration create-category-video-table

php artisan migrate:refresh --seed

php artisan make:migration create-category-video-table
php artisan make:migration create-genre-video-table
php artisan make:migration create-category-genre-table

php artisan make:rule GenreHasCategoriesRule

gcloud kms encrypt
gcloud kms decrypt

php artisan storage:link
php artisan make:resource CategoryResource
php artisan model:filter CategoryFilter

```

## Frontend upgrades

```
material-ui/core @4.12.3
material-ui/icons @4.11.2
notistack @1.0.10

```