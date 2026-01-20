<?php
require 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM tasks ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['action'])) {
        if ($data['action'] === 'add') {
            $title = $data['title'] ?? '';
            if ($title) {
                $stmt = $pdo->prepare("INSERT INTO tasks (title) VALUES (?)");
                $stmt->execute([$title]);
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Title is required']);
            }
        } elseif ($data['action'] === 'toggle') {
            $id = $data['id'] ?? 0;
            $status = $data['status'] ?? 'pending';
            $stmt = $pdo->prepare("UPDATE tasks SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            echo json_encode(['success' => true]);
        } elseif ($data['action'] === 'delete') {
            $id = $data['id'] ?? 0;
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
    }
    exit;
}
