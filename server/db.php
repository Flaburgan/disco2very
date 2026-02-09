<?php
  $configPath = __DIR__.'/db.ini';

  if (!file_exists($configPath)) {
      die("Configuration file not found.");
  }

  $dbSettings = parse_ini_file($configPath, true);

  if (!$dbSettings) {
      die("Failed to parse configuration file.".$configPath);
  }

  $host = $dbSettings['database']['host'];
  $dbname = $dbSettings['database']['dbname'];
  $username = $dbSettings['database']['username'];
  $password = $dbSettings['database']['password'];
?>