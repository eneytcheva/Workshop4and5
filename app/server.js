import {
    readDocument,
    writeDocument,
    addDocument
} from './database.js';

function emulateServerReturn(data, cb) {
    setTimeout(() => {
        cb(data);
    }, 4);
}

function getFeedItemSync(feedItemId) {
    var feedItem = readDocument('feedItems', feedItemId);

    feedItem.likeCounter = feedItem.likeCounter.map((id) => readDocument('users', id));
    feedItem.contents.author = readDocument('users', feedItem.contents.author);
    feedItem.comments.forEach((comment) => {
        comment.author = readDocument('users', comment.author);
    });
    return feedItem;
}

export function getFeedData(user, cb) {
    var userData = readDocument('users', user);
    var feedData = readDocument('feeds', userData.feed);
    feedData.contents = feedData.contents.map(getFeedItemSync);
    emulateServerReturn(feedData, cb);
}

export function postStatusUpdate(user, location, contents, cb) {
    var time = new Date().getTime();
    var newStatusUpdate = {
        "likeCounter": [],
        "type": "statusUpdate",
        "contents": {
            "author": user,
            "postDate": time,
            "location": location,
            "contents": contents
        },
        "comments": []
    };
    newStatusUpdate = addDocument('feedItems', newStatusUpdate);
    var userData = readDocument('users', user);
    var feedData = readDocument('feeds', userData.feed);
    feedData.contents.unshift(newStatusUpdate._id);
    writeDocument('feeds', feedData);
    emulateServerReturn(newStatusUpdate, cb);
}

export function postComment(feedItemId, author, contents, cb) {
    var feedItem = readDocument('feedItems', feedItemId);
    feedItem.comments.push({
        "author": author,
        "contents": contents,
        "postDate": new Date().getTime()
    });
    writeDocument('feedItems', feedItem);
    emulateServerReturn(getFeedItemSync(feedItemId), cb);
}

export function likeFeedItem(feedItemId, userId, cb) {
    var feedItem = readDocument('feedItems', feedItemId);
    feedItem.likeCounter.push(userId);
    writeDocument('feedItems', feedItem);
    emulateServerReturn(feedItem.likeCounter.map((userId) =>
        readDocument('users', userId)), cb);
}

export function unlikeFeedItem(feedItemId, userId, cb) {
    var feedItem = readDocument('feedItems', feedItemId);
    var userIndex = feedItem.likeCounter.indexOf(userId);
    if (userIndex !== -1) {
        feedItem.likeCounter.splice(userIndex, 1);
        writeDocument('feedItems', feedItem);
    }
    emulateServerReturn(feedItem.likeCounter.map((userId) =>
        readDocument('users', userId)), cb);
}
