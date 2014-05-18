
var application_root = __dirname,
    express = require( 'express' ), 
    path = require( 'path' ), 
    mongoose = require( 'mongoose' ),
    logfmt = require( 'logfmt' ),
    fs = require('fs');
var app = express();

app.configure( function() {
    
    app.use(logfmt.requestLogger());
    
    app.use(express.logger("dev"));

    app.use( express.bodyParser( {
        uploadDir: __dirname + './uploads'
    }) );

    app.use( express.methodOverride() );

    app.use( app.router );

    app.use( express.static( __dirname + '/../../site/public') );

    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.get( '/api', function( request, response ) {
    response.send( 'Library API is running' );
});

app.get( '/api/books', function( request, response ) {
    return BookModel.find( function( err, books ) {
        if( !err ) {
            return response.send( books );
        } else {
            return console.log( err );
        }
    });
});

app.post( '/api/books', function( request, response ) {
    var book = new BookModel({
        //coverImagePath: request.body.coverImagePath,
        title: request.body.title,
        author: request.body.author,
        releaseDate: request.body.releaseDate,
        keywords: request.body.keywords,
        links: request.body.links
    });

    book.save( function( err ) {
        if( !err ) {
            return console.log( 'created' );
        } else {
            return console.log( err );
        }
        return response.send( book );
    });
});

app.get( '/api/books/:id', function( request, response ) {
    return BookModel.findById( request.params.id, function( err, book ) {
        if( !err ) {
            console.log(book);
            return response.send( book );
        } else {
            return console.log( err );
        }
    });
});

app.put( '/api/books/:id', function( request, response ) {
    console.log( 'Updating book ' + request.body.title );
    return BookModel.findById( request.params.id, function( err, book ) {
        book.title = request.body.title;
        book.author = request.body.author;
        book.releaseDate = request.body.releaseDate;
        book.keywords = request.body.keywords;
        book.links = requet.body.links;

        return book.save( function( err ) {
            if( !err ) {
                console.log( 'book updated' );
            } else {
                console.log( err );
            }
            return response.send( book );
        });
    });
});

app.delete( '/api/books/:id', function( request, response ) {
    console.log( 'Deleting book with id: ' + request.params.id );
    return BookModel.findById( request.params.id, function( err, book ) {
        return book.remove( function( err ) {
            if( !err ) {
                console.log( 'Book removed' );
                return response.send( '' );
            } else {
                console.log( err );
            }
        });
    });
});

app.post('/file-upload', function(req, res) {
    // get the temporary location of the file
    var tmp_path = req.files.thumbnail.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './public/images/' + req.files.thumbnail.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
        });
    });
});

app.get('/image.png', function (req, res) {
    res.sendfile(path.resolve('./uploads/image.png'));
});


mongoose.connect( 'mongodb://localhost/assignment2' );

var Book = new mongoose.Schema({
    coverImagePath: String,
    title: String,
    author: String,
    releaseDate: Date,
    keywords: [Keywords],
    links: String
});

var Keywords = new mongoose.Schema({
    keyword: String
});

var BookModel = mongoose.model( 'Book', Book );



var port = 8180;
app.listen( port, function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});
