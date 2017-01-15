<?php

$data_post = '{
"RoundTrip": '.$_POST['RoundTrip'].',
"FromPlace": "'.$_POST['FromPlace'].'",
"ToPlace": "'.$_POST['ToPlace'].'",
"DepartDate": "'.$_POST['DepartDate'].'T00:00:00.000",
"ReturnDate": "'.$_POST['ReturnDate'].'T00:00:00.000",
"CurrencyType": "VND",
"Adult": '.$_POST['adult'].',
"Child": '.$_POST['child'].',
"Infant": '.$_POST['infant'].',
"Sources": "VietJetAir,VietnamAirlines,JetStar"
}';
//"Sources": "VietJetAir,VietnamAirlines,JetStar" -  Muốn tìm bao nhiêu hãng thì thêm vào cách nhau dấu ','
$username = 'vemaybay102.com'; $password = 'Xzk7RpsL1U';

$ch = curl_init();

$url = 'http://api.atvietnam.vn/oapi/airline/Flights/Find?$expand=TicketPriceDetails,TicketOptions,Details';
// expand thêm 3 trường TicketPriceDetails,Details,TicketOptions (có thể chỉ chọn 1 hay nhiều )
// TicketPriceDetails : Chi tiết giá Net , thuế phí của người lớn, trẻ em ...
// Details : Chi tiết các chặng dừng
// TicketOptions : Các hạng mục vé khác ( nếu có ), vd VNAirline có Economy Save, Economy Standard ...

curl_setopt($ch, CURLOPT_URL, $url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

//curl_setopt($ch, CURLINFO_HEADER_OUT, true);

curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json' )
);

curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);    		  //  curl authentication

curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");		//  curl authentication

curl_setopt($ch, CURLOPT_POST, 1);

curl_setopt($ch, CURLOPT_POSTFIELDS,$data_post);

$str =  curl_exec($ch);

curl_close($ch);

echo $str;
//?>