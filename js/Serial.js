/* SPDX-License-Identifier: GPL-3.0+ */
/*
 * Chrome Serial class 
 *
 * (C) Copyright 2018
 * Matheus Castello <matheus@castello.eng.br>
 */


/* static */
Serial.chromeSerialAPI = chrome.serial;

Serial.getDevices = function(callback) 
{
	Serial.chromeSerialAPI.getDevices(callback)
};

function Serial(bitrate)
{
	/* private */
	var me = this;
	var serial = Serial.chromeSerialAPI;
	var conOptions = {
		"bitrate": ( bitrate ? bitrate : 9600),
		"dataBits": "eight",
		"parityBit": "no",
		"stopBits": "one",
	};

	/* public */
	this.connectionId = -1;
	this.lineBuffer = "";
	this.onConnect = new chrome.Event();
	this.onReadLine = new chrome.Event();
	this.onError = new chrome.Event();
	
	this.onConnectComplete = function(connectionInfo) 
	{
		if (!connectionInfo) 
		{
			console.error("Connection failed.");
			return;
		}
		else
			console.info("Device Connected", connectionInfo);

		serial.flush(connectionInfo.connectionId, function(){});
		this.connectionId = connectionInfo.connectionId;
		serial.onReceive.addListener(this.onReceive.bind(this));
		serial.onReceiveError.addListener(this.onReceiveError.bind(this));
		this.onConnect.dispatch();
		chrome.runtime.sendMessage({serial: me});
	};

	this.onReceive = function(receiveInfo) 
	{
		var index;

		if (receiveInfo.connectionId !== this.connectionId) 
		{
			return;
		}

		this.lineBuffer += Utils.ab2str(receiveInfo.data);

		while ((index = this.lineBuffer.indexOf('\n')) >= 0) 
		{
			var line = this.lineBuffer.substr(0, index + 1);
			
			this.onReadLine.dispatch(line);
			this.lineBuffer = this.lineBuffer.substr(index + 1);
		}
	};

	this.onReceiveError = function(errorInfo) 
	{
		console.error(errorInfo);
		if (errorInfo.connectionId === this.connectionId) 
		{
			this.onError.dispatch(errorInfo.error);
		}
	};

	this.connect = function(path) 
	{
		serial.connect(path, conOptions, 
			this.onConnectComplete.bind(this));
	};
	
	this.send = function(msg) 
	{
		if (this.connectionId < 0) 
		{
			throw 'Invalid connection';
		}
		
		console.warn(msg);

		serial.send(this.connectionId, Utils.str2ab(msg), 
			function(data)
			{
				console.info(data);
			});
	};

	this.disconnect = function() 
	{
		if (this.connectionId < 0) 
		{
			throw 'Invalid connection';
		}

		serial.disconnect(this.connectionId, function() 
		{
			me.connectionId = -1;
			console.info("Device disconnected");
		});
	};
};
