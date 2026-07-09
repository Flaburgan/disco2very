<?php
// "null" is sent by the Ubuntu Touch webview (local files), but also by any
// sandboxed iframe: it is deliberately allowed, these endpoints respond
// nothing sensitive (status codes only, no credentials).
$allowed_origins = ["null", "file://", "https://disco2very.org", "https://www.disco2very.org"];

// The response depends on the Origin header, caches must key on it
header("Vary: Origin");

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
?>