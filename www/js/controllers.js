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
       
	 $.post("save_data", {start_value: document.getElementById("start").value})
	 $.post("get_id", {selected_video: document.getElementById("select-video").value})
	    
	 jQuery('<div/>', {
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
	 jQuery("<select> id = 's1' <option>word1</option> <option>word2</option> </select> <br>").appendTo("#annotation");
	 jQuery("<textarea class='scrollabletextbox' name='note'>lala</textarea>").appendTo("#annotation");
	 
    });
    
});
