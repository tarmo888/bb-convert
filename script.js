$(document).ready(function() {
	if (typeof window.autosize !== 'undefined') {
		autosize($('#bb_address'));
	}
	// update when amount or address typed in or pasted in
	$('#amount_to_send, #bb_address').on('keyup', function(e) {
		updateUrlFragment();
		updateAmount();
		parseAdresses($('#bb_address').val());
	});
	// update when amount increased with native controls or currency dropdown value change
	$('#amount_to_send, #currency_rate, #bb_address').on('change', function(e) {
		updateUrlFragment();
		updateAmount();
		parseAdresses($('#bb_address').val());
	});
	// regular send button
	$('#send-button').on('click', function(e) {
		e.preventDefault();
		updateUrlFragment();
		var launch_data = updateAmount();
		if (launch_data) {
			if ( !isValidAddress($('#bb_address').val()) ) {
				if (typeof ga === 'function') {
					ga('send', 'event', 'send-button', 'invalid', $('#currency_rate option:selected').attr('rel'));
				}
				alert('Please check the address, it\'s not valid!');
				return false;
			}
			launchUri(launch_data.launch_uri, function () {
				if (typeof ga === 'function') {
					ga('send', 'event', 'send-button', 'success', $('#currency_rate option:selected').attr('rel'));
				}
			}, function () {
				alert('Unable to launch Byteball wallet.\nClick OK to redirect to download page.');
				window.location = $(e.target).attr('href');
				if (typeof ga === 'function') {
					ga('send', 'event', 'send-button', 'fail', $('#currency_rate option:selected').attr('rel'));
				}
			}, function () {
				if (typeof ga === 'function') {
					ga('send', 'event', 'send-button', 'unknown', $('#currency_rate option:selected').attr('rel'));
				}
			});
		}
		else {
			if (typeof ga === 'function') {
				ga('send', 'event', 'send-button', 'fill-fields');
			}
			alert('Please fill all fields!');
		}
	});
	// donate button with pre-filled inputs
	$('#donate').on('click', function(e) {
		e.preventDefault();
		$('#amount_to_send').val(5);
		$("#currency_rate option").removeAttr("selected");
		$("#currency_rate option[rel='USD']").attr("selected", "selected");
		$('#bb_address').val('NTYO4ZKPRBPXW6WY2QUMJBPNDLOGX5OJ');
		updateUrlFragment();
		var launch_data = updateAmount();
		if (launch_data) {
			launchUri(launch_data.launch_uri, function () {
				if (typeof ga === 'function') {
					ga('send', 'event', 'donate-button', 'success', $('#currency_rate option:selected').attr('rel'));
				}
			}, function () {
				alert('Unable to launch Byteball wallet.\n\nThis tool was made by tarmo888.\nPrice data is provided by CryptoCompare API.');
				if (typeof ga === 'function') {
					ga('send', 'event', 'donate-button', 'fail', $('#currency_rate option:selected').attr('rel'));
				}
			}, function () {
				if (typeof ga === 'function') {
					ga('send', 'event', 'donate-button', 'unknown', $('#currency_rate option:selected').attr('rel'));
				}
			});
		}
		else {
			if (typeof ga === 'function') {
				ga('send', 'event', 'donate-button', 'fill-fields');
			}
			alert('USD currency not loaded!');
		}
	});
	$('.copy-multi').on('click', function(e) {
		e.preventDefault();
		var launch_data = updateAmount();
		if (launch_data) {
			// parse addresses
			var parsed = parseAdresses($('#bb_address').val());
			// count valid unique addresses
			if (!Object.keys(parsed.addresses).length) {
				if (typeof ga === 'function') {
					ga('send', 'event', 'sendmulti-button', 'not-enough');
				}
				alert('No valid addresses.');
				return false;
			}
			else if (Object.keys(parsed.addresses).length > 120) {
				if (typeof ga === 'function') {
					ga('send', 'event', 'sendmulti-button', 'too-many');
				}
				alert('Too many unique addresses.');
				return false;
			}
			// compose list
			var multi_list = [];
			$.each(parsed.addresses, function( address, count ) {
				var amount = launch_data.amounts[$(e.target).attr('rel')];
				var fixed = launch_data.fixed[$(e.target).attr('rel')];
				multi_list.push(address +', '+ (count/parsed.total_value*amount).toFixed(fixed));
			});
			// copy to clipboard
			var copyText = document.createElement("textarea");
			copyText.textContent = multi_list.join('\n');
			copyText.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
			document.body.appendChild(copyText);
			copyText.select();
			try {
				document.execCommand("copy");
				if (typeof ga === 'function') {
					ga('send', 'event', 'sendmulti-button', 'success', $('#currency_rate option:selected').attr('rel'));
				}
				alert('New list is copied to your clipboard!\nPaste it to your wallet.');
			}
			catch (err) {
				if (typeof ga === 'function') {
					ga('send', 'event', 'sendmulti-button', 'fail', $('#currency_rate option:selected').attr('rel'));
				}
				alert('Coping failed!');
			}
			finally {
				document.body.removeChild(copyText);
			}
		}
		else {
			if (typeof ga === 'function') {
				ga('send', 'event', 'sendmulti-button', 'fill-fields');
			}
			alert('Please fill all fields!');
		}
	});
	$('#conversion').on('click', '#qr-opener', function(e) {
		e.preventDefault();
		$('#qr-modal .modal-body').html('').qrcode({
			render: !!document.createElement('canvas').getContext ? 'canvas' : 'table',
			width: 420,
			height: 420,
			text: $(e.target).attr('href')
		});
	});
	$('#about-modal').on('show.bs.modal', function (e) {
		if (typeof ga === 'function') {
			ga('send', 'event', 'about-modal', 'open');
		}
	});
	$('#about-modal').on('hide.bs.modal', function (e) {
		if (typeof ga === 'function') {
			ga('send', 'event', 'about-modal', 'close');
		}
	});
	$('#qr-modal').on('show.bs.modal', function (e) {
		if (typeof ga === 'function') {
			ga('send', 'event', 'QR-code', 'open');
		}
	});
	$('#qr-modal').on('hide.bs.modal', function (e) {
		if (typeof ga === 'function') {
			ga('send', 'event', 'QR-code', 'close');
		}
	});

	// all cryptocompare base currencies
	var url = 'https://min-api.cryptocompare.com/data/price?fsym=GBYTE&tsyms=USD,EUR,GBP,BTC,ETH,STEEM,GOLD,AUD,BRL,CAD,CHF,CNY,HKD,HUF,INR,IRR,JPY,KRW,MXN,NZD,PHP,PKR,PLN,RON,RUB,SGD,VEF&extraParams=' + encodeURIComponent(document.title);
	var cache_key = utf8_to_b64(url);
	var settings = {'selected_currency': ''};
	if (typeof window.localStorage !== 'undefined') {
		// saves selected currency in local storage for longer
		settings = JSON.parse(localStorage.getItem(cache_key)) || settings;
		$('#currency_rate').on('change', function(e) {
			settings.selected_currency = $('#currency_rate option:selected').attr('rel');
			localStorage.setItem(cache_key, JSON.stringify(settings));
		});
	}
	if (typeof window.sessionStorage !== 'undefined') {
		// keeps cached in session storage for reloading the page, clears cache on closing the tab
		var cached_rates = JSON.parse(sessionStorage.getItem(cache_key));
		if (cached_rates) {
			rates = cached_rates;
			drawRates(rates);
			if (typeof ga === 'function') {
				ga('send', 'event', 'CryptoCompare', 'cached-rates');
			}
		}
		else {
			$.get(url, function(response) {
				rates = response;
				drawRates(rates);
				sessionStorage.setItem(cache_key, JSON.stringify(response));
				if (typeof ga === 'function') {
					ga('send', 'event', 'CryptoCompare', 'new-rates');
				}
			});
		}
	}

	// parses multiple address and gives feedback
	function parseAdresses(address_text) {
		var addresses = {};
		var total_value = 0;
		var invalid_count = 0;

		$.each(address_text.split('\n'), function( key, value ) {
			var address_list = value.split(/[ \t,]+/);
			var address_value = parseFloat(address_list[1]) ? parseFloat(address_list[1]) : 1;
			if (isValidAddress(address_list[0], true)) {
				if (addresses[address_list[0]]) {
					addresses[address_list[0]] += address_value;
				}
				else {
					addresses[address_list[0]] = address_value;
				}
				total_value += address_value;
			}
			else {
				invalid_count++;
			}
		});
		$('#parse-results').html('');
		if ($('#bb_address').val()) {
			$('#parse-results').append('<div>Total rows: '+ address_text.split('\n').length +'</div>');
			if (invalid_count) {
				$('#parse-results').append('<div>Invalid rows: '+ invalid_count +'</div>');
			}
			$('#parse-results').append('<div>Unique addresses: '+ Object.keys(addresses).length +'</div>');
			if ( total_value && total_value !== Object.keys(addresses).length ) {
				$('#parse-results').append('<div>Amount split by '+ total_value +'</div>');
			}
		}
		return {'addresses': addresses, 'total_value': total_value, 'invalid_count': invalid_count};
	}
	// calculates Byte amounts, returns launch URI and amounts
	function updateAmount() {
		var amount_to_send = parseFloat($('#amount_to_send').val());
		var currency_rate = parseFloat($('#currency_rate').val());
		var bb_address = $('#bb_address').val();
		var amounts = {};
		var fixed = {'gbyte': 9, 'mbyte': 6, 'kbyte': 3, 'byte': 0};
		if (currency_rate) {
			$('#amount_to_send_label').html($('#currency_rate option:selected').attr('rel'));
			$('#conversion').html('');
			if (amount_to_send) {
				amounts['gbyte'] = (amount_to_send/currency_rate);
				amounts['mbyte'] = (amount_to_send/currency_rate*1e3);
				amounts['kbyte'] = (amount_to_send/currency_rate*1e6);
				amounts['byte'] = (amount_to_send/currency_rate*1e9);
				$('#conversion').append('<div>'+ amounts['gbyte'].toFixed(fixed['gbyte']) +' GByte</div>');
				$('#conversion').append('<div>'+ amounts['mbyte'].toFixed(fixed['mbyte']) +' MByte</div>');
				$('#conversion').append('<div>'+ amounts['kbyte'].toFixed(fixed['kbyte']) +' KByte</div>');
				$('#conversion').append('<div>'+ amounts['byte'].toFixed(fixed['byte']) +' Byte</div>');
			}
		}
		else {
			$('#conversion').html('');
			$('#amount_to_send_label').html('?');
		}
		// wallet GUI multi-send total amount has bug that doesn't allow thousands with some regional settings
		var regional_bug = 'Byteball wallet v2.2.0 has a bug that will not allow to send over 1000 of any unit with some regional settings.';
		if (amounts['gbyte'] >= 1000) {
			$('button[rel="gbyte"].copy-multi').attr('title', regional_bug);
		}
		else {
			$('button[rel="gbyte"].copy-multi').removeAttr('title');
		}
		if (amounts['mbyte'] >= 1000) {
			$('button[rel="mbyte"].copy-multi').attr('title', regional_bug);
		}
		else {
			$('button[rel="mbyte"].copy-multi').removeAttr('title');
		}
		if (amounts['kbyte'] >= 1000) {
			$('button[rel="kbyte"].copy-multi').attr('title', regional_bug);
		}
		else {
			$('button[rel="kbyte"].copy-multi').removeAttr('title');
		}
		if (amounts['byte'] >= 1000) {
			$('button[rel="byte"].copy-multi').attr('title', regional_bug);
		}
		else {
			$('button[rel="byte"].copy-multi').removeAttr('title');
		}
		if (!amount_to_send || !currency_rate || !bb_address) {
			return false;
		}
		var bb_amount = (amount_to_send/currency_rate*1e9).toFixed(0);
		var params = parseParams(window.location.hash);
		var launch_uri = 'byteball:'+ encodeURIComponent(bb_address) +'?amount='+ bb_amount;
		if (params.testnet) {
			launch_uri = 'byteball-tn:'+ encodeURIComponent(bb_address) +'?amount='+ bb_amount;
		}
		if ( typeof $.prototype.qrcode !== 'undefined' && isValidAddress(bb_address) ) {
			$('#conversion').append('<div class="mt-2"><a id="qr-opener" href="'+ launch_uri +'" data-toggle="modal" data-target="#qr-modal">QR code for mobile wallet</a></div>');
		}

		return {'launch_uri': launch_uri, 'amounts': amounts, 'fixed': fixed};
	}
	// updates URL fragment based on input values
	function updateUrlFragment() {
		if (typeof history.replaceState !== 'undefined') {
			if ( parseFloat($('#amount_to_send').val()) || $('#currency_rate option:selected').attr('rel') || $('#bb_address').val() ) {
				var params = parseParams(window.location.hash);
				var addresses = $('#bb_address').val().split('\n');
				var new_addresses = [];
				// separate data from addresses
				$.each(addresses, function(key, value) {
					new_addresses.push(value.split(/[ \t,]+/).join(','));
				});
				var fragment = '#amount='+ ($('#amount_to_send').val() ? parseFloat($('#amount_to_send').val()) : '') +'&currency='+ $('#currency_rate option:selected').attr('rel') + '&address='+ new_addresses.join(';') + (params.testnet ? '&testnet=1' : '');
				history.replaceState(null, null, fragment);
			}
			else {
				history.replaceState(null, null, '#');
			}
		}
	}
	// fills currency dropdown and pre-fills inputs
	function drawRates(rates) {
		// currency rates loop
		for (i in rates) {
			$('#currency_rate').append('<option value="'+ rates[i] +'" rel="'+ i +'">'+ i +' ('+ rates[i].toLocaleString() +' = GByte)</option>');
		}
		$('#currency_rate').append('<option value="1" rel="GByte">GByte (1 = GByte)</option>');
		$('#currency_rate').append('<option value="1000" rel="MByte">MByte ('+ (1000).toLocaleString() +' = GByte)</option>');
		$('#currency_rate').append('<option value="1000000" rel="KByte">KByte ('+ (1000000).toLocaleString() +' = GByte)</option>');
		$('#currency_rate').append('<option value="1000000000" rel="Byte">Byte ('+ (1000000000).toLocaleString() +' = GByte)</option>');
		var params = parseParams(window.location.hash);
		// pre-fill amount from URL fragment
		if (params.amount) {
			$('#amount_to_send').val(parseFloat(params.amount));
			$("#amount_to_send").trigger("change");
		}
		if (params.currency) {
			settings.selected_currency = params.currency;
		}
		// pre-select currency from dropdown (either from last use or from URL fragment)
		if (settings.selected_currency && $("#currency_rate option[rel='"+ settings.selected_currency +"']").length) {
			$("#currency_rate option").removeAttr("selected");
			$("#currency_rate option[rel='"+ settings.selected_currency +"']").attr("selected", "selected");
			$("#currency_rate").trigger("change");
		}
		// pre-fill address from URL fragment
		if (params.address) {
			if ($('#bb_address').prop('type') == 'textarea') {
				$('#bb_address').val(decodeURIComponent(params.address).split(';').join('\n'));
				if (typeof window.autosize !== 'undefined') {
					autosize.update($('#bb_address'));
				}
			}
			else {
				$('#bb_address').val(decodeURIComponent(params.address).split(';')[0]);
			}
			$("#bb_address").trigger("change");
		}
	}
	// for parsing windows.location.search or windows.location.hash
	function parseParams(params) {
		var hash = params.substring(1);
		var param_list = {}
		$.each(hash.split('&') , function( key, value ) {
			var temp = value.split('=');
			param_list[temp[0]] = temp[1];
		});
		return param_list;
	}
	// for making unique cache key
	function utf8_to_b64( str ) {
		return window.btoa(encodeURIComponent(escape( str )));
	}
	function b64_to_utf8( str ) {
		return unescape(decodeURIComponent(window.atob( str )));
	}
	// simple validation without checksum check https://github.com/byteball/byteballcore/blob/master/validation_utils.js
	function isValidAddress(str, multi) {
		if (typeof str !== "string") {
			return false;
		}
		if (multi) {
			return str === str.toUpperCase() && str.length === 32;
		}
		// v2.4.1 wallet accepts launch URIs with email, different aliases and phone
		return (str === str.toUpperCase() && str.length === 32) ||
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(str) ||
			/^reddit\/[a-z0-9\-_]{3,20}$/i.test(str) ||
			/^steem\/[a-z0-9\-_]{3,20}$/i.test(str) ||
			/^@([a-z\d\-_])+$/i.test(str) ||
			/^\+\d{9,14}$/.test(str);
	}
});