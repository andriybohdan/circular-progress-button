<?php


sleep(1);

// header("HTTP/1.0 500 Internal Server Error");

header("Content-type: application/json");
header("Cache-Control: no-cache");
header("Expires: -1");

$response = array(
  'result' => "error",
);

echo json_encode($response);

