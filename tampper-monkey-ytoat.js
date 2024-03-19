// ==UserScript==
// @name         automatic original audio track selector
// @namespace    http://tampermonkey.net/
// @version      2024-03-20
// @description  Changes the default audio track of youtube video player for the original of the video
// @author       Jemd
// @match        https://*.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(() => {
	('use strict');

	// --- GLOBALS --------

	const DEBUG = true;

	// --------------------

	debugLog = message => {
		if (DEBUG) console.log('YTOAT | ' + message);
	};

	// --------------------

	// Used only for compatability with webextensions version of greasemonkey
	unwrapElement = el => {
		if (el && el.wrappedJSObject) {
			return el.wrappedJSObject;
		}
		return el;
	};

	// --------------------

	// Attempt to set the original audio track
	setOriginalAudioTrack = ytPlayer => {
		debugLog('Setting original audio track...');

		let audioTracks = ytPlayer.getAvailableAudioTracks();

		ytPlayer.setAudioTrack(audioTracks.find(track => track.uc.name.includes('original')));
	};

	// --------------------

	// Set resolution, but only when API is ready (it should normally already be ready)
	setOrigAudioTrack = ytPlayer => {
		!ytPlayer.getAvailableAudioTracks ? window.setTimeout(setOrigAudioTrack, 100, ytPlayer) : setOriginalAudioTrack(ytPlayer);
	};

	// --------------------

	main = () => {
		let ytPlayer = document.getElementById('movie_player') || document.getElementsByClassName('html5-video-player')[0];
		let ytPlayerUnwrapped = unwrapElement(ytPlayer);

		if (ytPlayerUnwrapped) setOrigAudioTrack(ytPlayerUnwrapped);

		let videoURI = '';
		window.addEventListener(
			'loadstart',
			e => {
				if (videoURI && e.target.baseURI === videoURI) {
					videoURI = e.target.baseURI;
					return;
				}
				videoURI = e.target.baseURI;

				let ytPlayer = document.getElementById('movie_player') || document.getElementsByClassName('html5-video-player')[0];
				let ytPlayerUnwrapped = unwrapElement(ytPlayer);

				if (ytPlayerUnwrapped) {
					debugLog('Loaded new video');
					setOrigAudioTrack(ytPlayerUnwrapped);
				}
			},
			true,
		);

		// This will eventually be changed to use the "once" option, but I want to keep a large range of browser support.
		window.removeEventListener('yt-navigate-finish', main, true);
	};

	main();
	// Youtube doesn't load the page immediately in new version so you can watch before waiting for page load
	// But we can only set resolution until the page finishes loading
	window.addEventListener('yt-navigate-finish', main, true);
})();
