(function () {
	var playlists = [4890458, 5673616, 4890458, 5067224, 5346586, 6080329, 6789700, 7432792, 9197291],
		tracks = [],
		track = false,
		sound = false,
		oldTracks = [];

	SC.initialize({ client_id: "4fedbfcc06348cea658479ef1d47ebfb" });

	//+ Jonas Raoni Soares Silva
	//@ http://jsfromhell.com/array/shuffle [v1.0]
	function shuffle(o){ //v1.0
	    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	};

	playlists = shuffle(playlists);

	playlists.map(function (playlist) {
		SC.get('/playlists/'+playlist, function(data){
			if (tracks.length == 0) {
				tracks = data.tracks;
				if (location.hash !== '') {
					SC.get('/tracks/'+location.hash.replace('#',''), function (_track) {
						track = _track;
						playTrack();
					});
				}
				else {
					track = getRandomTrack();
					$('#buzzer').attr('href', '#'+track.id);
				}
			}
			else {
				tracks = tracks.concat(data.tracks);
			}
		});
	});

	function hasAlreadyBeenPlayed (track) {
		return oldTracks.some(function (o) {
			return o.id == track.id;
		});
	}

	function getRandomTrack () {
		var randomTrack = tracks[Math.floor(Math.random()*tracks.length)];
		if (oldTracks.length == tracks.length)
			oldTracks = [];
		while (hasAlreadyBeenPlayed (randomTrack) && !randomTrack.streamable)
			randomTrack = tracks[Math.floor(Math.random()*tracks.length)];
		oldTracks.push(randomTrack);
		return randomTrack;
	}

	function playTrack () {
		if (!track.streamable) track = getRandomTrack();
		if (sound) sound.stop();
		if (track.artwork_url) {
			$('#cover').show().attr('src', track.artwork_url);
		}
		else {
			$('#cover').hide();
		}
		$('#title').text(track.title).attr('href', track.permalink_url);
		$('.twitter-share-button').remove();
		$('h2').append(' <a id="twitter-btn" href="https://twitter.com/share" data-text="'+ track.title + ' #MonBeatDTC" data-url="'+ location.href +'"class="twitter-share-button" data-related="monbeatdtc" data-lang="en" data-size="large" data-count="none">Tweet</a>');
		twttr.widgets.load();

		SC.stream("/tracks/"+track.id, {
			autoPlay: true,
			onplay: function () {
				sound = this;
			},
			onfinish: function () {
				location.hash = '#'+track.id;
			}
		});

		window._gaq = window._gaq || [];
		window._gaq.push(['_trackEvent', 'Tracks', 'Play', track.title]);

		track = getRandomTrack();
		$('#buzzer').attr('href', '#'+track.id);
	}

	window.onhashchange = playTrack;
})();
