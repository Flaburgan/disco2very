<?php
include('allowed-origins.php');

$email = $_POST["email"];
if (!isset($email)) {
  http_response_code(400);
} else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
} else {
  include('db.php');

  try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);

    // We first check if the address is already in the DB
    $query = $pdo->prepare("SELECT address FROM email WHERE address = :email");
    $query->execute([":email" => $email]);
    $found = $query->fetchAll();
    
    if (count($found) > 0) {
      http_response_code(409);
    } else {
      $query = $pdo->prepare("INSERT INTO email(address, language) VALUES (:email, :language)");
      $query->execute(array(":email" => $email, ":language" => $_POST["language"]));
      $pdo->lastInsertId();
    }
  } catch (Exception $e) {
    http_response_code(500);
    exit($e->getMessage());
  }
}
?>