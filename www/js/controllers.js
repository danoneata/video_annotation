$(document).ready(function() {

    var videoPlayer;

    $.get("anntation_number", function(data){
      
    });
    
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
	//videoPlayer = videojs("video-player")
        videojs('#video-player').src([
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
    
    
    
    videojs('#video-player').on('timeupdate', function(ev){
    var isPlaying =  !videojs("video-player").paused();
     if (document.getElementById("rb1").checked == true){;
	document.getElementById("t_start").value = videoPlayer.currentTime();
      }
      
      if (document.getElementById("rb2").checked == true){;
	document.getElementById("t_end").value = videoPlayer.currentTime();
      }
    });
    
    $('#add-ann').click( function(ev) {
          
        
	 //alert(videoPlayer.currentTime())
	 var x = document.getElementById("select_vocab");
	 var selected_values = [];
         for (var i = 0; i < x.options.length; i++) 
	 {
         if(x.options[i].selected == true)
	   selected_values[i] = x.options[i].value
	 }
	 //current_video = document.getElementById("select-video").value;
	 $.post("save_annotation",  {
	                             selected_video: document.getElementById("select-video").value,
	                             time_start: document.getElementById("t_start").value,
	                             time_end: document.getElementById("t_end").value,
		                     select_vocab: selected_values.join(" "),
	                             description: document.getElementById("description").value
	                            });
	 
	  //document.getElementById("select-video").value = current_video;
	document.getElementById("t_start").value = '';
	document.getElementById("t_end").value = '';
	document.getElementById("description").value = '';
	for (var i = 0; i < x.options.length; i++) 
	{
        if(x.options[i].selected == true)
	  document.getElementById("select_vocab").options[i].selected = false;
	}
	
	 document.getElementById("rb3").checked = true;
	 videojs("video-player").pause();
	
	 //$.get("save_annotation", function(ann_id){
	 //  alert(ann_id)
	 jQuery("<div class='ann-elem'><p id >lala</p></div>").appendTo("#annotation_list")
	 //});
	
	
	
    });
    
 document.addEventListener('keydown', function (evt) {
       var videoPlayer = videojs("video-player");
       frameTime = 1 / 30; //assume 30 fps
       videoPlayer.pause()
       t = videoPlayer.currentTime();
       if (evt.keyCode === 37) { //left arrows
          if (t  > 0) {
          //one frame back
          videoPlayer.currentTime(t-frameTime);
          }
       }   
       else if (evt.keyCode === 39) { //right arrow
            if (videoPlayer.currentTime() < videoPlayer.duration()) {
            //one frame forward
            //Don't go past the end, otherwise you may get an error
            videoPlayer.currentTime(Math.min(videoPlayer.duration(), t + frameTime));
            }
        
       }
 });
 
 
 $('input[type="radio"]').keydown(function(e)
{
    var arrowKeys = [37, 38, 39, 40];
    if (arrowKeys.indexOf(e.which) !== -1)
    {
        $(this).blur();
      
       
    }
});
    
});
