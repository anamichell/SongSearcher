console.log('Script is running');

const search = document.getElementById('search');
const lyricsContainer = document.getElementById('lyrics-container');
const songNames = document.querySelectorAll('.songName');
let searchText = '';

// Define the displayLyrics function globally
function displayLyrics(songTitle, songLyrics, searchText) {
    // Implement the functionality to display lyrics based on the song title
    console.log(`Displaying lyrics for ${songTitle}`);
    console.log(songLyrics); // Log the lyrics

    // Replace single quotes with HTML entity for proper rendering
    const formattedLyrics = songLyrics.replace(/'/g, '&#39;');

    // Use <br> tag to maintain line breaks
    const lyricsHTML = formattedLyrics.replace(/\n/g, '<br>');

    // If searchText is provided, highlight the search term in the lyrics
    let highlightedLyrics = lyricsHTML;
    if (searchText) {
        highlightedLyrics = lyricsHTML.replace(new RegExp(searchText, 'gi'), match => `<span class="highlight">${match}</span>`);
    }

    // Update the lyrics container with the formatted and highlighted lyrics
    lyricsContainer.innerHTML = highlightedLyrics;
}

document.addEventListener('DOMContentLoaded', () => {
    // Add click event listener to the parent container for song names
    document.querySelector('.album-container').addEventListener('click', (event) => {
        if (event.target.classList.contains('songName')) {
            const songName = event.target;
            console.log('Song name:', songName.textContent);

            const songTitle = songName.textContent; // Get the song title
            const songLyricsData = JSON.parse(songName.dataset.lyrics);
            const songLyrics = songLyricsData.lyrics[0].lyrics; // Extract lyrics from the dataset
            console.log(songLyrics);
            const searchText = search.value.trim(); // Get the search text
            displayLyrics(songTitle, songLyrics, searchText); // Pass searchText to displayLyrics function
        }
    });

    search.addEventListener('keyup', async (event) => {
        console.log('Key pressed');
        // Check if the pressed key is not the spacebar
        if (event.key !== ' ' && event.keyCode !== 32) {
            searchText = search.value.trim(); // Update searchText when input changes
            console.log('Search text:', searchText);
    
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
                    // Clear previous results
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
                        console.log('Data lyrics: ', data.lyrics);
                        // Display song names under their respective albums
                        data.lyrics.forEach(song => {
                            const songLyrics = song.lyrics.toLowerCase();
                            if (songLyrics.includes(searchText.toLowerCase())) {
                                const songName = document.createElement('li');

                                songName.textContent = song.song_name; // Adjust according to the actual property name in your response
                                // console.log("Song name:", song.song_name);

                                const albumId = song.album_id;
                                const songList = document.querySelector(`#album-${albumId} .list`);

                                console.log("Selected song list:", songList);

                                if (songList) {
                                    songList.appendChild(songName);
                                    // Add click event listener to each dynamically created song name
                                    songName.addEventListener('click', () => {
                                        console.log('Clicked me');
                                        console.log('Song name:', songName.textContent);
                                        console.log('Lyrics: ', song.lyrics);

                                        const songTitle = songName.textContent; // Get the song title
                                        const songLyrics = song.lyrics; // Extract lyrics from the dataset
                                        console.log(songLyrics);
                                        displayLyrics(songTitle, songLyrics, searchText); // Pass updated searchText to displayLyrics function
                                    });
                                }
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
