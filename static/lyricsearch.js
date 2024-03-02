console.log('Script is running');

document.addEventListener('DOMContentLoaded', () => {
    const search = document.getElementById('search');
    const songList = document.getElementById('songList');

    const songNames = document.querySelectorAll('.songName');

    // Add onclick event listener to each song name
    songNames.forEach(songName => {
        songName.addEventListener('click', () => {
            const songTitle = songName.textContent; // Get the song title
            const songLyrics = songName.
            displayLyrics(songTitle); // Call displayLyrics function with the song title
        });
    });

function displayLyrics(songTitle) {
    // Implement the functionality to display lyrics based on the song title
    console.log(`Displaying lyrics for ${songTitle}`);
    // Add your code here to display the lyrics
}

    search.addEventListener('keyup', async (event) => {
        console.log('Key pressed');
        // Check if the pressed key is not the spacebar
        if (event.key !== ' ' && event.keyCode !== 32) {
            const searchText = search.value.trim();
            console.log(searchText);
    
            try {
                const response = await fetch('/lyric_search', {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({
                        text: searchText
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    // Clear previous results
                    const songLists = document.querySelectorAll('.album-container .list');
                    songLists.forEach(songList => {
                        songList.innerHTML = '';
                    });

                    console.log(data);
    
                    if (data.lyrics.length === 0) {
                        // Display a message if no matching songs are found
                        songLists.forEach(songList => {
                            songList.innerHTML = '<li>No matching songs found</li>';
                        });
                    } else {
                        console.log('Data lyrics: ', data.lyrics)
                        // Display song names under their respective albums
                        data.lyrics.forEach(song => {
                            const songName = document.createElement('li');

                            songName.textContent = song.song_name; // Adjust according to the actual property name in your response
                            console.log("Song name:", song.song_name);

                            const albumId = song.album_id;
                            const songList = document.querySelector(`#album-${albumId} .list`);
                            console.log(`#album-${albumId} .list`, document.querySelector(`#album-${albumId} .list`));


                            console.log("Selected song list:", songList);

                            if (songList) {
                                songList.appendChild(songName);
                            }
                        });
                    }
                } else {
                    console.error('Error: Search Not Responding');
                }
            } catch (error) {
                console.error('Error: Cannot Fetch DB', error);
            }
        } else {
            // Clear the songList container if only the spacebar is pressed
            const songLists = document.querySelectorAll('.album-container .list');
            songLists.forEach(songList => {
                songList.innerHTML = '';
            });
        }
    });
    
});
