<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'SoleStore') }}</title>
    @viteReactRefresh
    @vite('resources/js/main.jsx')
</head>
<body>
    <div id="app"></div>
</body>
</html>