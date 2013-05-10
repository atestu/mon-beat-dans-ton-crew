var playlists = ['/playlists/4890458', '/playlists/4835251', '/playlists/4890458', '/playlists/5067224', '/playlists/5346586']; // playlists (will all be combined into tracks)
	tracks = [], // global track list
	track = false, // current track (track object)
	sound = false; // current sound (streaming object)

SC.initialize({
	client_id: "4fedbfcc06348cea658479ef1d47ebfb",
});

var queuePlaylist = function (playlist) {
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
				track = tracks[Math.floor(Math.random()*tracks.length)];
				$('#buzzer').attr('href', '#'+track.id);
			}
		}
		else {
			tracks = tracks.concat(data.tracks);
		}
	});
}

playlists.map(queuePlaylist);

var playTrack = function () {
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

	var _gaq = _gaq || [];
	_gaq.push(['_trackEvent', 'Tracks', 'Play', track.title]);

	track = tracks[Math.floor(Math.random()*tracks.length)];
	$('#buzzer').attr('href', '#'+track.id);
}

window.onhashchange = function () {
	playTrack();
}
