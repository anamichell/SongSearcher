console.log('Script is running');

const search = document.getElementById('search');
const songList = document.getElementById('songList');
const lyricsContainer = document.getElementById('lyrics-container');

search.addEventListener('keyup', async() => {
    console.log('Key pressed');
    const searchText = search.value.trim();

    try { 
        const response = await fetch('/lyric_search', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
                text: searchText
            })
        });
        if(response.ok) {
            const data = await response.json();
            songList.innerHTML = '';
            
            // add this stuff to the page
            data.lyrics.forEach(lyric => { 
                const lyricItem = document.createElement('li'); 
                lyricItem.textContent = lyric.text;
                lyricItem.appendChild(lyricItem);
            });
        } else {
            console.error('Error: Search Not Responding');
        }
    } catch(error) { 
        console.error('Error: Cannot Fetch DB');
    }
})


