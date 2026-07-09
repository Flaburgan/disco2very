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

    $query = $pdo->prepare("INSERT INTO email(address, language) VALUES (:email, :language)");
    $query->execute(array(":email" => $email, ":language" => $language));
  } catch (PDOException $e) {
    // The UNIQUE index on email.address fails duplicate INSERTs with an
    // integrity violation (SQLSTATE 23000): the address is already registered
    if ($e->getCode() == 23000) {
      http_response_code(409);
    } else {
      error_log("[disCO2very] newsletter.php: ".$e->getMessage());
      http_response_code(500);
    }
  } catch (Exception $e) {
    error_log("[disCO2very] newsletter.php: ".$e->getMessage());
    http_response_code(500);
  }
}
?>