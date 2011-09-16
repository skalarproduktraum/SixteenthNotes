/*
 *
 *
 *
*/

(function($) {

    $.SixteenthNotes = function(element, options) {
        this.options = {};

        this.init = function(element, options) {

            var typeTranslationTable = {
                'ogg' : 'audio/ogg',
                'mp3' : 'audio/mpeg',
                'wav' : 'audio/x-wav'
            };


            var loaded = false, manualSeek = false, timeleft, positionIndicator, loadingIndicator, tracktitle;

            // check if HTML5 audio support is implemented in the browser
            if(!!document.createElement('audio').canPlayType) {
                var differentTypes = [];
                // for each type we want, append one source tag to the audio tag of $element
                $.each(options.trackFileTypes, function(i, type) {
                    differentTypes.push(
                        '<source src="' + options.trackBaseDirectory + '/' + options.tracks[0].file + '.' + type + '" type="' + typeTranslationTable[type] + '"></source>'
                    );
                });
                $('<audio/>', {
                    html: differentTypes.join('')
                }).appendTo(element);

                audio = element.children('audio').get(0);
                loadingIndicator = $('#loading', element);
                positionIndicator = $('#handle', element);
                timeleft = $('#timeleft', element);
                tracktitle = $('#tracktitle', element);

                element.attr('title', options.tracks[0].name);

                if ((audio.buffered != undefined) && (audio.buffered.length != 0)) {
                    $(audio).bind('progress', function() {
                        var loaded = parseInt(((audio.buffered.end(0) / audio.duration) * 100), 10);
                        loadingIndicator.css({width: loaded + '%'});
                    });
                }
                else {
                    loadingIndicator.remove();
                }


                $(audio).bind('timeupdate', function() {
                    var rem = parseInt(audio.duration - audio.currentTime, 10),
                    pos = (audio.currentTime / audio.duration) * 100,
                    mins = Math.floor(rem/60,10),
                    secs = rem - mins*60;

                    timeleft.text('-' + mins + ':' + (secs > 9 ? secs : '0' + secs));
                    tracktitle.text(element.attr('title'));
                    if (!manualSeek) { positionIndicator.css({left: pos + '%'}); }
                    if (!loaded) {
                        loaded = true;
                        $('#barwrapper').slider({
                          value: 0,
                          step: 0.01,
                          orientation: 'horizontal',
                          range: 'min',
                          max: audio.duration,
                          animate: true,          
                          slide: function() {             
                            manualSeek = true;
                          },
                          stop:function(e,ui) {
                            manualSeek = false;         
                            audio.currentTime = ui.value;
                          }
                        });
                    }

                });

                $(audio).bind('play',function() {
                    $("#playpause").addClass('playing');   
                }).bind('pause ended', function() {
                    $("#playpause").removeClass('playing');    
                });   
    
                $("#playpause").click(function() {     
                    if (audio.paused) { audio.play(); } 
                    else { audio.pause(); }     
                });

                $("#next").click(function() {
                    $.each(options.tracks, function(index, track) {
                        if(track.name == element.attr('title')) {

                            differentTypes = [];
                            console.log(options.tracks[1].file);

                            $('source', element).remove();

                            $.each(options.trackFileTypes, function(i, type) {
                                console.log(index);
                                differentTypes.push(
                                    '<source src="' + options.trackBaseDirectory + '/' + options.tracks[index+1].file + '.' + type + '" type="' + typeTranslationTable[type] + '"></source>'
                                );

                            });

                            $('audio', element).html(differentTypes.join(''));

                            element.attr('title', options.tracks[index+1].name);
                            tracktitle.text(options.tracks[index+1].name);
                        }
                    });
                });
            } else {
                // fallback code
            }
            return element;
        };

        this.destroy = function() {
            return this.each(function() {
                $(window).unbind('.SixteenthNotes');
            });
        }

        this.init(element, options);
    };
 
    $.fn.SixteenthNotes = function(options) {
        return this.each(function() {
            (new $.SixteenthNotes($(this), options)); 
        });
    };

    $.SixteenthNotes.defaultOptions = {
        'trackBaseDirectory': '',
        'tracks' : [{'name' : '', 'file': ''}],
        'trackFileTypes' : ['ogg', 'mp3', 'wav'],
        'repeatMode': 'repeatAll',
        'crossfade': 'false'
    };


})( jQuery );   
