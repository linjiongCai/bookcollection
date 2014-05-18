var app =  {

}

app.Book = Backbone.Model.extend({
    defaults: {
        coverImage: 'img/placeholder.png',
        title: 'No title',
        author: 'Unknown',
        releaseDate: 'Unknown',
        keywords: 'None',
        links: 'None'
        
    },

    parse: function( response ) {
        response.id = response._id;
        return response;
    },
});



app.BookView = Backbone.View.extend({
    tagName: 'div',
    className: 'bookContainer',
     events: {
        'click .edit': 'edit',
        'click .delete': 'deleteBook',
        'blur .item': 'close',
        'keypress .item': 'onEnterUpdate',
        'keyup .search' : 'search', 
    },
    
    initialize: function() {
        this.template= _.template( $( '#book-Template' ).html() );
    },
   
    deleteBook: function(ev) {
        ev.preventDefault();
        this.model.destroy();
        this.remove();
    },

    edit: function(ev) {
            ev.preventDefault();
            this.$('.item').attr('contenteditable', true).focus();
          },

    close: function(ev) {
            var item = this.$('.item').text();
            this.model.set('item', item);
            this.$('.item').removeAttr('contenteditable');
          },

    onEnterUpdate: function(ev) {
            var self = this;
            if (ev.keyCode == 13) {
              this.close();
              _.delay(function() { self.$('.item').blur()}, 100);
            }
          },

    search: function() {
        this.collection.reset(filteredModels);
    },

    render: function() {
        this.$el.html( this.template( this.model.toJSON() ) );
        return this;
    },

});


app.Library = Backbone.Collection.extend({
    model: app.Book,
    //localStorage: new Store("app.Library"),
    url: '/api/books'
});

app.LibraryView = Backbone.View.extend({
    el: '#books',
    events:{
    'click #add':'addBook'
    },

    initialize: function() {
    this.collection = new app.Library();
    this.collection.fetch({reset: true}); 
    this.render();

    this.listenTo( this.collection, 'add', this.renderBook );
    this.listenTo( this.collection, 'reset', this.render ); 
},

    render: function() {
        this.collection.each(function( item ) {
            this.renderBook( item );
        }, this );
    },

    renderBook: function( item ) {
        var bookView = new app.BookView({
            model: item
        });
        this.$el.append( bookView.render().el );
    },

    addBook: function( e ) {
    e.preventDefault();

    var formData = {};

    $( '#addBook div' ).children( 'input' ).each( function( i, el ) {
        if( $( el ).val() != '' )
        {
            if( el.id === 'keywords' ) {
                formData[ el.id ] = [];
                _.each( $( el ).val().split( ' ' ), function( keyword ) {
                    formData[ el.id ].push({ 'keyword': keyword });
                });
            } else if( el.id === 'releaseDate' ) {
                formData[ el.id ] = $( '#releaseDate' ).datepicker( 'getDate' ).getTime();
            } else {
                formData[ el.id ] = $( el ).val();
            }
        }
       
        $( el ).val('');
    });

    this.collection.create( formData );
},
});

$(function() {
    $( '#releaseDate' ).datepicker();
    new app.LibraryView();

     var serverURL = "http://localhost:8180/", // IMPORTANT: This URL needs to be accessible from your phone for testing.
        $scroller = $('.scroller'),

        // Get List of images from server
        getFeed = function () {
            $scroller.empty();
            $.ajax({url: serverURL + "/images", dataType: "json", type: "GET"}).done(function (data) {
                var l = data.length;
                for (var i = 0; i < l; i++) {
                    $scroller.append('<img src="' + serverURL + '/' + data[i].fileName + '"/>');
                }
            });
        },

        // Upload image to server
        upload = function (imageURI) {
            var ft = new FileTransfer(),
                options = new FileUploadOptions();

            options.fileKey = "file";
            options.fileName = 'filename.jpg'; // We will use the name auto-generated by Node at the server side.
            options.mimeType = "image/jpeg";
            options.chunkedMode = false;
            options.params = { // Whatever you populate options.params with, will be available in req.body at the server-side.
                "description": "Uploaded from my phone"
            };

            ft.upload(imageURI, serverURL + "/images",
                function (e) {
                    getFeed();
                },
                function (e) {
                    alert("Upload failed");
                }, options);
        },

        // Take a picture using the camera or select one from the library
        takePicture = function (e) {
            var options = {
                quality: 45,
                targetWidth: 1000,
                targetHeight: 1000,
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.JPEG,
                sourceType: Camera.PictureSourceType.CAMERA
            };

            navigator.camera.getPicture(
                function (imageURI) {
                    console.log(imageURI);
                    upload(imageURI);
                },
                function (message) {
                    // We typically get here because the use canceled the photo operation. Fail silently.
                }, options);

            return false;

        };

    $('.camera-btn').on('click', takePicture);

    getFeed();

});