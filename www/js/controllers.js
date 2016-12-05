$(document).ready(function() {

    $.get("videos", function(data) {

	var videoPlayer = videojs("video-player");

        function setTime (t) {
            $("#slider")[0].noUiSlider.set(t / videoPlayer.duration() * 100);
            videoPlayer.currentTime(t);
        }

        function resetForm () {
            $("#start-time").html("0.00");
            $("#end-time").html(videoPlayer.duration().toFixed(2));
            $("#description").val("");
            $("#select-vocab select").val(null).trigger("change");
            $("#pick-time").html("Pick start time");
            $("input[name='radio-time-limits'][value='start']").prop("checked", true);
            setTime(0);
        }

        function getCurrentVideoName () {
            var videoList = videoPlayer.playlist();
            var currentItem = videoPlayer.playlist.currentItem();
            return videoList[currentItem].name;
        }

        videoPlayer.playlist(data);
        videoPlayer.playlistUi();

        noUiSlider.create($("#slider")[0], {
            start: 1,
            range: {
                'min': 1,
                'max': 100
            }
        });

        $("#start-time").html("0.00");
        $("#end-time").html(videoPlayer.duration().toFixed(2));
        $("#pick-time").html("Pick start time");

       $.ajax({
            url: "vocabulary",
            method: "GET",
            success: function (data) {
                $("#select-vocab select").select2({data: data});
            }
        });

        $("#slider")[0].noUiSlider.on('update', function(values, handle){
            var t = parseFloat(values[handle]) / 100 * videoPlayer.duration();
            videoPlayer.currentTime(t);
            var selected = $("input[name='radio-time-limits']:checked").val();
            $("#" + selected + "-time").html(t.toFixed(2));
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
            resetForm();
        });

        $('#add-ann').click( function(ev) {

            var selected_data = $("#select-vocab select").select2("data");
            var selected_text = selected_data.map(function(x) {return x.text});

            video_list = videojs("video-player").playlist();
            $.post(
                "save_annotation",
                {
                    selected_video: video_list[videojs("video-player").playlist.currentItem()].name,
                    time_start: parseFloat($("#start-time").html()),
                    time_end: parseFloat($("#end-time").html()),
                    select_vocab: selected_text.join(" "),
                    description: document.getElementById("description").value,
                    ann_number: document.getElementById("ann_number").innerText
                },
                function(result){
                    ann_number = document.getElementById("ann_number").innerText;
                    if (ann_number == 0) {
                        $("#annotations-list").append(Mustache.render(
                            $("#template-annotations-row").html(),
                            result
                        ));
                    } else {
                        document.getElementById("ann_number").innerText = 0;
                        $("#annotations-list").find('[data-id="' + result.id + '"] .short-description').html(result.short_description);
                    }

            });

            resetForm();
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
                        $("#start-time").html(result.t_start.toFixed(2));
                        $("#end-time").html(result.t_end.toFixed(2));
                        $("#description").val(result.description);
                        $("#select-vocab select").val(result.selected_vocab).trigger("change");
                        $("#ann_number").html(annotation_id);
                        $("input[name='radio-time-limits'][value='start']").prop("checked", true);
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
                $("#slider")[0].noUiSlider.set(t / videoPlayer.duration() * 100);
                $("#" + selected + "-time").html(t.toFixed(2));
            }
        );

        $('input[name="radio-time-limits"]:radio').change(
            function () {
                $("#pick-time").html("Pick " + $(this).val() + " time");
                t = parseFloat($("#" + $(this).val() + "-time").html());
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
