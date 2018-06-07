# Cross-browser implementation of navigator.msLaunchUri

Microsoft’s [navigator.msLaunchUri](http://msdn.microsoft.com/en-us/library/ie/jj154912(v=vs.85).aspx) method only works in Internet Explorer on Windows 8. Therefore I came up with a (nearly) cross-browser implementation that uses the native `msLaunchUri` when it’s available and falls back to adventurous hacks when running in other browsers.

## Description

```
launchUri (uri, successCallback, noHandlerCallback, unknownCallback)
````

If a default protocol handler is available on the system that matches the URI, the `successCallback` is invoked, otherwise, the `noHandlerCallback` is called. This works in the following browsers:

* Internet Explorer 8-11 *(tested on Windows 7 and Windows 8)*
* Chrome *(tested with v. 39 on OS X and Windows)*
* Firefox *(tested with v. 34 on OS X and Windows)*

In all other browsers, the URI will be launched but you cannot find out if it worked (the `unknownCallback` is invoked).

**Example:**

```javascript
launchUri('x-my-app://example-string', function () {
	// SUCCESS - the protocol is registered and the user was asked to open
	// the URI in the appropriate application
	alert('Have fun with my app');
}, function () {
	// FAILURE - the protocol isn't registered
	alert('Y u no install my app?');
}, function () {
	// UNKNOWN - we don't know wether the protocol is registered or not
	alert('Hey, did my app launch? If not, please install it. kthxbye');
});
```

## License

MIT

## Credits

* http://www.rajeshsegu.com/2012/09/browser-detect-custom-protocols/
* http://stackoverflow.com/questions/2872090/how-to-check-if-a-custom-protocol-supported