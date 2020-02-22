$(document).ready(function() {
	if (typeof window.autosize !== 'undefined') {
		autosize($('#bb_address'));
	}
	// update when amount or address typed in or pasted in
	$('#amount_to_send, #bb_address, #asset_id').on('keyup', function(e) {
		if ($('#asset_id').length) {
			settings.asset = $('#asset_id').val();
		}
		updateUrlFragment();
		updateAmount();
		parseAdresses($('#bb_address').val());
	});
	// update when amount increased with native controls or updated from url
	$('#amount_to_send, #bb_address, #asset_id').on('change', function(e) {
		if ($('#asset_id').length) {
			settings.asset = $('#asset_id').val();
		}
		updateUrlFragment();
		updateAmount();
		parseAdresses($('#bb_address').val());
	});
	// donate button with pre-filled inputs
	$('#donate').on('click', function(e) {
		setTimeout(function(){
			window.location.reload();
		}, 100);
	});
	// send button
	$('#send-button').on('click', function(e) {
		e.preventDefault();
		updateUrlFragment();
		var launch_data = updateAmount();
		if (launch_data.all_ok) {
			if ( !isValidAddress($('#bb_address').val()) ) {
				if (typeof ga === 'function') {
					ga('send', 'event', 'send-button', 'invalid', $('#amount_to_send_label').text());
				}
				alert('Please check the address, it\'s not valid!');
				return false;
			}
			launchUri(launch_data.launch_uri, function () {
				if (typeof ga === 'function') {
					ga('send', 'event', 'send-button', 'success', $('#amount_to_send_label').text());
				}
			}, function () {
				if (confirm('Unable to launch the wallet.\nClick OK to redirect to download page.')) {
					window.location = $(e.target).attr('href');
				}
				if (typeof ga === 'function') {
					ga('send', 'event', 'send-button', 'fail', $('#amount_to_send_label').text());
				}
			}, function () {
				if (typeof ga === 'function') {
					ga('send', 'event', 'send-button', 'unknown', $('#amount_to_send_label').text());
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
	$('.copy-blackbytes').on('click', function(e) {
		e.preventDefault();
		var launch_data = updateAmount();
		if (launch_data.blackbytes_ok) {
			var amount = launch_data.amounts[$(e.target).attr('rel')];
			var fixed = launch_data.fixed[$(e.target).attr('rel')];
			var fixed_amount = amount.toFixed(fixed);
			// copy to clipboard
			var copyText = document.createElement("textarea");
			copyText.textContent = fixed_amount;
			copyText.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
			document.body.appendChild(copyText);
			copyText.select();
			try {
				document.execCommand("copy");
				if (typeof ga === 'function') {
					ga('send', 'event', 'sendblackbytes-button', 'success', $('#amount_to_send_label').text());
				}
				alert('Amount is copied to your clipboard!\nPaste it to your wallet.');
			}
			catch (err) {
				if (typeof ga === 'function') {
					ga('send', 'event', 'sendblackbytes-button', 'fail', $('#amount_to_send_label').text());
				}
				alert('Coping failed!');
			}
			finally {
				document.body.removeChild(copyText);
			}
		}
		else {
			if (typeof ga === 'function') {
				ga('send', 'event', 'sendblackbytes-button', 'fill-fields');
			}
			alert('Please fill all fields!');
		}
	});
	$('.copy-multi').on('click', function(e) {
		e.preventDefault();
		var launch_data = updateAmount();
		if (launch_data.all_ok) {
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
					ga('send', 'event', 'sendmulti-button', 'success', $('#amount_to_send_label').text());
				}
				alert('New list is copied to your clipboard!\nPaste it to your wallet.');
			}
			catch (err) {
				if (typeof ga === 'function') {
					ga('send', 'event', 'sendmulti-button', 'fail', $('#amount_to_send_label').text());
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
});

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
	var currency_rate = parseFloat($('#currency_rate').attr('rel'));
	var bb_address = $('#bb_address').val();
	var amounts = {};
	var fixed = {'gbyte': 9, 'mbyte': 6, 'kbyte': 3, 'byte': 0, 'native': 0};
	if (currency_rate) {
		$('#conversion').html('');
		if (amount_to_send) {
			if (settings.asset != 'base' && settings.asset != 'qO2JsiuDMh/j+pqJYZw3u82O71WjCDf0vTNvsnntr8o=' && settings.asset != 'LUQu5ik4WLfCrr8OwXezqBa+i3IlZLqxj2itQZQm8WY=') {
				amounts['native'] = (amount_to_send/currency_rate);
				$('#conversion').append('<div>Amount: '+ amounts['native'].toFixed(fixed['native']) +'</div>');
			}
			else {
				amounts['gbyte'] = (amount_to_send/currency_rate);
				amounts['mbyte'] = (amount_to_send/currency_rate*1e3);
				amounts['kbyte'] = (amount_to_send/currency_rate*1e6);
				amounts['byte'] = (amount_to_send/currency_rate*1e9);
				amounts['native'] = amounts['byte'];
				$('#conversion').append('<div>'+ amounts['gbyte'].toFixed(fixed['gbyte']) +' '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +'</div>');
				$('#conversion').append('<div>'+ amounts['mbyte'].toFixed(fixed['mbyte']) +' '+ (settings.asset != 'base' ? 'MBByte' : 'MByte') +'</div>');
				$('#conversion').append('<div>'+ amounts['kbyte'].toFixed(fixed['kbyte']) +' '+ (settings.asset != 'base' ? 'KBByte' : 'KByte') +'</div>');
				$('#conversion').append('<div>'+ amounts['byte'].toFixed(fixed['byte']) +' '+ (settings.asset != 'base' ? 'BByte' : 'Byte') +'</div>');
			}
		}
	}
	else {
		$('#conversion').html('');
	}
	// wallet GUI multi-send total amount has bug that doesn't allow thousands with some regional settings
	var regional_bug = 'Wallet v2.2.0 has a bug that will not allow to send over 1000 of any unit with some regional settings.';
	if (amounts['gbyte'] && amounts['gbyte'] >= 1000) {
		$('button[rel="gbyte"]').attr('title', regional_bug);
	}
	else {
		$('button[rel="gbyte"]').removeAttr('title');
	}
	if (amounts['mbyte'] && amounts['mbyte'] >= 1000) {
		$('button[rel="mbyte"]').attr('title', regional_bug);
	}
	else {
		$('button[rel="mbyte"]').removeAttr('title');
	}
	if (amounts['kbyte'] && amounts['kbyte'] >= 1000) {
		$('button[rel="kbyte"]').attr('title', regional_bug);
	}
	else {
		$('button[rel="kbyte"]').removeAttr('title');
	}
	if (amounts['byte'] && amounts['byte'] >= 1000) {
		$('button[rel="byte"]').attr('title', regional_bug);
	}
	else {
		$('button[rel="byte"]').removeAttr('title');
	}
	if (amount_to_send && currency_rate && !bb_address) {
		return {'all_ok': false, 'blackbytes_ok': true, 'launch_uri': '', 'amounts': amounts, 'fixed': fixed};
	}
	else if (!amount_to_send || !currency_rate || !bb_address || !settings.asset) {
		return {'all_ok': false, 'blackbytes_ok': false, 'launch_uri': '', 'amounts': amounts, 'fixed': fixed};
	}
	var bb_amount = amounts['native'].toFixed(fixed['native']);
	var params = parseParams(window.location.hash);
	var launch_uri = (params.testnet ? 'obyte-tn:' : 'obyte:') + encodeURIComponent(bb_address) +'?amount='+ bb_amount +'&asset='+ (settings.asset != 'base' ? encodeURIComponent(settings.asset) : 'base');
	if ( typeof $.prototype.qrcode !== 'undefined' && isValidAddress(bb_address) ) {
		$('#conversion').append('<div class="mt-2"><a id="qr-opener" href="'+ launch_uri +'" data-toggle="modal" data-target="#qr-modal">QR code for mobile wallet</a></div>');
	}

	return {'all_ok': true, 'blackbytes_ok': true, 'launch_uri': launch_uri, 'amounts': amounts, 'fixed': fixed};
}
// updates URL fragment based on input values
function updateUrlFragment() {
	if (typeof history.replaceState !== 'undefined') {
		if ( parseFloat($('#amount_to_send').val()) || parseFloat($('#currency_rate').attr('rel')) || $('#asset_id').length || $('#bb_address').val() ) {
			var params = parseParams(window.location.hash);
			var addresses = $('#bb_address').val().split('\n');
			var new_addresses = [];
			// separate data from addresses
			$.each(addresses, function(key, value) {
				new_addresses.push(value.split(/[ \t,]+/).join(','));
			});
			var custom_asset = $('#asset_id').length && settings.asset != 'base' && settings.asset != 'qO2JsiuDMh/j+pqJYZw3u82O71WjCDf0vTNvsnntr8o=' && settings.asset != 'LUQu5ik4WLfCrr8OwXezqBa+i3IlZLqxj2itQZQm8WY=';
			var currency = !!parseFloat($('#currency_rate').attr('rel')) && $('#amount_to_send_label').text() == '?' ? parseFloat($('#currency_rate').attr('rel')) : $('#amount_to_send_label').text();
			var fragment = '#amount='+ ($('#amount_to_send').val() ? parseFloat($('#amount_to_send').val()) : '') +'&currency='+ currency + '&address='+ new_addresses.join(';') + (params.testnet ? '&testnet=1' : '') + ((custom_asset && settings.asset) ? '&asset='+ encodeURIComponent(settings.asset) : '') + ($('#asset_id').length ? '&price_bytes='+ parseFloat(settings.price_bytes) : '');
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
	var rates = rates || [];
	for (i in rates) {
		$('#currency_rate').append('<option value="'+ (rates[i]*settings.price_bytes) +'" data-value="'+ (rates[i]*settings.price_bytes) +'" rel="'+ i +'">'+ i +' ('+ (rates[i]*settings.price_bytes).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
	}
	if (settings.price_bytes) {
		if (settings.asset != 'base' && settings.price_bytes) {
			$('#currency_rate').append('<option value="'+ (1*settings.price_bytes) +'" data-value="'+ (1*settings.price_bytes) +'" rel="GByte">GByte ('+ (1*settings.price_bytes).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
			$('#currency_rate').append('<option value="'+ (1000*settings.price_bytes)  +'" data-value="'+ (1000*settings.price_bytes)  +'" rel="MByte">MByte ('+ (1000*settings.price_bytes).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
			$('#currency_rate').append('<option value="'+ (1000000*settings.price_bytes) +'" data-value="'+ (1000000*settings.price_bytes) +'" rel="KByte">KByte ('+ (1000000*settings.price_bytes).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
			$('#currency_rate').append('<option value="'+ (1000000000*settings.price_bytes) +'" data-value="'+ (1000000000*settings.price_bytes) +'" rel="Byte">Byte ('+ (1000000000*settings.price_bytes).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
		}
		$('#currency_rate').append('<option value="'+ (1) +'" data-value="'+ (1) +'" rel="'+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +'">'+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +' ('+ (1).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
		$('#currency_rate').append('<option value="'+ (1000) +'" data-value="'+ (1000) +'" rel="'+ (settings.asset != 'base' ? 'MBByte' : 'MByte') +'">'+ (settings.asset != 'base' ? 'MBByte' : 'MByte') +' ('+ (1000).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
		$('#currency_rate').append('<option value="'+ (1000000) +'" data-value="'+ (1000000) +'" rel="'+ (settings.asset != 'base' ? 'KBByte' : 'KByte') +'">'+ (settings.asset != 'base' ? 'KBByte' : 'KByte') +' ('+ (1000000).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
		$('#currency_rate').append('<option value="'+ (1000000000) +'" data-value="'+ (1000000000) +'" rel="'+ (settings.asset != 'base' ? 'BByte' : 'Byte') +'">'+ (settings.asset != 'base' ? 'BByte' : 'Byte') +' ('+ (1000000000).toLocaleString() +' = '+ (settings.asset != 'base' ? 'GBByte' : 'GByte') +')</option>');
	}
	var params = parseParams(window.location.hash);
	// pre-fill amount from URL fragment
	if (params.amount) {
		$('#amount_to_send').val(parseFloat(params.amount));
		$('#amount_to_send').trigger('change');
	}
	if (params.currency) {
		settings.selected_currency = params.currency;
	}
	if (settings.asset && $('#asset_id').length && !$('#asset_id option').length) {
		$('#asset_id').val(settings.asset);
		updateUrlFragment();
	}
	else if (params.asset) {
		settings.asset = decodeURIComponent(params.asset);
		$('#asset_id option').removeAttr('selected');
		if ($('#asset_id option[rel="'+ settings.asset +'"], #asset_id option[value="'+ settings.asset +'"]').length) {
			$('#asset_id option[rel="'+ settings.asset +'"], #asset_id option[value="'+ settings.asset +'"]').attr('selected', 'selected');
		}
		else {
			$('#asset_id').val(settings.asset);
		}
		$('#asset_id').attr('rel', settings.asset);
		$('#asset_id').trigger('change');
	}
	if (settings.selected_currency && $('#currency_rate option[rel="'+ settings.selected_currency +'"]').length) {
		$('#currency_rate option').removeAttr('selected');
		$('#currency_rate option[rel="'+ settings.selected_currency +'"]').attr('selected', 'selected');
		$('#amount_to_send_label').text(settings.selected_currency);
		$('#currency_rate').attr('rel', $('#currency_rate').val());
		$('#currency_rate').trigger('change');
		$('#amount_to_send').trigger('change');
		updateUrlFragment();
	}
	else if (!!parseFloat(settings.selected_currency)) {
		$('#currency_rate').attr('rel', settings.selected_currency);
	}
	// pre-select currency from dropdown (either from last use or from URL fragment)
	if (settings.selected_currency && $('#currency_rate option[rel="'+ settings.selected_currency +'"]').length) {
		$('#currency_rate option').removeAttr('selected');
		$('#currency_rate option[rel="'+ settings.selected_currency +'"]').attr('selected', 'selected');
		$('#amount_to_send_label').text(settings.selected_currency);
		$('#currency_rate').attr('rel', $('#currency_rate').val());
		$('#currency_rate').trigger('change');
	}
	else if (!!parseFloat(settings.selected_currency)) {
		$('#currency_rate').attr('rel', settings.selected_currency);
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
		$('#bb_address').trigger('change');
	}
	if (typeof window.EditableSelect !== 'undefined') {
		$('#currency_rate').editableSelect({ filter: false, effects: 'slide' }).on('select.editable-select', function (e, li) {
			$('#currency_rate').val(li.data('value') || ''); // li.val() was rounded for some reason
			$('#currency_rate').attr('rel', li.data('value') || 0);
			$('#amount_to_send_label').text(li.attr('rel') || '?');
			$('#amount_to_send').trigger('change');
			$('#currency_rate').trigger('change');
		});
		$('#currency_rate').off('keydown');
		$('#asset_id').editableSelect({ filter: false, effects: 'slide' }).on('select.editable-select', function (e, li) {
			settings.asset = li.attr('rel') || '';
			$('#asset_id').val(settings.asset);
			$('#asset_id').attr('rel', settings.asset);
			$('#asset_id').trigger('change');
		});
		if (!$('#asset_id').val()) {
			$('#asset_id').val(settings.asset);
		}
		$('#asset_id').off('keydown');
	}
	else {
		$('#currency_rate').on('change', function(e) {
			$('#amount_to_send_label').text(($('#currency_rate option:selected').attr('rel') || '?'));
			$('#currency_rate').attr('rel', $('#currency_rate').val());
			updateUrlFragment();
			updateAmount();
			parseAdresses($('#bb_address').val());
		});
	}
	$('#currency_rate').on('keyup', function(e) {
		//$('#currency_rate').editableSelect('hide');
		$('#currency_rate').attr('rel', e.target.value);
		$('#amount_to_send_label').text('?');
		updateUrlFragment();
		updateAmount();
		parseAdresses($('#bb_address').val());
	});
	$('#asset_id').on('change', function(e) {
		$('#asset_id').attr('rel', $('#asset_id').val());
		updateUrlFragment();
		updateAmount();
		parseAdresses($('#bb_address').val());
	});
	$('#asset_id').on('keyup', function(e) {
		//$('#asset_id').editableSelect('hide');
		$('#asset_id').attr('rel', e.target.value);
		settings.asset = e.target.value;
		updateUrlFragment();
		updateAmount();
		parseAdresses($('#bb_address').val());
	});
	if (!!parseFloat(settings.selected_currency)) {
		$('input#currency_rate').val(settings.selected_currency);
		updateUrlFragment();
		updateAmount();
		parseAdresses($('#bb_address').val());
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
// simple validation without checksum check https://github.com/byteball/ocore/blob/master/validation_utils.js
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
		/^steem\/[a-z0-9\-_.]{3,20}$/i.test(str) ||
		/^@([a-z\d\-_])+$/i.test(str) ||
		/^\+\d{9,14}$/.test(str);
}

// for making unique cache key
function utf8_to_b64( str ) {
	return window.btoa(encodeURIComponent(escape( str )));
}
function b64_to_utf8( str ) {
	return unescape(decodeURIComponent(window.atob( str )));
}

function loadRates(defaults) {
	// all CoinPaprika base currencies
	var url = 'https://api.coinpaprika.com/v1/tickers/gbyte-obyte?quotes=BTC,ETH,USD,EUR,PLN,KRW,GBP,CAD,JPY,RUB,TRY,NZD,AUD,CHF,UAH,HKD,SGD,NGN,PHP,MXN,BRL,THB,CLP,CNY,CZK,DKK,HUF,IDR,ILS,INR,MYR,NOK,PKR,SEK,TWD,ZAR,VND,BOB,COP,PEN,ARS,ISK';
	var cache_key = utf8_to_b64(url);
	if (typeof window.localStorage !== 'undefined') {
		// saves selected currency in local storage for longer
		var options = JSON.parse(localStorage.getItem(cache_key)) || {};
		$(document).on('change', '#currency_rate, #asset_id', function(e) {
			options.selected_currency = $('#amount_to_send_label').text();
			if ($('#asset_id').length) {
				options.asset =  $('#asset_id').val();
			}
			localStorage.setItem(cache_key, JSON.stringify(options));
		});
	}
	window.settings = $.extend({}, defaults, options, defaults);
	if (!window.settings.price_bytes) {
		drawRates();
	}
	else if (typeof window.sessionStorage !== 'undefined') {
		// keeps cached in session storage for reloading the page, clears cache on closing the tab
		var cached_rates = JSON.parse(sessionStorage.getItem(cache_key));
		if (cached_rates) {
			drawRates(cached_rates);
			if (typeof ga === 'function') {
				ga('send', 'event', 'CoinPaprika', 'cached-rates');
			}
		}
		else {
			$.get(url, function(response) {
				var rates = {};
				$.each(response.quotes, function(key, value) {
					var new_rate = {};
					new_rate[key] = value.price;
					if (key === 'USD' || key === 'EUR' || key === 'BTC' || key === 'ETH') {
						$.extend( new_rate, rates );
						rates = new_rate;
					}
					else {
						$.extend( rates, new_rate );
					}
				});
				drawRates(rates);
				sessionStorage.setItem(cache_key, JSON.stringify(rates));
				if (typeof ga === 'function') {
					ga('send', 'event', 'CoinPaprika', 'new-rates');
				}
			});
		}
	}
}
/*
function loadRates(defaults) {
	// all CryptoCompare base currencies
	var url = 'https://min-api.cryptocompare.com/data/price?fsym=GBYTE&tsyms=USD,EUR,GBP,BTC,ETH,STEEM,GOLD,AUD,BRL,BYN,CAD,CHF,CNY,HKD,HUF,INR,IRR,JPY,KRW,MXN,NZD,PHP,PKR,PLN,RON,RUB,SGD,TRY,UAH,VEF,VES&extraParams=' + encodeURIComponent(document.title);
	var cache_key = utf8_to_b64(url);
	if (typeof window.localStorage !== 'undefined') {
		// saves selected currency in local storage for longer
		var options = JSON.parse(localStorage.getItem(cache_key)) || {};
		$(document).on('change', '#currency_rate, #asset_id', function(e) {
			options.selected_currency = $('#amount_to_send_label').text();
			if ($('#asset_id').length) {
				options.asset =  $('#asset_id').val();
			}
			localStorage.setItem(cache_key, JSON.stringify(options));
		});
	}
	window.settings = $.extend({}, defaults, options, defaults);
	if (!window.settings.price_bytes) {
		drawRates();
	}
	else if (typeof window.sessionStorage !== 'undefined') {
		// keeps cached in session storage for reloading the page, clears cache on closing the tab
		var cached_rates = JSON.parse(sessionStorage.getItem(cache_key));
		if (cached_rates) {
			drawRates(cached_rates);
			if (typeof ga === 'function') {
				ga('send', 'event', 'CryptoCompare', 'cached-rates');
			}
		}
		else {
			$.get(url, function(response) {
				drawRates(response);
				sessionStorage.setItem(cache_key, JSON.stringify(response));
				if (typeof ga === 'function') {
					ga('send', 'event', 'CryptoCompare', 'new-rates');
				}
			});
		}
	}
}
*/
