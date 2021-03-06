$(document).ready(function() {
    Number.prototype.zeroPad = Number.prototype.zeroPad ||
        function(base) {
            var nr = this, len = (String(base).length - String(nr).length) + 1;
            return len > 0? new Array(len).join('0') + nr : nr;
        };

    $.get("videos", function(data) {

        var videoPlayer = videojs("video-player");

        var ANNOTATIONS = [];
        var FPS = 30.0;

        function setTime (t) {
            videoPlayer.currentTime(t);
        }

        function resetForm(rewind) {
            $("#description").val("");
            $("#select-vocab_child select").val(null).trigger("change");
            $("#select-vocab_therapist select").val(null).trigger("change");
            $("#add-ann").html("Add annotation");
            $("#pick-time").html("Pick start time");
            $("input[name='radio-time-limits'][value='start']").prop("checked", true);
             $("input[name='radio-time-limits'][value='1']").prop("checked", true);
            if (rewind) {
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

        $("#start-time").html("00m:00s");
        $("#end-time").text("00m:00s");
        $("#add-ann").html("Add annotation");
        $("#pick-time").html("Pick start time");

       $.ajax({
            url: "vocabulary_child",
            method: "GET",
            success: function (data) {
                $("#select-vocab_child select").select2({data: data});
            }
        });
       
       $.ajax({
            url: "vocabulary_therapist",
            method: "GET",
            success: function (data) {
                $("#select-vocab_therapist select").select2({data: data});
            }
        });
       
       
         $.ajax({
            url: "vocabulary_child",
            method: "GET",
            success: function (data) {
                $("#select-vocab_child_filter select").select2({data: data});
            }
        });
       
       $.ajax({
            url: "vocabulary_therapist",
            method: "GET",
            success: function (data) {
                $("#select-vocab_therapist_filter select").select2({data: data});
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
        
         function get_current_annotations () {
          $.get(
            "get_all_annotations",
            {
                selected_video: getCurrentVideoName()
            },
            function (result) {
                // var t = videoPlayer.currentTime();
                // var current_frame = Math.floor(t * 30);
                ANNOTATIONS = result;
            }
        );
        }

        $('.vjs-playlist').on('click', function() {
            updateAnnotationsList();
            get_current_annotations();
            resetForm(false);
        });

        $('#cancel-ann').click(function(ev) {
            $("#ann_number").text("0");
            resetForm(false);
        });

        $('#add-ann').click( function(ev) {
            var t_start = parseFloat($("#start-time").data("frame-nr"));
            var t_end = parseFloat($("#end-time").data("frame-nr"));

            if (t_end < t_start){
                alert('Incorrect time limits!')
                return false;
            } else {
                var selected_data_child = $("#select-vocab_child select").select2("data");
                var selected_data_therapist = $("#select-vocab_therapist select").select2("data");
                var selected_text_child = selected_data_child.map(function(x) {return x.text});
                var selected_text_therapist = selected_data_therapist.map(function(x) {return x.text});
                
                
                var selected_data_child_filter = $("#select-vocab_child_filter select").select2("data");
                var selected_data_therapist_filter = $("#select-vocab_therapist_filter select").select2("data");
                var selected_text_child_filter = selected_data_child_filter.map(function(x) {return x.text});
                var selected_text_therapist_filter = selected_data_therapist_filter.map(function(x) {return x.text});
                
                video_list = videojs("video-player").playlist();

                var newAnnotation = {
                    selected_video: video_list[videojs("video-player").playlist.currentItem()].name,
                    time_start: parseFloat($("#start-time").data("frame-nr")),
                    time_end: parseFloat($("#end-time").data("frame-nr")),
                    select_vocab_child: selected_text_child.join(", "),
                    select_vocab_therapist: selected_text_therapist.join(", "),
                    description: document.getElementById("description").value,
                    description_type:  Number($("input[name='radio-description_type']:checked").val()),
                    ann_number: $("#ann_number").text(),
                    filter_child: selected_text_child_filter.join(", "),
                    filter_therapist: selected_text_therapist_filter.join(", ")
                };
                updateAnnotations(newAnnotation);

                $.post(
                    "save_annotation",
                    newAnnotation,
                    function(result) {
                        $("#ann_number").text(0);
                        updateFilteredAnnotations();
                    }
                );
            }
            resetForm(false);
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
                    function (result) {
                        m_s = result.t_start / 60;
                        m_e = result.t_end / 60;
                        s_s = result.t_start % 60;
                        s_e = result.t_end % 60;
                        //res_start = m_s.toFixed(2) + 'm:' + s_s.toFixed(2) + 's';
                        //res_end = m_e.toFixed(2) + 'm:' + s_e.toFixed(2) + 's';
                        res_start = (Math.floor(m_s)).zeroPad(10) +'m:'+(Math.floor(s_s)).zeroPad(10)+'s';
                        description_type = result.description_type;
                        res_end = (Math.floor(m_e)).zeroPad(10) +'m:'+(Math.floor(s_e)).zeroPad(10)+'s';
                        $("#start-time").html(res_start);
                        $("#end-time").html(res_end);
                        $("#start-time").data("frame-nr", result.t_start.toFixed(2));
                        $("#end-time").data("frame-nr", result.t_end.toFixed(2));
                        $("#description").val(result.description);
                        $("#select-vocab_child select").val(result.selected_vocab_child).trigger("change");
                        $("#select-vocab_therapist select").val(result.selected_vocab_therapist).trigger("change");
                        $("#ann_number").html(annotation_id);
                        $("input[name='radio-time-limits'][value='start']").prop("checked", true);
                        $("input[name='radio-description_type'][value="+description_type.toString() +"]").prop("checked", true);
                        $("#add-ann").html("Update annotation");
                        $("#pick-time").html("Pick start time");
                        setTime(result.t_start);
                    }
                );
            }
        );

        function updateAnnotations(annot) {
            var i = ANNOTATIONS.findIndex(function (elem) {
                return elem.ann_number == annot.ann_number;
            });
            if (i == -1) {
                ANNOTATIONS.push(annot);
            } else {
                ANNOTATIONS[i] = annot;
            }
        }

        $('#annotations-list').on(
            'click',
            'button.delete',
            function() {
                annotation_id = $(this).data("id");
                x = window.confirm("Are you sure you want to delete the annotation?");
                if (x == true) {
                    $.post("delete_annotation", {
                        annotation_id: annotation_id,
                    });
                    $("#annotations-list").find('[data-id="' + annotation_id + '"]').remove();
            }
            
            var i = ANNOTATIONS.findIndex(function (elem) {
                return elem.ann_number ==  annotation_id;
            });
            if (i == -1) {
                
            } else {
                ANNOTATIONS.splice(i,1);
            }
            
        });

        $('#pick-time').on(
            'click',
            function () {
                var t = videoPlayer.currentTime();
                var selected = $("input[name='radio-time-limits']:checked").val();
                $("#" + selected + "-time").data("frame-nr", t.toFixed(2));
                m = t / 60;
                s = t % 60;
                res = (Math.floor(m)).zeroPad(10) +'m:'+(Math.floor(s)).zeroPad(10)+'s';
                $("#" + selected + "-time").html(res)
                videoPlayer.pause()
                
                var t_start = parseFloat($("#start-time").data("frame-nr"));
                var t_end = parseFloat($("#end-time").data("frame-nr"));
           
                if (t_start > t_end) {
                    $('#curr-ann').css('color','red');
                    if (t_end == 0) {
                        $('#limits-text').text('Please select end time:');
                    } else {
                        $('#limits-text').text('Current time limits are not valid!');
                    }
                } else {
                    $('#curr-ann').css('color','black');
                    $('#limits-text').text('Current time limits:');
                }
        });
        
       

        function stop_video(t) {
            videoPlayer.on('timeupdate', function handler(e) {
                if (videoPlayer.currentTime() >= t) {
                    videoPlayer.pause();
                    //t = Infinity;
                    videoPlayer.off('timeupdate', handler);
                }
            });
        }

        function overlayAnnotations(annotations) {
            $("#view-annotations").html(Mustache.render(
                $("#template-view-annotations").html(),
                annotations,
                {
                    "row": $("#template-view-annotations-row").html(),
                }
            ));
        }

        /*videoPlayer.on('timeupdate', function(e) {
            var currTime = videoPlayer.currentTime();
            var annots =  ANNOTATIONS.filter(function (elem) {
                return (elem.time_start <= currTime) && (currTime < elem.time_end);
            });
            overlayAnnotations(annots);
        });
    */
        
        $('#play-curr').on(
            'click',
            function () {
                var t = videoPlayer.currentTime();
                var t_start = parseFloat($("#start-time").data("frame-nr"));
                var t_end = parseFloat($("#end-time").data("frame-nr"));
                if (t_start > t_end || t_start == t_end){
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
         get_current_annotations();

        $.get(
            "get_all_annotations",
            {
                selected_video: getCurrentVideoName()
            },
            function (result) {
                // var t = videoPlayer.currentTime();
                // var current_frame = Math.floor(t * 30);
                ANNOTATIONS = result;
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
        
        function timeupdate_handler(e) 
          {
            var currTime = videoPlayer.currentTime();
            var annots =  ANNOTATIONS.filter(function (elem) 
            {
                return (elem.time_start <= currTime) && (currTime < elem.time_end);
            });
            
            overlayAnnotations(annots);
          }
        
        $('#overlay-ann').on('change', function() 
        {
          
          if (document.getElementById("overlay-ann").checked==true) 
          {
            videoPlayer.on('timeupdate', timeupdate_handler);
          }
        else
        {
          videoPlayer.off('timeupdate', timeupdate_handler);
          overlayAnnotations('');
        }
         
          
        })

        

       /* $('#undefined-ann').on('change', function() {
            $.get(
                "annotations_list",
                {
                    selected_video: getCurrentVideoName(),
                    to_filter_undefined: $("#undefined-ann").is(":checked")
                }, 
                function (result) {
                    var data = result;
                    $("#annotations-list").html(Mustache.render(

                        $("#template-annotations").html(),
                        data,
                        {
                            "row": $("#template-annotations-row").html(),
                        }
                    ));
                }
            );
        })
        */
       
       function updateFilteredAnnotations() {
            var selected_data_child = $("#select-vocab_child_filter select").select2("data");
            var selected_data_therapist = $("#select-vocab_therapist_filter select").select2("data");
            var selected_text_child = selected_data_child.map(function(x) {return x.text});
            var selected_text_therapist = selected_data_therapist.map(function(x) {return x.text});
            $.get(
                "annotations_list",
                {
                    selected_video: getCurrentVideoName(),
                    filter_child: selected_text_child.join(", "),
                    filter_therapist: selected_text_therapist.join(", "),
                    to_filter: $("#filter-ann").is(":checked")
                }, 
                function (result) {
                    var data = result;
                    $("#annotations-list").html(Mustache.render(
                        $("#template-annotations").html(),
                        data,
                        {
                            "row": $("#template-annotations-row").html(),
                        }
                    ));
                }
            );
        }
        
        $('#filter-ann').on('change', function() {
            updateFilteredAnnotations();
        })

        $('#select-vocab_child_filter select').on('change', function () {
            if ($("#filter-ann").is(":checked")) {
                updateFilteredAnnotations();
            }
        })

        $('#select-vocab_therapist_filter select').on('change', function () {
            if ($("#filter-ann").is(":checked")) {
                updateFilteredAnnotations();
            }
        })

         $('#export_annotations').click( function(ev) {
           $.post(
                "export",
                  {
                    button_pressed: 1
                  },
                 function (result) {
                   }
                 );
                  }
              );

      
        
        document.addEventListener('keydown', function (evt) {
            if (document.activeElement.nodeName == "BODY" || document.activeElement.nodeName == "DIV" ){
            var videoPlayer = videojs("video-player");
            var frameTime = (1 / FPS) * 5; // assume 30 fps
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
          }
          if (evt.altKey && evt.keyCode === 65)
          {
              document.getElementById("add-ann").click();
          }
          else if (evt.altKey && evt.keyCode == 81)
          {
              document.getElementById("cancel-ann").click();
          }
        });
    });
});
