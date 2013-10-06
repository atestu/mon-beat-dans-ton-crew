(function () {
	var playlists = [4890458, 5673616, 4890458, 5067224, 5346586, 6080329, 6789700, 7432792, 9197291, 10059692, 11306085],
		tracks = [],
		track = false,
		sound = false,
		oldTracks = [];

	SC.initialize({ client_id: "4fedbfcc06348cea658479ef1d47ebfb" });

	playlists = _.shuffle(playlists);

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

	function getRandomTrack () {
		var randomTrack = _.sample(tracks);
		if (oldTracks.length == tracks.length)
			oldTracks = [];
		while (_.contains(oldTracks, randomTrack) || !randomTrack.streamable)
			randomTrack = _.sample(tracks);
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
		$('h2').append(' <a id="twitter-btn" href="https://twitter.com/share" data-text="'+ track.title + ' @MonBeatDTC" data-url="'+ location.href +'"class="twitter-share-button" data-related="monbeatdtc" data-size="large" data-count="none">Tweet</a>');
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
