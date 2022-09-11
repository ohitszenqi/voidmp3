const express = require('express')
const bodyparser = require('body-parser')
const encoder = bodyparser.urlencoded({extended: false})
const ytdl = require('ytdl-core')
const app = express()
const PORT = 3000
const fs = require('fs') 
const path = require('path')
const ffm = require('fluent-ffmpeg')
const dl = require('image-downloader')

let bbz
app.use(express.static('public'))
app.use('css', express.static(__dirname + 'public/css/style.css'))

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('', async (req, res) => {
    res.render(__dirname + "/views/index.ejs");
    app.post('/sb', encoder, async function(req, res) {
        
        let title = (await ytdl.getInfo(req.body.data)).videoDetails.title
        let chname = (await ytdl.getInfo(req.body.data)).videoDetails.ownerChannelName
        let sng = title.replace(/[^a-zA-Z0-9]/g, '');
        bbz = title.replace(/[^a-zA-Z0-9]/g, '');
        let song = ytdl(req.body.data, { filter: 'audioonly'}).pipe(fs.createWriteStream(sng + "1" + ".mp3"))  
        
        song.on('finish', () => {

            ytdl.getInfo(req.body.data).then((info) => {
                ffm(__dirname + "/song.mp3")
                    .addOutputOption("-metadata", "comment=Cover (front)")
                    .addOutputOption("-metadata", "title=" + title )
                    .addOutputOption("-metadata", "artist=" + chname )
                    .output(__dirname + "/" + sng + ".mp3")
                    .on('end', () => {
                        res.redirect('/download')
                        sleep(10000).then(() => {
                            fs.unlinkSync(__dirname + "/" + sng + ".mp3")
                            fs.unlinkSync(sng + "1" + ".mp3")
                        })
                    })
                    .run()
            })
        })
    })  
})


app.get('/download', function(req, res) {
    res.download("app.js")
})

app.listen(process.env.PORT || 3000, () => console.log('Started'))