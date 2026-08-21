<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('auctions:update-statuses')->everyMinute();
