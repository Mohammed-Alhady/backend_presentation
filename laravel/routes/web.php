<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    // 1. الفخ الهندسي: تأخير مقصود لمدة 50 ملي ثانية لمحاكاة قاعدة البيانات
    usleep(50000);

    // 2. تجهيز مصفوفة لملئها بالبيانات الوهمية
    $students = [];

    // إنشاء 1000 طالب وهمي
    for ($i = 1; $i <= 1000; $i++) {
        $students[] = [
            'id' => $i,
            'name' => 'Student Number ' . $i,
            'department' => 'Software Engineering',
            'grade' => rand(50, 100)
        ];
    }

    // 3. إرجاع النتيجة على شكل JSON
    return response()->json([
        'status' => 'success',
        'framework' => 'Laravel Vanilla',
        'count' => count($students),
        'data' => $students
    ]);
});
