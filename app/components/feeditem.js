import React from 'react';
import StatusUpdate from './statusupdate';
import CommentThread from './commentthread';
import Comment from './comment';
import {postComment, likeFeedItem, unlikeFeedItem} from './../server';

export default class FeedItem extends React.Component {
    constructor(props) {
        super(props);
        // The FeedItem's initial state is what the Feed passed to us.
        this.state = props.data;
    }
    handleCommentPost(commentText) {
        // Post a comment as user ID 4, which is our mock user!
        postComment(this.state._id, 4, commentText, (updatedFeedItem) => {
            // Update our state to trigger a re-render.
            this.setState(updatedFeedItem);
        });
    }
    handleLikeClick(clickEvent) {
        clickEvent.preventDefault();
        if (clickEvent.button === 0) {
            var callbackFunction = (updatedLikeCounter) => {
                this.setState({likeCounter: updatedLikeCounter});
            };
            if (this.didUserLike()) {
                // User clicked 'unlike' button.
                unlikeFeedItem(this.state._id, 4, callbackFunction);
            } else {
                // User clicked 'like' button.
                likeFeedItem(this.state._id, 4, callbackFunction);
            }
        }
    }
    /**
    * Returns 'true' if the user liked the item.
    * Returns 'false' if the user has not liked the item.
    */
    didUserLike() {
        var likeCounter = this.state.likeCounter;
        var liked = false;
        // Look for a likeCounter entry with userId 4 -- which is the
        // current user.
        for (var i = 0; i < likeCounter.length; i++) {
            if (likeCounter[i]._id === 4) {
                liked = true;
                break;
            }
        }
        return liked;
    }

    render() {
        // Render using data from state.
        var likeButtonText = "Like";
        if (this.didUserLike()) {
            likeButtonText = "Unlike";
        }

        var data = this.state;
        var contents;
        switch (data.type) {
            case "statusUpdate":
                // Create a StatusUpdate. Dynamically created
                // React component: needs a key.
                // Keys only need to be unique among *siblings*,
                // so we can re-use the same key as the FeedItem.
                contents = (
                    <StatusUpdate key={data._id} author={data.contents.author} postDate={data.contents.postDate} location={data.contents.location}>
                        {data.contents.contents.split("\n").map((line, i) => {
                            return (
                                <p key={"line" + i}>{line}</p>
                            );
                        })}
                    </StatusUpdate>
                );
                break;
            default:
                throw new Error("Unknown FeedItem: " + data.type);
        }

        return (
            <div className="fb-status-update panel panel-default">
                <div className="panel-body">
                    {contents}
                    <hr/>
                    <div className="row">
                        <div className="col-md-12">
                            <ul className="list-inline">
                                <li>
                                    <a href="#" onClick={(e) => this.handleLikeClick(e)}>
                                        <span className="glyphicon glyphicon-thumbs-up"></span>
                                        {likeButtonText}
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <span className="glyphicon glyphicon-comment"></span>
                                        Comment
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <span className="glyphicon glyphicon-share-alt"></span>
                                        Share
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="panel-footer">
                    <div className="row">
                        <div className="col-md-12">
                            <a href="#">{data.likeCounter.length}
                                people</a>
                            like this
                        </div>
                    </div>
                    <hr/>
                    <CommentThread onPost={(commentText) => this.handleCommentPost(commentText)}>
                        {data.comments.map((comment, i) => {
                            // i is comment's index in comments array
                            return (
                                <Comment key={i} feedItemId={this.state._id} comment={comment}>
                                    {comment.contents}
                                </Comment>
                            );
                        })
                    } </CommentThread>
                </div > </div>)
                }
            }
