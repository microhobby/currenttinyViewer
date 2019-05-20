/* SPDX-License-Identifier: GPL-3.0+ */
/*
 * Utils static functions 
 *
 * (C) Copyright 2018
 * Matheus Castello <matheus@castello.eng.br>
 */

Utils = {};

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
Utils.ab2str = function(buf) 
{
	var bufView = new Uint8Array(buf);
	var encodedString = String.fromCharCode.apply(null, bufView);
	
	return decodeURIComponent(escape(encodedString));
};

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
Utils.str2ab = function(str) 
{
	var encodedString = unescape(encodeURIComponent(str));
	var bytes = new Uint8Array(encodedString.length);
	
	for (var i = 0; i < encodedString.length; ++i) 
	{
		bytes[i] = encodedString.charCodeAt(i);
	}

	return bytes.buffer;
};
