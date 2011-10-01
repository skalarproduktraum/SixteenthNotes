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
                cover = $('#cover', element);

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

                    $('#barwrapper', element).slider('option', 'max', audio.duration);


                    timeleft.text('-' + mins + ':' + (secs > 9 ? secs : '0' + secs));
                    tracktitle.text(element.attr('title'));
                    if (!manualSeek) { positionIndicator.css({left: pos + '%'}); }
                    if (!loaded) {
                        loaded = true;
                        $('#barwrapper', element).slider({
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

                $(audio).bind('ended', function() {
                    $.each(options.tracks, function(index, track) {
                        if(track.name == element.attr('title')) {
                            var change = 0;

                            differentTypes = [];

                            $('source', element).remove();
                            
                            if((index + 1) == options.tracks.length) {
                                change = -index;
                            } else {
                                change = 1;
                            }
                            $.each(options.trackFileTypes, function(i, type) {
                                differentTypes.push(
                                    '<source src="' + options.trackBaseDirectory + '/' + options.tracks[index+change].file + '.' + type + '" type="' + typeTranslationTable[type] + '"></source>'
                                );

                            });

                            $('audio', element).html(differentTypes.join(''));

                            element.attr('title', options.tracks[index+change].name);
                            tracktitle.text(options.tracks[index+change].name);
                            cover.css('background-image', 'url(' + options.trackBaseDirectory + '/' + options.tracks[index+change].cover + ')');

                            $('#barwrapper', element).slider('option', 'max', audio.duration);
                            $('#barwrapper', element).slider('option', 'value', 0);

                            return false;
                        }
                    });

                });
    
                $('#playpause').click(function() {     
                    if (audio.paused) { $('#playpause').removeClass('pause'); $('#playpause').addClass('play'); audio.play(); } 
                    else { $('#playpause').removeClass('play'); $('#playpause').addClass('pause'); audio.pause();  }     
                });

                $('#next').click(function() {
                    audio.pause();
                    $('audio', element).remove();
                    $.each(options.tracks, function(index, track) {
                        if(track.name == element.attr('title')) {
                            var change = 0;

                            differentTypes = [];
                            
                            $('source', element).remove();
                            
                            if((index + 1) == options.tracks.length) {
                                change = -index;
                            } else {
                                change = 1;
                            }
                            $.each(options.trackFileTypes, function(i, type) {
                                differentTypes.push(
                                    '<source src="' + options.trackBaseDirectory + '/' + options.tracks[index+change].file + '.' + type + '" type="' + typeTranslationTable[type] + '"></source>'
                                );

                            });

                            //$(audio).html(differentTypes.join(''));
                            $('<audio/>', {
                                html: differentTypes.join('')
                            }).appendTo(element);

                            element.attr('title', options.tracks[index+change].name);
                            tracktitle.text(options.tracks[index+change].name);
                            cover.css('background-image', 'url(' + options.trackBaseDirectory + '/' + options.tracks[index+change].cover + ')');


                            $('#barwrapper', element).slider('option', 'max', audio.duration);
                            $('#barwrapper', element).slider('option', 'value', 0);

                            audio = element.children('audio').get(0);
                            audio.play();

                            return false;
                        }
                    });
                });
                
                $('#previous').click(function() {

                    if(audio.currentTime >= 10.0) {
                        audio.currentTime = 0.0;
                        return;
                    }

                    $.each(options.tracks, function(index, track) {
                        if(track.name == element.attr('title')) {
                            var change = 0;

                            differentTypes = [];

                            $('source', element).remove();
                            
                            if((index - 1) == -1) {
                                change = options.tracks.length-1;
                            } else {
                                change = -1;
                            }
                            $.each(options.trackFileTypes, function(i, type) {
                                differentTypes.push(
                                    '<source src="' + options.trackBaseDirectory + '/' + options.tracks[index+change].file + '.' + type + '" type="' + typeTranslationTable[type] + '"></source>'
                                );

                            });

                            $('audio', element).html(differentTypes.join(''));

                            element.attr('title', options.tracks[index+change].name);
                            tracktitle.text(options.tracks[index+change].name);
                            cover.css('background-image', 'url(' + options.trackBaseDirectory + '/' + options.tracks[index+change].cover + ')');


                            $('#barwrapper', element).slider('option', 'max', audio.duration);
                            $('#barwrapper', element).slider('option', 'value', 0);

                            return false;
                        }
                    });
                });

                if(options.autoplay) {
                    $('#playpause').trigger('click');
                }

                if(options.stopOnPlayingYouTubeVideo.length > 0) {
                    window.ytControlFunction = function(newState) {
                        // stop the audio player when YouTube video is started
                        if(!audio.paused && newState == 1) {
                            window.sixteenthNotesWasPlaying = true;
                            $('#playpause').trigger('click');
                        }

                        // resume playing if sixteenthnotes was playing before
                        if(newState == 0 && window.sixteenthNotesWasPlaying == true) {
                            $('#playpause').trigger('click');
                        }
                    };

                    window.onYouTubePlayerReady = function(playerId) {
                        document.getElementById(playerId).addEventListener("onStateChange", "ytControlFunction");
                    };
                }

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
        'crossfade': 'false',
        'autoplay': 'false',
        'stopOnPlayingYouTubeVideo': []
    };


})( jQuery );   
