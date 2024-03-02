const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const ejs = require('ejs');

const PORT = 8080;



let db;

(async () => {
    try {
        db = await open({
            filename: 'SongSearcher.sqlite',
            driver: sqlite3.Database
        });
        console.log('Connected to the database');
    } catch (error) {
        console.log('Error connecting to the database');
    }
})();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));

app.get('/songs', async (req, res) => {
    try {
        // Fetch albums
        const albums = await db.all('SELECT * FROM Albums');

        // Fetch songs and lyrics sequentially
        for (const album of albums) {
            // Fetch songs associated with the album
            album.songs = await db.all('SELECT * FROM Songs WHERE album_id = ?', [album.album_id]);

            // Fetch lyrics for each song
            for (const song of album.songs) {
                song.lyrics = await db.all('SELECT * FROM Lyrics WHERE song_id = ?', [song.song_id]);
            }
        }

        // Moved the console.log statement inside the asynchronous block
        console.log('Albums:', albums);

        // Render the 'lyricsearch' template and pass data to it
        res.render('lyricsearch', { albums });
    } catch (error) {
        console.error('Error fetching data from the database:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/songs', async (req, res) => {
	console.log(req.body);
    try {
        // Fetch albums
        const albums = await db.all('SELECT * FROM Albums');

        // Fetch songs and lyrics sequentially
        for (const album of albums) {
            // Fetch songs associated with the album
            album.songs = await db.all('SELECT * FROM Songs WHERE album_id = ?', [album.album_id]);

            // Fetch lyrics for each song
            for (const song of album.songs) {
                song.lyrics = await db.all('SELECT * FROM Lyrics WHERE song_id = ?', [song.song_id]);
            }
        }

        // Moved the console.log statement inside the asynchronous block
        console.log('Albums:', albums);

        // Render the 'lyricsearch' template and pass data to it
        res.render('lyricsearch', { albums });
    } catch (error) {
        console.error('Error fetching data from the database:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/lyric_search', async (req, res) => {
    let { text } = req.body;
    
    // Trim the search text to remove leading and trailing spaces
    text = text.trim();

    // Check if the search text is empty after trimming
    if (text === '') {
        try {
            // If the search text is empty, fetch all songs
            const query = `
                SELECT Lyrics.*, Songs.title as song_name, Songs.album_id
                FROM Lyrics 
                INNER JOIN Songs ON Lyrics.song_id = Songs.song_id
            `;
            const lyrics = await db.all(query);
            res.json({ lyrics });
        } catch (error) {
            console.error('Error retrieving lyrics:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // If the search text is not empty, perform the search as usual
        const keywords = text.split(' ');
        const placeholders = Array(keywords.length).fill('?').join(', ');

        try {
            const query = `
                SELECT Lyrics.*, Songs.title as song_name, Songs.album_id
                FROM Lyrics 
                INNER JOIN Songs ON Lyrics.song_id = Songs.song_id
                INNER JOIN Albums ON Songs.album_id = Albums.album_id
                WHERE REPLACE(LOWER(lyrics), "'", "") LIKE ${keywords.map(() => 'LOWER(REPLACE(?, "\'", ""))').join(' OR ')}
            `;
            const params = keywords.map(keyword => `%${keyword.toLowerCase()}%`);

            const lyrics = await db.all(query, params);
            res.json({ lyrics });
        } catch (error) {
            console.error('Error retrieving lyrics:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});





app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
