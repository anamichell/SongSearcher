console.log('Script is running');

document.addEventListener('DOMContentLoaded', () => {
    const search = document.getElementById('search');
    const songList = document.getElementById('songList');

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
                        // Display song names under their respective albums
                        data.lyrics.forEach(song => {
                            const songName = document.createElement('li');
                            songName.textContent = song.song_name; // Adjust according to the actual property name in your response
                            const albumId = song.album_id;
                            const songList = document.querySelector(`#album-${albumId} .list`);
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
