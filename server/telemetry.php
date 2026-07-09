<?php
include('allowed-origins.php');

// Every field the app sends, with a maximum length: reject incomplete POSTs
// and truncate oversized values so junk requests cannot fill the DB
$fields = [
  "appId" => 36, // UUID
  "userAgent" => 512,
  "categoriesMode" => 1,
  "resolution" => 32,
  "pixelRatio" => 32,
  "availableResolution" => 32,
];

$values = [];
foreach ($fields as $name => $maxLength) {
  if (!is_string($_POST[$name] ?? null)) {
    http_response_code(400);
    exit;
  }
  $values[":".$name] = substr($_POST[$name], 0, $maxLength);
}

include('db.php');

try {
  $pdo = getDatabaseConnection();
  $query = $pdo->prepare("INSERT INTO launchedGame(appId, userAgent, categoriesMode, resolution, pixelRatio, availableResolution) VALUES (:appId, :userAgent, :categoriesMode, :resolution, :pixelRatio, :availableResolution)");
  $query->execute($values);

} catch (Exception $e) {
  error_log("[disCO2very] telemetry.php: ".$e->getMessage());
  http_response_code(500);
}
?>