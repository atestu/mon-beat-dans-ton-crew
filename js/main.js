(function (playlists, tracks, track, sound, oldTracks) {
	SC.initialize({ client_id: "4fedbfcc06348cea658479ef1d47ebfb" });

	playlists.map(function (playlist) {
		SC.get(playlist, function(data){
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
		var randomTrack = tracks[Math.floor(Math.random()*tracks.length)];
		for (var i = oldTracks.length - 1; i >= 0; i--) {
			if (oldTracks[i].id == randomTrack.id)
				randomTrack = tracks[Math.floor(Math.random()*tracks.length)];
			else
				break;
		};
		if (oldTracks.length == tracks.length) oldTracks = [];
		oldTracks.push(randomTrack);
		return randomTrack;
	}

	function playTrack () {
		if (sound) sound.stop();
		if (track.artwork_url)
			$('#cover').show().attr('src', track.artwork_url)
		else
			$('#cover').hide();
		$('#title').text(track.title).attr('href', track.permalink_url);
		$('.twitter-share-button').remove();
		$('h2').append(' <a id="twitter-btn" href="https://twitter.com/share" data-text="'+ track.title + ' #MonBeatDTC" data-url="'+ location.href +'"class="twitter-share-button" data-related="monbeatdtc" data-lang="en" data-size="large" data-count="none">Tweet</a>');
		twttr.widgets.load();

		SC.stream("/tracks/"+track.id, function(s){
			sound = s;
			sound.play({
				onfinish: function () {
					location.hash = '#'+track.id;
				}
			});
		});

		window._gaq = window._gaq || [];
		window._gaq.push(['_trackEvent', 'Tracks', 'Play', track.title]);

		track = getRandomTrack();
		$('#buzzer').attr('href', '#'+track.id);
	}

	window.onhashchange = playTrack;
})(['/playlists/4890458', '/playlists/4835251', '/playlists/4890458', '/playlists/5067224', '/playlists/5346586'], [], false, false, []);
