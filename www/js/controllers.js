function getCurrentVideoName (videoPlayer) {
    var videoList = videoPlayer.playlist();
    var currentItem = videoPlayer.playlist.currentItem();
    return videoList[currentItem].name;
}

$(document).ready(function() {

    document.getElementById('start_btn').disabled = false;
    document.getElementById('end_btn').disabled = false;

    function resetForm () {
        document.getElementById("t_start").value = '';
        document.getElementById("t_end").value = '';
        document.getElementById("description").value = '';
        document.getElementById('start_btn').disabled = false;
        document.getElementById('end_btn').disabled = false;
        $("#select-vocab select").val(null).trigger("change");
    }

    $.get("videos", function(data) {

	var videoPlayer = videojs("video-player");

        videoPlayer.playlist(data);
        videoPlayer.playlistUi();

        var slider_start = document.getElementById('slider_start');
        var slider_end = document.getElementById('slider_end');

        noUiSlider.create(slider_start, {
            start: 1,
            range: {
                'min': 1,
                'max': 100
            }
        });

        noUiSlider.create(slider_end, {
            start: 1,
            range: {
                'min': 1,
                'max': 100
            }
        });

        $.ajax({
            url: "vocabulary",
            method: "GET",
            success: function (data) {
                $("#select-vocab select").select2({data: data});
            }
        });

        slider_start.noUiSlider.on('update', function(values, handle){
            var t = parseFloat(values[handle]) / 100 * videoPlayer.duration();
            videoPlayer.currentTime(t);
            $("#t_start").val(t.toFixed(2));
        });

        slider_end.noUiSlider.on('update', function(values, handle){
            var t = parseFloat(values[handle]) / 100 * videoPlayer.duration();
            videoPlayer.currentTime(t);
            $("#t_end").val(t.toFixed(2));
        });

        function updateAnnotationsList () {
            $.ajax({
                url: "annotations_list",
                data: {
                    selected_video: getCurrentVideoName(videoPlayer),
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
                    time_start: document.getElementById("t_start").value,
                    time_end: document.getElementById("t_end").value,
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
            videojs("video-player").pause();
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
                        $("#t_start").val(result.t_start);
                        $("#t_end").val(result.t_end);
                        $("#description").val(result.description);
                        $("#select-vocab select").val(result.selected_vocab).trigger("change");
                        document.getElementById("ann_number").innerText = annotation_id;
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

        document.addEventListener('keydown', function (evt) {
            var videoPlayer = videojs("video-player");
            frameTime = 1 / 30; // assume 30 fps
            videoPlayer.pause()
                t = videoPlayer.currentTime();
            if (evt.keyCode === 37) { // left arrows
                if (t  > 0) {
                    // one frame back
                    videoPlayer.currentTime(t-frameTime);
                }
            }
            else if (evt.keyCode === 39) { //right arrow
                if (videoPlayer.currentTime() < videoPlayer.duration()) {
                    // one frame forward
                    // Don't go past the end, otherwise you may get an error
                    videoPlayer.currentTime(Math.min(videoPlayer.duration(), t + frameTime));
                }

            }
        });

        $('#start_btn').click( function(ev) {
            videoPlayer = videojs("video-player");
            x = parseFloat(videoPlayer.currentTime()).toFixed(2);
            t = videoPlayer.currentTime();
            duration = videoPlayer.duration();
            document.getElementById("t_start").value = x;
            slider_start.noUiSlider.set((x / duration) * 100);
            document.getElementById('start_btn').disabled = true;
        });

        $('#end_btn').click( function(ev) {
            videoPlayer = videojs("video-player");
            x = parseFloat(videoPlayer.currentTime()).toFixed(2);
            t = videoPlayer.currentTime();
            duration = videoPlayer.duration();
            document.getElementById("t_end").value = parseFloat(videoPlayer.currentTime()).toFixed(2);
            videojs("video-player").pause();
            slider_end.noUiSlider.set((x / duration) * 100);
            document.getElementById('end_btn').disabled = true;
        });
    });
});
