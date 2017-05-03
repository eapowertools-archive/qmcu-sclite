var Promise = require('bluebird');

module.exports = function importBookmarks(x, data)
{
    return Promise.all(data.bookmarks.map(function(bookmark)
    {
        return x.app.createBookmark(bookmark)
        .then(function(handle)
        {
         //   console.log("added bookmark " + bookmark.qMetaDef.title)
            return bookmark.qInfo.qId;
        })
    }))
    .then(function(bookmarkIds)
    {
        return bookmarkIds;
    })
    .catch(function(error){
        return error;
    });
};