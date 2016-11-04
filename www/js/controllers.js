$(document).ready(function() {

  
    
    var videoPlayer = videojs("video-player");
     document.getElementById('start_btn').disabled = false;
	document.getElementById('end_btn').disabled = false;
    $.get("videos", function(data) {
        videoPlayer.playlist(data);
        videoPlayer.playlistUi();
	
var slider_start = document.getElementById('slider_start');
var slider_end = document.getElementById('slider_end');

noUiSlider.create(slider_start, {
    start: 1,
    //connect: true,
    range: {
        'min': 1,
    'max': 100
    }
});

noUiSlider.create(slider_end, {
    start: 1,
    //connect: true,
    range: {
        'min': 1,
    'max': 100
    }
});
    $("#select-vocab select").select2({
        ajax: {
            url: "/vocabulary",
            dataType: 'json',
            delay: 250,
            data: {},
            processResults: function (data) {
                return {
                    results: data,
                };
            },
            cache: true
        }
    });

   slider_start.noUiSlider.on('update', function(values, handle){
      videoPlayer = videojs("video-player");
        t = videoPlayer.currentTime();
	duration = videoPlayer.duration();
        slider_values = slider_start.noUiSlider.get();
	
	if (handle == 0){
	  newt = slider_values[0]/100*duration;
          videoPlayer.currentTime(newt);
	  document.getElementById("t_start").value = parseFloat(videoPlayer.currentTime()).toFixed(2);
	}
	//else
	  //if (handle==1){
	    //newt = slider_values[1]/100*duration;
            //videoPlayer.currentTime(newt);
	    //document.getElementById("t_end").value = parseFloat(videoPlayer.currentTime()).toFixed(2);
	  //}
    });
   
     slider_end.noUiSlider.on('update', function(values, handle){
      videoPlayer = videojs("video-player");
        t = videoPlayer.currentTime();
	duration = videoPlayer.duration();
        slider_values = slider_end.noUiSlider.get();
	
	if (handle == 0){
	  newt = slider_values[0]/100*duration;
          videoPlayer.currentTime(newt);
	  document.getElementById("t_end").value = parseFloat(videoPlayer.currentTime()).toFixed(2);
	}
	//else
	  //if (handle==1){
	    //newt = slider_values[1]/100*duration;
            //videoPlayer.currentTime(newt);
	    //document.getElementById("t_end").value = parseFloat(videoPlayer.currentTime()).toFixed(2);
	  //}
    });
	
    video_list = videojs("video-player").playlist();
    $.post("get_all_annotations",  {
	                             selected_video: video_list[videojs("video-player").playlist.currentItem()].name,
	                            
	                            },  
	                           function(result){
				   $('.ann-elem').remove(); 
				   $('.li_class').remove();
				   for (var i = 0; i<result.length;i++)
				   {
				     //text_to_display = '';
				     $('<li />', {id: 'li_'+result[i].id, class: 'li_class'}).appendTo('ul.ann-menu');
				     text_length = 15;
				      text_to_display = result[i].description;
				    if (result[i].description.length>=text_length)
				       text_to_display = result[i].description.substring(0, text_length)
				      // else
				     //  {
					 //text_extra = Array.from('\x20'.repeat(text_length-result[i].description.length+1 ));
					// text_to_display = result[i].description
					 //for (i = 1; i<( text_length-result[i].description.length);i++)
					 //text_to_display = text_to_display + ' ';
					// difference =  text_length-result[i].description.length;
					// text_to_display = text_to_display + new Array(difference).join(' . ')
				    //   }
				     
				     //text_to_display[1][Math.min(20, result[i].description.length)] = result[i].description;
				      jQuery('<div/>', {
                                                   id: 'id_' + result[i].id,
                                                   text: text_to_display,
                                                   class: 'ann-elem'
                                                }).appendTo('#li_'+result[i].id);
						
                                   var newInputEdit = '<button type="submit" class="edit_button" name="Button" value="Edit" id="edit-' + result[i].id + '"><span class="glyphicon glyphicon glyphicon-pencil"></span></button>';
				   $("#id_" + result[i].id).append(newInputEdit);
				   var newInputDelete = '<button type = "submit" class = "delete_button" name = "Button" value = "Delete" id = "delete-' + result[i].id+'"><span class="glyphicon glyphicon glyphicon-trash"></span></button>';
				   $("#id_"+ result[i].id).append(newInputDelete);
				   }
				   
	    });
	
    });
    
    




    /*videojs('#video-player').on('timeupdate', function(ev){
    var isPlaying =  !videojs("video-player").paused();
    if (document.getElementById("rb1").checked == true){;
	document.getElementById("t_start").value = parseFloat(videoPlayer.currentTime()).toFixed(2);
      }
      
      if (document.getElementById("rb2").checked == true){;
	document.getElementById("t_end").value = parseFloat(videoPlayer.currentTime()).toFixed(2);
      }
      
      
    });
    */
    
   
    
    $('.vjs-playlist').on('click', function() {
    video_list = videojs("video-player").playlist();
    $.post("get_all_annotations",  {
	                             selected_video: video_list[videojs("video-player").playlist.currentItem()].name,
	                            
	                            },  
	                           function(result){
				   $('.ann-elem').remove(); 
				   $('.li_class').remove();
				  // jQuery('</nav>', {id:'ann_nav_id', class:'ann_nav'}).appendTo("#annotation_list");
				   //jQuery('</ul>', {id:'list_id', class:'list'}).appendTo("#annotation_list");
				  
				   for (var i = 0; i<result.length;i++)
				   {
				      $('<li />', {id: 'li_'+result[i].id, class: 'li_class'}).appendTo('ul.ann-menu');
				      jQuery('<div/>', {
                                                   id: 'id_' + result[i].id,
                                                   text: result[i].description,
                                                   class: 'ann-elem'
                                                }).appendTo('#li_'+result[i].id);
						
			           var newInputEdit = '<button type="submit" class="edit_button" name="Button" value="Edit" id="edit-' + result[i].id + '"><span class="glyphicon glyphicon glyphicon-pencil"></span></button>';
				   $("#id_" + result[i].id).append(newInputEdit);
				   var newInputDelete = '<button type = "submit" class = "delete_button" name = "Button" value = "Delete" id = "delete-' + result[i].id+'"><span class="glyphicon glyphicon glyphicon-trash"></span></button>';
				   $("#id_"+ result[i].id).append(newInputDelete);
				   }
				   
	    });
    }); 
    
    $('#add-ann').click( function(ev) {
          
        
	 //alert(videoPlayer.currentTime())
         var selected_data = $("#select-vocab select").select2("data");
         var selected_text = selected_data.map(function(x) {return x.text});
	 //current_video = document.getElementById("select-video").value;
	 video_list = videojs("video-player").playlist();
	 $.post("save_annotation",  {
	                             selected_video: video_list[videojs("video-player").playlist.currentItem()].name,
	                             time_start: document.getElementById("t_start").value,
	                             time_end: document.getElementById("t_end").value,
		                     select_vocab: selected_text.join(" "),
	                             description: document.getElementById("description").value,
	                             ann_number: document.getElementById("ann_number").innerText
	                            },  
	                           function(result){
				   ann_number = document.getElementById("ann_number").innerText; 
				   if  (ann_number == 0){
				   $('<li />', {id: 'li_'+result[0].id, class: 'li_class'}).appendTo('ul.ann-menu');
				   jQuery('<div/>', {
                                                   id: 'id_'+result[0].id,
                                                   text: result[0].description,
                                                   class: 'ann-elem'
                                                }).appendTo('#li_'+result[0].id);
						
			           var newInputEdit = '<button type="submit" class="edit_button" name="Button" value="Edit" id="edit-' + result[0].id + '"><span class="glyphicon glyphicon glyphicon-pencil"></span></button>';
				   $("#id_"+result[0].id).append(newInputEdit);
				   var newInputDelete = '<button type = "submit" class = "delete_button" name = "Button" value = "Delete" id = "delete-' + result[0].id+'"><span class="glyphicon glyphicon glyphicon-trash"></span></button>';
				   $("#id_"+result[0].id).append(newInputDelete);
				   }
				   else
				   {
				     document.getElementById("ann_number").innerText = 0;
				     document.getElementById("id_" + ann_number).innerText = result[0].description;
				     var newInputEdit = '<button type="submit" class="edit_button" name="Button" value="Edit" id="edit-' + result[0].id + '"><span class="glyphicon glyphicon glyphicon-pencil"></span></button>';
				     $("#id_"+result[0].id).append(newInputEdit);
				     var newInputDelete = '<button type = "submit" class = "delete_button" name = "Button" value = "Delete" id = "delete-' + result[0].id+'"><span class="glyphicon glyphicon glyphicon-trash"></span></button>';
				     $("#id_"+result[0].id).append(newInputDelete);
				Start   }
				   
				   //$("#id_"+result[0].id).click(function() {
					      //alert(result[0].id);
					//      });
				   
	    });
	 
	// document.getElementById("select-video").value = current_video;
	document.getElementById("t_start").value = '';
	document.getElementById("t_end").value = '';
	document.getElementById("description").value = '';
	document.getElementById('start_btn').disabled = false;
	document.getElementById('end_btn').disabled = false;
        $("#select-vocab select").val(null).trigger("change");
        videojs("video-player").pause();
	
    });
   
    $('input[type = "radio"]').on('click', function(e)
    {
      videojs("video-player").pause();
    });
  
  $('#ann-menu-id').on("click", ".edit_button", function() {
            id = this.id;
	    id_annotation = id.substring(5,id.length);
	    $.post("get_annotation", {
	                             annotation_id: id_annotation,
	                             },  
	                           function(result){
				     
				 document.getElementById("t_start").value = result[0].t_start;
	                         document.getElementById("t_end").value = result[0].t_end;
	                         document.getElementById("description").value = result[0].description;

				 selected_vocab = result[0].selected_vocab;
				 selected_words = selected_vocab.split(" ");
                                 $("#select-vocab select").val(selected_words).trigger("change");
				 
                                 document.getElementById("ann_number").innerText =  id_annotation;
	   
	    });
	});
       
  $('#ann-menu-id').on("click", ".delete_button", function() {
            id = this.id;
	    id_annotation = id.substring(7,id.length);
	    x =  window.confirm("Are you sure you want to delete the annotation?");
	    if (x ==true){
	    $.post("delete_annotation", {
	                             annotation_id: id_annotation,
	                             }); 
	    document.getElementById('id_'+id_annotation).remove();
	    }
	                           
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

  $('#start_btn').click( function(ev) {
   
    videoPlayer = videojs("video-player");
     x =  parseFloat(videoPlayer.currentTime()).toFixed(2);
         t = videoPlayer.currentTime();
	duration = videoPlayer.duration();
 document.getElementById("t_start").value = x;
 slider_start.noUiSlider.set([(x/duration)*100, null]);
document.getElementById('start_btn').disabled = true;
});
  
  $('#end_btn').click( function(ev) {
    videoPlayer = videojs("video-player");
     x =  parseFloat(videoPlayer.currentTime()).toFixed(2);
         t = videoPlayer.currentTime();
	duration = videoPlayer.duration();
 document.getElementById("t_end").value = parseFloat(videoPlayer.currentTime()).toFixed(2);
  videojs("video-player").pause();
  slider_end.noUiSlider.set([(x/duration)*100, null]);
  document.getElementById('end_btn').disabled = true;
});
});
