import React from 'react';
import ReactDOM from 'react-dom';

var initialData = {
    // The "user" collection. Contains all of the users in our Facebook system.
    "users": {
        // This user has id "1".
        "1": {
            "_id": 1,
            "fullName": "Someone",
            "feed": 1
        },
        "2": {
            "_id": 2,
            "fullName": "Someone Else",
            "feed": 2
        },
        "3": {
            "_id": 3,
            "fullName": "Another Person",
            "feed": 3
        },
        // This is "you"!
        "4": {
            "_id": 4,
            "fullName": "John Vilk",
            // ID of your feed.
            "feed": 4
        }
    },
    // The 'feedItems' collection. Contains all of the feed items on our Facebook
    // system.
    "feedItems": {
        "1": {
            "_id": 1,
            // A list of users that liked the post. Here, "Someone Else" and "Another Person"
            // liked this particular post.
            "likeCounter": [
                2, 3
            ],
            // The type and contents of this feed item. This item happens to be a status
            // update.
            "type": "statusUpdate",
            "contents": {
                // ID of the user that posted the status update.
                "author": 1,
                // 01/24/16 3:48PM EST, converted to Unix Time
                // (# of milliseconds since Jan 1 1970 UTC)
                // https://en.wikipedia.org/wiki/Unix_time
                "postDate": 1453668480000,
                "location": "Austin, TX",
                "contents": "ugh."
            },
            // List of comments on the post
            "comments": [{
                "_id": 1,
                // The author of the comment.
                "author": 2,
                // The contents of the comment.
                "contents": "hope everything is ok!",
                // The date the comment was posted.
                // 01/24/16 22:00 EST
                "postDate": 1453690800000,
                "likeCounter": []
            }, {
                "_id": 2,
                "author": 3,
                "contents": "sending hugs your way",
                "postDate": 1453690800000,
                "likeCounter": []
            }]
        }
    },
    // "feeds" collection. Feeds for each FB user.
    "feeds": {
        "4": {
            "_id": 4,
            // Listing of FeedItems in the feed.
            "contents": [1]
        },
        "3": {
            "_id": 3,
            "contents": []
        },
        "2": {
            "_id": 2,
            "contents": []
        },
        "1": {
            "_id": 1,
            "contents": []
        }
    }
};

var data = JSON.parse(localStorage.getItem('facebook_data'));
if (data === null) {
  data = JSONClone(initialData);
}

/**
 * Given a feed item ID, returns a FeedItem object with references resolved.
 * Internal to the server, since it's synchronous.
 */
function getFeedItemSync(feedItemId) {
    var feedItem = readDocument('feedItems', feedItemId);
    // Resolve 'like' counter.
    feedItem.likeCounter =
        feedItem.likeCounter.map((id) => readDocument('users', id));
    // Assuming a StatusUpdate. If we had other types of
    // FeedItems in the DB, we would
    // need to check the type and have logic for each type.
    feedItem.contents.author =
        readDocument('users', feedItem.contents.author);
    31
    // Resolve comment author.
    feedItem.comments.forEach((comment) => {
        comment.author = readDocument('users', comment.author);
    });
    return feedItem;
}
/**
 * Emulates a REST call to get the feed data for a particular user.
 * @param user The ID of the user whose feed we are requesting.
 * @param cb A Function object, which we will invoke when the Feed's data is available.
 */
export function getFeedData(user, cb) {
    // Get the User object with the id "user".
    var userData = readDocument('users', user);
    // Get the Feed object for the user.
    var feedData = readDocument('feeds', userData.feed);
    // Map the Feed's FeedItem references to actual FeedItem objects.
    // Note: While map takes a callback function as an argument, it is
    // synchronous, not asynchronous. It calls the callback immediately.
    feedData.contents = feedData.contents.map(getFeedItemSync);
    // Return FeedData with resolved references.
    // emulateServerReturn will emulate an asynchronous server operation, which
    // invokes (calls) the "cb" function some time in the future.
    emulateServerReturn(feedData, cb);
}

/**
 * A dumb cloning routing. Serializes a JSON object as a string, then
 * deserializes it.
 */
function JSONClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Emulates reading a "document" from a NoSQL database.
 * Doesn't do any tricky document joins, as we will cover that in the latter
 * half of the course. :)
 */
export function readDocument(collection, id) {
  // Clone the data. We do this to model a database, where you receive a
  // *copy* of an object and not the object itself.
  return JSONClone(data[collection][id]);
}

/**
 * Emulates writing a "document" to a NoSQL database.
 */
export function writeDocument(collection, changedDocument) {
  var id = changedDocument._id;
  // Store a copy of the object into the database. Models a database's behavior.
  data[collection][id] = JSONClone(changedDocument);
  // Update our 'database'.
  localStorage.setItem('facebook_data', JSON.stringify(data));
}

/**
 * Adds a new document to the NoSQL database.
 */
export function addDocument(collectionName, newDoc) {
  var collection = data[collectionName];
  var nextId = Object.keys(collection).length;
  while (collection[nextId]) {
    nextId++;
  }
  newDoc._id = nextId;
  writeDocument(collectionName, newDoc);
  return newDoc;
}

/**
 * Reset our browser-local database.
 */
export function resetDatabase() {
  localStorage.setItem('facebook_data', JSON.stringify(initialData));
  data = JSONClone(initialData);
}

/**
 * Reset database button.
 */
class ResetDatabase extends React.Component {
  render() {
    return (
      <button className="btn btn-default" type="button" onClick={() => {
        resetDatabase();
        window.alert("Database reset! Refreshing the page now...");
        document.location.reload(false);
      }}>Reset Mock DB</button>
    );
  }
}

ReactDOM.render(
  <ResetDatabase />,
  document.getElementById('fb-db-reset')
);
