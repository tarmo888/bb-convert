# Currency converter for Byteball
This is a stand-alone currency conversion tool for Byteball wallet, which supports converting 24 different currencies into $GBYTE, $MByte, $KByte and $Byte amounts and if Byteball wallet is already installed then it opens the wallet where user can simply click Send to initiate the payment. This tool solves the problem that Byteball wallet doesn't have a built-in currency conversion tool for sending.

## Pre-filling inputs
It is possible to prefill form fields to request somebody to send, for example, 1 million Venezuelan Bolívar (VEF) by sending them a [link like this](https://tarmo888.github.io/bb-convert/#amount=1000000&currency=VEF&address=NTYO4ZKPRBPXW6WY2QUMJBPNDLOGX5OJ) (obviously with your own address). Just type in new values and it generates a new link on your browser address bar.

## QR code generator
There is built-in QR code generator that could be useful for seller, who can enter the number in their currency and show the qr code to buyer. Just fill all fields correctly and `QR code for mobile wallet` link will appear under calculated amounts.

## TESTNET wallet
It is possible to launch a [TESTNET wallet](https://byteball.org/testnet.html) instead [MAINNET wallet](https://byteball.org/#download) by adding a `testnet=1` param to URL fragment [like this](https://tarmo888.github.io/bb-convert/#testnet=1).

## License
MIT

## Thanks
* https://www.cryptocompare.com/api or https://min-api.cryptocompare.com/
* https://gist.github.com/aaronk6/d801d750f14ac31845e8
* https://github.com/jeromeetienne/jquery-qrcode
* https://github.com/jquery/jquery
* https://github.com/twbs/bootstrap/tree/v4-dev
