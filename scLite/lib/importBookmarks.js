var Promise = require('bluebird');

module.exports = function importBookmarks(x, data)
{
	var elements = data.bookmarks || data.snapshots;
    return Promise.all(elements.map(function(bookmark)
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