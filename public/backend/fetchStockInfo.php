<?php
    $symbol = (String)$_GET['symbol'];
    if (!$symbol) die(json_encode(["error" => "Invalid Parameters"]));
    $url = "https://query1.finance.yahoo.com/v8/finance/chart/$symbol?region=US&lang=en-US&includePrePost=false&interval=1h&useYfid=true&range=max";

    $options = array(
        'http'=>array(
            'method'=>"GET",
            'header'=>"Accept-language: en\r\n" .
                    "Cookie: foo=bar\r\n" .
                    "User-Agent: Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.102011-10-16 20:23:10\r\n" // i.e. An iPad 
        )
    );

    $context = stream_context_create($options);
    echo file_get_contents($url, false, $context);
?>