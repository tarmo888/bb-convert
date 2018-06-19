# Currency converter for Byteball
This is a stand-alone currency conversion tool for Byteball wallet, which supports converting 24 different currencies (including USD, EUR, BTC & ETH) into GByte, MByte, KByte and Byte amounts and if Byteball wallet is already installed then it opens the wallet where user can simply click Send to initiate the payment. This tool solves the problem that Byteball wallet doesn't have a built-in currency conversion tool for sending amount values other than native currency.

## Pre-filling inputs
It is possible to prefill form fields to request somebody to send, for example, 1 million Venezuelan Bolívar (VEF) by sending them a [link like this](https://tarmo888.github.io/bb-convert/#amount=1000000&currency=VEF&address=NTYO4ZKPRBPXW6WY2QUMJBPNDLOGX5OJ) (obviously with your own address). Just type in new values and it generates a new link on your browser address bar.

## QR code generator
There is also a QR code generator on this tool that could be useful for seller, who can enter the number in their local currency and show the QR code to buyer. Just fill all fields correctly and `QR code for mobile wallet` link will appear under the calculated amounts.

## Multi-address list generator
Byteball wallet supports sending to multiple addresses, which can be entered as 2 column (comma separated address and amount) list. This tool has a [multi-address mode](https://tarmo888.github.io/bb-convert/multi.html), but instead lets users enter the total amount they want to send and all the addresses they want to send to. By default, it will split the total amount equally (un-equally if some addresses appear multiple times) between the addresses and will generate the address list with amounts, which are compatible to be pasted into Byteball wallet. It also accepts any other 2 column (comma separated address and amount) lists in case user wants to weight some addresses to get proportionally bigger amount to be sent. When clicking on Copy button (GByte, MByte, KByte or Byte - depending what unit you have selected in your wallet app), it will generate a new list into your clipboard that can be pasted to wallet app.

## TESTNET wallet
This tool also lets you launch a [TESTNET wallet](https://byteball.org/testnet.html) instead [MAINNET wallet](https://byteball.org/#download) by adding a `testnet=1` param to URL fragment [like this](https://tarmo888.github.io/bb-convert/#testnet=1).

## License
MIT

## Thanks
* https://www.cryptocompare.com/api or https://min-api.cryptocompare.com/
* https://gist.github.com/aaronk6/d801d750f14ac31845e8
* https://github.com/jeromeetienne/jquery-qrcode
* https://github.com/jquery/jquery
* https://github.com/twbs/bootstrap/tree/v4-dev
* https://github.com/jackmoore/autosize
