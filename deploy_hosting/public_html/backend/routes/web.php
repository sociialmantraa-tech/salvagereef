<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'platform' => 'SalvageReef API',
        'status' => 'online',
        'version' => '1.0.0',
        'contact' => 'salvagereef@gmail.com'
    ]);
});
