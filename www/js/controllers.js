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
          alert("miss you")
        });
});
