var midiInputs;
var valuesForMidiInput = [];

// Web midi input (--enable-web-midi)

document.addEventListener('DOMContentLoaded', mymidiInit);

function mymidiInit() {
	if (midiDisabled != true) {
		try {
			navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );
		} catch(e) {
			console.error(e);
		}
	}
}

////////////////////
function changeMidiInput() {
	var selectedValue = slii.inputs.selectMidi.value;
    var midiInput = midiInputs[selectedValue];
    midiInput.onmidimessage = onMIDIMessage;
}

///////////////////
function onMIDISuccess( midiAccess ) {
  console.log( "MIDI ready!" );
  midi = midiAccess;
  try { 
  	midiInputs = midi.inputs();
  	var i = 0;
  	for (var key in midiInputs) {
  		var entry = {};
  		entry.value = i;
  		entry.text = midiInputs[key].name;
  		valuesForMidiInput.push(entry);
  		i++;
  	}
  	//console.log(midi.inputs());
    midiInput = midi.inputs()[0]; //Hardcoded for first midi device
    midiInput.onmidimessage = onMIDIMessage;
  }
  catch (e) {
    console.error("Exception! Couldn't get i/o ports." + e );
  }
}

///////////////////
function onMIDIFailure(msg) {
  console.log( "Failed to get MIDI access - " + msg );
}

///////////////////
function onMIDIMessage( event ) {
	//Stop all midi
	if (midiDisabled == true) 
		return;
	var str = "MIDI message received at timestamp " + event.timestamp + "[" + event.data.length + " bytes]: ";
	for (var i=0; i<event.data.length; i++) {
		str += event.data[i].toString() + " ";
	}		
	//console.log( str );
	var midiCC = 0;
	for (var key in slii.inputs) {
		if (event.data[1] == midiCC) {
			console.log("midi triggered:", midiCC);
			//console.log(inputValue);
			if (slii.inputs[key].type == "number") {
				var range = slii.inputs[key].maxValue - slii.inputs[key].minValue;
				var inputValue = (event.data[2] / (127/range)) + slii.inputs[key].minValue;
				slii.inputs[key].value = inputValue;
			} else if (slii.inputs[key].type == "toggle") {
				//console.log("toggle", event.data[2]);
				slii.inputs[key].value = event.data[2] == 127 ? 1 : 0; 
			}
			slii.inputs[key].onChange();
		}
		midiCC++;
	}  
}