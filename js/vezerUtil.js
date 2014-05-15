			/////////////
			// This script imports data from the application Vezér: http://www.vezerapp.hu
			// 1. Save a Vezer composition as XML using the menu item: File -> Render To XML
			// 2. Then in javascript do:
			//    var tracks = vezerUtil.parse(yourXMLFile); 
			//    to get access to frame by frame data for all tracks in the document
			// 3. This script depends on jQuery

			var vezerUtil = vezerUtil || {};
			vezerUtil.settings = vezerUtil.settings || {};


			////////////
			// Normalize: By default all values are scaled to the 0-1 range. So midi values will be converted to a value between 0-1.
			// Turn it off by setting this false

			vezerUtil.settings.normalize = true;

			////////////
			// Provide a URL of a Vezer XML document
			// Returns a javascript object with frame-by-frame data for all the tracks in the document

			vezerUtil.parse = function (dataUrl) {
				//Create object to store the data found in the xml document
	  			var vezerTracks = {};

	  			//Make the call syncronous ie. halt the script until it's finished
	  			$.ajaxSetup({async:false});

	  			//Get the xml document

			    $.ajax({
			    	type: "GET", 
			    	url: dataUrl, 
			    	dataType: "text"
			    })
			    .success(function(data) {

					//Create object for track properties such as name and min max values
					var trackProperties = {};

					//Iterate over the <name> tags
					$('tracks > name', data).each(function(i) {
						trackProperties[i] = {};
						trackProperties[i].name = $( this ).text();
					});

					//Iterate over the <min> tags
					$('tracks > min', data).each(function(i) {
						trackProperties[i].min = $( this ).text();
					});	  				

					//Iterate over the <max> tags
					$('tracks > max', data).each(function(i) {
						trackProperties[i].max = $( this ).text();
					});	

					//Iterate over all <process> tags
					$('tracks > process',data).each(function(i) {
						var valuesArray = $( this ).text().split(/\n/);
						//Insert data into object
						vezerUtil._insertDataInObject(valuesArray, trackProperties[i], vezerTracks);
					});
				  				
			    })
			    .error(function(jqXHR, textStatus, errorThrown) {
			        console.log("Error: " + textStatus + " " + errorThrown);
			        console.log("new line");
			    });

				$.ajaxSetup({async:true});

				return vezerTracks;
			}

			/////////////
			// Takes an array of the contents of a <process> tag, name of the track, and the object to insert the result into 
			
			// A note: When valuesArray comes from jquery the content is no longer valid XML. 
  			// A line in the array looks like this: "    <28>0.4980"

			vezerUtil._insertDataInObject = function(valuesArray, properties, vezerTracks) {
				var track = {};
				var value;

  				// Extract key and value
  				for(var i in valuesArray) {
  					var line = valuesArray[i];

  					// console.log("line",line);

  					var regex = /\d+(\.\d+)*/igm; //Match numbers and numbers followed by a dot and decimals.
					if (result = line.match(regex)) {
						if (result.length == 2) {
							if (vezerUtil.settings.normalize) {
								//Scale the value to always be between 0-1
								value = (result[1] - properties.min) / (properties.max - properties.min);
							} else {
								value = result[0];
							}						
							//Insert values into object
							track[result[0]] = value;
						}
					} 
  				}
  				vezerTracks[properties.name] = track;
			};