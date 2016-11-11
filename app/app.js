import React from 'react';
import ReactDOM from 'react-dom';
import Feed from './components/feed';

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            {/* Show the Feed at / */}
            <IndexRoute component={FeedPage}/>
            <Route path="profile/:id" component={ProfilePage}/>
        </Route>
    </Router>
  ),
  document.getElementById('fb-feed')
);
