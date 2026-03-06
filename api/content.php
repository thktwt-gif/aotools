<?php
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$storageDir = __DIR__ . '/../storage';
$contentFile = $storageDir . '/content.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0777, true);
}

$default = [
    'layout' => [
        ['type' => 'hero', 'title' => 'Industrial Packaging Line Solutions', 'body' => 'Build multilingual B2B pages with drag-and-drop sections, product catalogs, and content marketing workflows.'],
        ['type' => 'features', 'title' => 'Why Choose Us', 'body' => 'From can filling to seaming and labeling, all-in-one automation and global delivery support.'],
        ['type' => 'cta', 'title' => 'Request a Quote', 'body' => 'Talk to our engineers and get a custom proposal within 24 hours.']
    ],
    'products' => [
        ['id' => 1, 'name' => 'Automatic Can Seaming Machine', 'summary' => 'High-speed seaming with stable quality.', 'category' => 'Seaming'],
        ['id' => 2, 'name' => 'Powder Filling Machine', 'summary' => 'Accurate auger filling for powder products.', 'category' => 'Filling']
    ],
    'articles' => [
        ['id' => 1, 'title' => 'How to Choose a Can Packaging Line', 'excerpt' => 'Compare output, precision, and maintenance costs before investing.', 'status' => 'published']
    ]
];

if (!file_exists($contentFile)) {
    file_put_contents($contentFile, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function readContent($file, $fallback) {
    $raw = @file_get_contents($file);
    if ($raw === false) return $fallback;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $fallback;
}

if ($method === 'GET') {
    echo json_encode(['ok' => true, 'data' => readContent($contentFile, $default)], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!is_array($payload)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Invalid JSON']);
        exit;
    }

    $safe = [
        'layout' => is_array($payload['layout'] ?? null) ? array_values($payload['layout']) : [],
        'products' => is_array($payload['products'] ?? null) ? array_values($payload['products']) : [],
        'articles' => is_array($payload['articles'] ?? null) ? array_values($payload['articles']) : [],
    ];

    file_put_contents($contentFile, json_encode($safe, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    echo json_encode(['ok' => true, 'message' => 'saved']);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
