$(document).ready(function() {

    
    
    var videoPlayer = videojs("video-player");
     
    $.get("videos", function(data) {
        videoPlayer.playlist(data);
        videoPlayer.playlistUi();
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
	 video_list = videojs("video-player").playlist();
	 $.post("save_annotation",  {
	                             selected_video: video_list[videojs("video-player").playlist.currentItem()].name,
	                             time_start: document.getElementById("t_start").value,
	                             time_end: document.getElementById("t_end").value,
		                     select_vocab: selected_values.join(" "),
	                             description: document.getElementById("description").value
	                            },  
	                           function(result){
				     
				   jQuery('<div/>', {
                                                   id: 'id_'+result[0].id,
                                                   text: result[0].description,
                                                   class: 'ann-elem'
                                                }).appendTo("#annotation_list");
						
			           var newInputEdit = '<input type="submit" name="Button" value = "Edit" id="edit-'+result[0].id+'">'
				   $("#id_"+result[0].id).append(newInputEdit);
				   var newInputDelete = '<input type="submit" name="Button" value = "Delete" id="delete-'+result[0].id+'">'
				   $("#id_"+result[0].id).append(newInputDelete);
				   
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
