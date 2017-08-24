<?php

sleep(3);

header("Content-type: application/json");
header("Cache-Control: no-cache");
header("Expires: -1");

$name = isset($_POST['name']) && $_POST['name'] ? $_POST['name'] : "Noname";

$response = array(
  'result' => "OK",
  'message' => "Hello ".$name,
);


echo json_encode($response);

