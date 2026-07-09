<?php
  // Errors from all the endpoints including this file end up here.
  // The file is not publicly reachable, see .htaccess.
  ini_set('error_log', __DIR__.'/errors.log');

  function getDatabaseConnection(): PDO {
    $configPath = __DIR__.'/db.ini';

    if (!file_exists($configPath)) {
        error_log("[disCO2very] db.php: configuration file not found: ".$configPath);
        http_response_code(500);
        exit;
    }

    $dbSettings = parse_ini_file($configPath, true);

    if (!$dbSettings) {
        error_log("[disCO2very] db.php: failed to parse configuration file: ".$configPath);
        http_response_code(500);
        exit;
    }

    $db = $dbSettings['database'];

    return new PDO(
      "mysql:host={$db['host']};dbname={$db['dbname']};charset=utf8",
      $db['username'],
      $db['password'],
      // Explicit: the callers' try/catch blocks rely on exceptions
      // (only the default since PHP 8)
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
  }
?>
