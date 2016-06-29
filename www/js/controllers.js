$(document).ready(function() {

    var videoPlayer;

    videojs("video-player").ready(function(){
      videoPlayer = this;
    });

    $.get("videos", function(data) {

        // Populate list of videos.
        $.each(data, function(i, datum) {
            $('#select-video').append($('<option>', {
                value: datum.name,
                text : datum.name
            }));
        });

        $('#select-video').selectpicker();

        function byName(name) {
            return function (datum) {return datum.name === name;}
        }

        // Change video on click.
        $('#select-video').on('changed.bs.select', function(ev, clickedIndex, newValue, oldValue) {
            name = $(this).val();
            datum = data.find(byName(name));
            videoPlayer.src([
                {
                    type: "video/mp4",
                    src: datum["source/mp4"],
                },
                {
                    type: "video/webm",
                    src: datum["source/webm"],
                },
            ]);
        });

        // When document ready show the first video in the list.
        datum = data.find(byName(data[0].name));
        videoPlayer.src([
            {
                type: "video/mp4",
                src: datum["source/mp4"],
            },
            {
                type: "video/webm",
                src: datum["source/webm"],
            },
        ]);
    });
    
    $('#add-ann').click( function(ev) {
       
	 //$.post("save_data", {start_value: document.getElementById("start").value})
	 var x = document.getElementById("select_vocab");
	 var selected_values = [];
         for (var i = 0; i < x.options.length; i++) 
	 {
         if(x.options[i].selected == true)
	   selected_values[i] = x.options[i].value
	 }
	 $.post("save_annotation",  {
	                             selected_video: document.getElementById("select-video").value,
	                             time_start: document.getElementById("t_start").value,
	                             time_end: document.getElementById("t_end").value,
		                     select_vocab: selected_values.join(" "),
	                             description: document.getElementById("description").value
	                            })
	 //$.post("save_annotation", {})
	 //$.post("save_annotation", {text_end: document.getElementById("t_end").value})
	// $.post("save_annotation", {select_vocab: document.getElementById("select_vocab").value})
	// $.post("save_annotation", {description: document.getElementById("description").value})
	 
	 
	 
	    
	 /*jQuery('<div/>', {
         id: 'annotation',
         title: 'Annotation',
	 class: 'ann-box'
         }).appendTo('#annotations');
	 jQuery("<div  >  <input type='radio' class = 'start_line' name = 'rb' id = 1 value = 'start'> Start <input class = 'start_line' type='text' name = 'text_start' id = t1 /> </div>").appendTo("#annotation"); 
	 //jQuery("<input type='radio' name = 'rb' id = 1 value = 'start'> Start <br>").appendTo("#annotation"); 
	 //jQuery("<input type='text' name = 'text_start' id = t1 />").appendTo("#annotation");
	 jQuery("<div id = 'end_line'>  <input type='radio' name = 'rb' id = 2 value = 'end'> End &nbsp<input type='text' name = 'text_end' id = t2 /> </div>").appendTo("#annotation"); 
	 //jQuery("<input type='radio' name = 'rb' id = 2 value = 'end'> End <br>").appendTo("#annotation");
	 //jQuery("<input type='text' name = 'text_end' id = t2 />").appendTo("#annotation");
	 jQuery("<input type='radio' name = 'rb' id = 3 value = 'free'> Free <br>").appendTo("#annotation");
	 jQuery("<select multiple> id = 's1' <option>word1</option> <option>word2</option> </select> <br>").appendTo("#annotation");
	 jQuery("<p>Hold down the Ctrl (windows) / Command (Mac) button to select multiple options.</p>").appendTo("#annotation");;
	 jQuery("<textarea class='scrollabletextbox' name='note'>lala</textarea>").appendTo("#annotation");
	 */
    });
    
});
