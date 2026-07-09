<?php
include('allowed-origins.php');

$email = $_POST["email"] ?? null;
// A "language" longer than 5 characters ("fr-FR") is junk, keep the DB clean
$language = is_string($_POST["language"] ?? null) ? substr($_POST["language"], 0, 5) : "";

if (!is_string($email)) {
  http_response_code(400);
} else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
} else {
  include('db.php');

  try {
    $pdo = getDatabaseConnection();

    // We first check if the address is already in the DB
    $query = $pdo->prepare("SELECT address FROM email WHERE address = :email");
    $query->execute([":email" => $email]);
    $found = $query->fetchAll();
    
    if (count($found) > 0) {
      http_response_code(409);
    } else {
      $query = $pdo->prepare("INSERT INTO email(address, language) VALUES (:email, :language)");
      $query->execute(array(":email" => $email, ":language" => $language));
      $pdo->lastInsertId();
    }
  } catch (Exception $e) {
    error_log("[disCO2very] newsletter.php: ".$e->getMessage());
    http_response_code(500);
  }
}
?>