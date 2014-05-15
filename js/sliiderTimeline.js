/////////
// Utility to be used in conjunction with vezerUtil.js
// Takes an object of animation timeline tracks and animates a Sliider scene with them


var sliiderTimeline = sliiderTimeline || {};

////////
// Initialize sliiderTimeline once with this function
// tracks: an object with timeline tracks as created by vezerUtil.js

sliiderTimeline.init = function (tracks) {
	sliiderTimeline._tracks = tracks;
	sliiderTimeline._bindings = {};
}

////////
// Automatically bind timeline tracks to input parameters
// The tracks in the Vezer generated XML must have the exact same titles as 
// the sliider inputs

sliiderTimeline.autoBind = function( inputs) {
	for (var key in inputs) {
		if (sliiderTimeline._tracks[key]) {
			sliiderTimeline.bind(key, inputs[key]);
		}
	}
}

///////
// Bind a timeline track to a Sliider input parameter

sliiderTimeline.bind = function (trackName, input) {
	sliiderTimeline._bindings[trackName] = input;
}

/////////
// Run this every animation frame. Input the current animation frame
// The values of all bound sliider inputs are then updated

sliiderTimeline.setValues = function (currentFrame) {
// 	sliiderTimeline._bindings.forEach( function(el, i) {
	for (var trackName in sliiderTimeline._bindings) {
		var trackData = sliiderTimeline._getTrackData(trackName);
		sliiderTimeline._setValue(sliiderTimeline._bindings[trackName], trackData, currentFrame)
	};
}

sliiderTimeline._getTrackData = function (trackName) {
	return sliiderTimeline._tracks[trackName];
}

//////////
// Internal function
// Sets the value of the input to the value given in the timeline
// Input is of a sliider.inputs object or another object that has this format:
// obj = { value: thevalue, minValue: val, maxValue: val }
// currentFrame is the current frame in the animation
// vezerTrack is the track object from Vezer that holds frame numbers and values

sliiderTimeline._setValue = function(input, track, currentFrame) {
	if (currentFrame in track) {
		//Does this set the original value?
		input.value = sliiderTimeline._scaleValue(track[ currentFrame ], input.minValue, input.maxValue);
		//Does this execute the onChange function?
		if (input.onChange) {
			input.onChange();
		}
	}
}

////////
// Internal function
// A normalized value (val between 0-1) is scaled to fit between min and max and returned

sliiderTimeline._scaleValue = function(val, min, max) {
	return (val * (max - min)) + min;
}
