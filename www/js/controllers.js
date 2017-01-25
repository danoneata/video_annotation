$(document).ready(function() {
  Number.prototype.zeroPad = Number.prototype.zeroPad ||
	function(base){
	     var nr = this, len = (String(base).length - String(nr).length)+1;
	     return len > 0? new Array(len).join('0')+nr : nr;
             };
    $.get("videos", function(data) {

	var videoPlayer = videojs("video-player");

        function setTime (t) {
           // $("#slider")[0].noUiSlider.set(t / videoPlayer.duration() * 100);
            videoPlayer.currentTime(t);
        }

        function resetForm (p) {
           
            $("#description").val("");
            $("#select-vocab select").val(null).trigger("change");
            $("#add-ann").html("Add annotation");
            $("#pick-time").html("Pick start time");
            $("input[name='radio-time-limits'][value='start']").prop("checked", true);
	    if (p==0) {
             setTime(0);
	    }
	    
	    $("#start-time").html("00m:00s");
	    $("#end-time").html("00m:00s");
	    //$("#end-time").html(videoPlayer.duration().toFixed(2));
	    
        }

        function getCurrentVideoName () {
            var videoList = videoPlayer.playlist();
            var currentItem = videoPlayer.playlist.currentItem();
            return videoList[currentItem].name;
        }

        videoPlayer.playlist(data);
        videoPlayer.playlistUi();

       // noUiSlider.create($("#slider")[0], {
        //    start: 1,
         //   range: {
        //        'min': 1,
        //        'max': 100
        //    }
       // });

        $("#start-time").html("00m:00s");
	$("#end-time").text("00m:00s");
       //("#end-time").html(videoPlayer.duration().toFixed(2));
        $("#add-ann").html("Add annotation");
        $("#pick-time").html("Pick start time");

       $.ajax({
            url: "vocabulary",
            method: "GET",
            success: function (data) {
                $("#select-vocab select").select2({data: data});
            }
        });

        

        function updateAnnotationsList () {
            $.ajax({
                url: "annotations_list",
                data: {
                    selected_video: getCurrentVideoName(),
                },
                method: "GET",
                dataType: "json",
                success: function (data) {
                    $("#annotations-list").html(Mustache.render(
                        $("#template-annotations").html(),
                        data,
                        {
                            "row": $("#template-annotations-row").html(),
                        }
                    ));
                }
            });
        }

        updateAnnotationsList();

        $('.vjs-playlist').on('click', function() {
            updateAnnotationsList();
            resetForm(0);
        });

        $('#add-ann').click( function(ev) {
	    var t_start = parseFloat($("#start-time").data("frame-nr"));
	    var t_end = parseFloat($("#end-time").data("frame-nr"));
	 
	    if (t_end < t_start){
	      alert('Incorrect time limits!')
	      return false;
	    } else {
	      var selected_data = $("#select-vocab select").select2("data");
	      var selected_text = selected_data.map(function(x) {return x.text});

	      video_list = videojs("video-player").playlist();
	      $.post(
		  "save_annotation",
		  {
		      selected_video: video_list[videojs("video-player").playlist.currentItem()].name,
		      time_start: parseFloat($("#start-time").data("frame-nr")),
		      time_end: parseFloat($("#end-time").data("frame-nr")),
		      select_vocab: selected_text.join(" "),
		      description: document.getElementById("description").value,
		      ann_number: $("#ann_number").text()
		  },
		  function(result){
		      ann_number = $("#ann_number").text();
		      if (ann_number == 0) {
			  $("#annotations-list").append(Mustache.render(
			      $("#template-annotations-row").html(),
			      result
			  ));
		      } else {
			  $("#ann_number").text(0);
			  $("#annotations-list").find('[data-id="' + result.id + '"] .short-description').html(result.short_description);
		      }
	    
	   

	      });
	       
	    }
            resetForm(1);
            videoPlayer.pause();
        });

        $('#annotations-list').on(
            "click",
            "button.edit",
            function() {
                annotation_id = $(this).data("id");
                $.post(
                    "get_annotation",
                    {
                        annotation_id: annotation_id
                    },
                    function (result){
		        m_s = result.t_start/60;
			m_e = result.t_end/60;
			s_s = result.t_start % 60;
			s_e = result.t_end % 60;
			res_start = m_s.toFixed(2) +'m:'+s_s.toFixed(2)+'s';
			res_end = m_e.toFixed(2) +'m:'+s_e.toFixed(2)+'s';
                        $("#start-time").html(res_start);
                        $("#end-time").html(res_end);
			$("#start-time").data("frame-nr", result.t_start.toFixed(2));
			$("#end-time").data("frame-nr", result.t_end.toFixed(2));
                        $("#description").val(result.description);
                        $("#select-vocab select").val(result.selected_vocab).trigger("change");
                        $("#ann_number").html(annotation_id);
                        $("input[name='radio-time-limits'][value='start']").prop("checked", true);
                        $("#add-ann").html("Update annotation");
                        $("#pick-time").html("Pick start time");
                        setTime(result.t_start);
                    }
                );
            }
        );

        $('#annotations-list').on(
            'click',
            'button.delete',
            function() {
                annotation_id = $(this).data("id");
                x =  window.confirm("Are you sure you want to delete the annotation?");
                if (x == true) {
                    $.post("delete_annotation", {
                        annotation_id: annotation_id,
                    });
                    $("#annotations-list").find('[data-id="' + annotation_id + '"]').remove();
            }
        });

	     
        $('#pick-time').on(
            'click',
            function () {
                var t = videoPlayer.currentTime();
                var selected = $("input[name='radio-time-limits']:checked").val();
                //$("#slider")[0].noUiSlider.set(t / videoPlayer.duration() * 100);
                $("#" + selected + "-time").data("frame-nr", t.toFixed(2));
		m = t/60;
		s = t % 60;
		res = (Math.floor(m)).zeroPad(10) +'m:'+(Math.floor(s)).zeroPad(10)+'s';
		$("#" + selected + "-time").html(res)
		videoPlayer.pause()
		
		var t_start = parseFloat($("#start-time").data("frame-nr"));
	    var t_end = parseFloat($("#end-time").data("frame-nr"));
	   
	    if (t_start >t_end){
	      $('#curr-ann').css('color','red');
	       if (t_end ==0){
	            $('#limits-text').text('Please select end time:')
	       }
	       else
	       {
		 $('#limits-text').text('Current time limits are not valid!')
	       }
	       
	    }
	      else
	      {
		$('#curr-ann').css('color','black');
		$('#limits-text').text('Current time limits:')
	      }
	   
	      
            }
        );
	
	function stop_video(t) {
	 videoPlayer.on('timeupdate', function(e) {
          if (videoPlayer.currentTime() >= t) {
           videoPlayer.pause();
          }
          });
	 }
	
	 $('#play-curr').on(
            'click',
            function () {
                var t = videoPlayer.currentTime();
              
		
	   var t_start = parseFloat($("#start-time").data("frame-nr"));
	    var t_end = parseFloat($("#end-time").data("frame-nr"));
	    if (t_start >t_end || t_start == t_end){
	      alert("Select a valid time interval!");
	      return false;
	    }
	    else{
	      videoPlayer.currentTime(t_start);
	      videoPlayer.play();
	      stop_video(t_end);
	    
	      
	    }
		
	    }
	
        );
	 
	 
	

        $('input[name="radio-time-limits"]:radio').change(
            function () {
	      
                $("#pick-time").html("Pick " + $(this).val() + " time");
		
                t = parseFloat($("#" + $(this).val() + "-time").html());
		t = videoPlayer.currentTime();
                setTime(t);
            }
        );

        document.addEventListener('keydown', function (evt) {
            var videoPlayer = videojs("video-player");
            var frameTime = 1 / 30; // assume 30 fps
            var duration = videoPlayer.duration();
            var t = videoPlayer.currentTime();
            videoPlayer.pause()
            if (evt.keyCode === 37) { // left arrows
                if (t > 0) {
                    // one frame back
                    t = t - frameTime;
                }
            } else if (evt.keyCode === 39) { // right arrow
                // Don't go past the end, otherwise you may get an error
                if (videoPlayer.currentTime() < duration) {
                    // one frame forward
                    t = Math.min(duration, t + frameTime);
                }
            }
            setTime(t);
        });
    });
});
