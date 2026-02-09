<?php
include('allowed-origins.php');

include('db.php');

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
  $query = $pdo->prepare("INSERT INTO launchedGame(appId, userAgent, categoriesMode, resolution, pixelRatio, availableResolution) VALUES (:appId, :userAgent, :categoriesMode, :resolution, :pixelRatio, :availableResolution)");
  $query->execute(array(
    ":appId" => $_POST["appId"],
    ":userAgent" => $_POST["userAgent"],
    ":categoriesMode" => $_POST["categoriesMode"],
    ":resolution" => $_POST["resolution"],
    ":pixelRatio" => $_POST["pixelRatio"],
    ":availableResolution" => $_POST["availableResolution"]
    )
  );
  $pdo->lastInsertId();

} catch (Exception $e) {
  http_response_code(500);
  exit($e->getMessage());
}
?>