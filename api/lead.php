<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$message = trim($data['message'] ?? '');
$consent = $data['consent'] ?? '';

if ($name === '' || $email === '' || $message === '' || $consent === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Invalid email']);
    exit;
}

$dir = __DIR__ . '/../storage';
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

$leadFile = $dir . '/leads.log';
$logLine = json_encode([
    'time' => date('c'),
    'name' => $name,
    'email' => $email,
    'message' => $message,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
]) . PHP_EOL;
file_put_contents($leadFile, $logLine, FILE_APPEND | LOCK_EX);

$config = [
    'email' => getenv('LEAD_NOTIFY_EMAIL') ?: '',
    'wecom_webhook' => getenv('WECOM_WEBHOOK') ?: '',
];

$pushErrors = [];

if ($config['email'] !== '') {
    $subject = 'New Lead: ' . $name;
    $body = "Name: {$name}\nEmail: {$email}\nMessage: {$message}\n";
    $headers = 'From: noreply@omnireach.local';
    if (!@mail($config['email'], $subject, $body, $headers)) {
        $pushErrors[] = 'email_push_failed';
    }
}

if ($config['wecom_webhook'] !== '') {
    $payload = json_encode([
        'msgtype' => 'text',
        'text' => [
            'content' => "[OmniReach] New Lead\nName: {$name}\nEmail: {$email}\nMessage: {$message}",
        ],
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init($config['wecom_webhook']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($status < 200 || $status >= 300) {
        $pushErrors[] = 'wecom_push_failed';
    }
}

echo json_encode([
    'ok' => true,
    'message' => empty($pushErrors) ? 'lead_saved' : 'lead_saved_with_push_errors',
    'push_errors' => $pushErrors,
]);
