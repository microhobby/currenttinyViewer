/* SPDX-License-Identifier: GPL-3.0+ */
/*
 * Current Tiny Driver
 * 
 * Depends on Serial.js
 *
 * (C) Copyright 2018
 * Matheus Castello <matheus@castello.eng.br>
 */

CurrentTiny.NO_DEVICES = -1;
CurrentTiny.CONNECTED = 1;

function CurrentTiny()
{
	/* private */
	let uart = new Serial();
	let me = this;
	var ixPath = 0;
	var tryConnectRes = "";

	/* private */
	function connectToDevice (devs, onSuccess)
	{
		if (devs.length > ixPath)  {
			/* try to connect */
			uart.connect(devs[ixPath].path);
			uart.onConnect.addListener(function dada()
			{
				uart.onConnect.removeListener(dada);
				/* check version */
				me.getFirmwareVersion(function(res)
				{
					tryConnectRes = res;
					console.info(res);
				});
				/* timeout to response so try next */
				setTimeout(function() {
					if (tryConnectRes == "") {
						uart.disconnect();
						nextTryConnect(devs, onSuccess);
					}
					else if (onSuccess)
						onSuccess(CurrentTiny.CONNECTED);
				}, 2000);
			});
			ixPath++;
		} else {
			console.error("No devices found");
			if (onSuccess)
				onSuccess(CurrentTiny.NO_DEVICES);
			ixPath = 0;
		}
	}

	function nextTryConnect(devices, onSuccess) 
	{
		connectToDevice(devices, onSuccess);
	}

	/* public */
	this.connect = function(onSuccess)
	{
		/* get devices */
		Serial.getDevices(function(devices)
		{
			nextTryConnect(devices, onSuccess);
		});
	};

	/* send command to stop measures and disconnect uart port */
	this.disconnect = function()
	{
		/* firmware version 2018.1.10 has no stop command */
		uart.send("at+instant\n");
		setTimeout(function() {
			uart.disconnect();
		}, 5000);
	};

	/* Send command to get value from AVG current */
	this.getInstantAVGValue = function()
	{
		uart.send("at+instant\n");
	};

	/* Send command to receive values read every 10ms */
	this.flushValues = function(callback)
	{
		uart.send("at+flush\n");
		uart.onReadLine.addListener(function(text)
		{
			if (callback)
				callback(text);
			/* TODO made a better way to disconnect this listener */
		});
	};

	/* Send command to receive firmware version from current mini */
	this.getFirmwareVersion = function(callback)
	{
		uart.send("at+version\n");
		function readVersion(ver)
		{
			if (callback)
				callback(ver);
			uart.onReadLine.removeListener(readVersion);
		};
		uart.onReadLine.addListener(readVersion);
	};
}
