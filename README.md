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
![image](https://user-images.githubusercontent.com/86032/155351797-87a602dc-6947-4048-8ee3-a49f905c720f.png)

## Backend Admin Catálogo Vídeos

Extracted from https://github.com/bampli/laravel-microservice-quickstart/tree/devgc

### Templates

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

php artisan make:observer CategoryObserver --model="Models/Category"

php artisan vendor:publish --provider="Bschmitt\Amqp\AmqpServiceProvider"

```

errata
```
composer require bschmitt/laravel-amqp:2.0.10
vendor/composer/composer/bin/composer require bschmitt/laravel-amqp:2.0.10

```
CI/CD
```
gcloud kms encrypt
gcloud kms decrypt

composer require --dev laravel/dusk

npm config set cache /var/www/.npm-cache --global
npm --global cache verify

php artisan dusk:make FrontendTest
php artisan dusk --env=testing

# Note:
#   - since /opt/project/bootstrap/cache must be present and writable,
#   - its initialization was added to Dockerfile.
mkdir -p /opt/project/bootstrap/cache
chmod 777 /opt/project/bootstrap/cache

```

### Upgrades

```
laravel/dusk @v6.22.1

```

## Frontend Admin Catálogo Vídeos

### Frontend image

Generate optimized frontend image running at frontend container:

```
npm run build-laravel

```
Frontend image files are generated at:

- frontend/build

Frontend image files are also copied to backend:

- backend/public/admin-frontend
- backend/resources/views/admin-frontend

### Upgrades

```
classnames @2.3.1
immutability-helper @3.1.1
material-ui/core @4.12.3
material-ui/icons @4.11.2
material-ui/lab @4.0.0-alpha.60
object-to-formdata @4.4.1
notistack @1.0.10
react-hook-form @5.7.2
react-redux @7.2.6
redux @4.1.2
reduxsauce @1.2.1
use-debounce @7.0.1

```

