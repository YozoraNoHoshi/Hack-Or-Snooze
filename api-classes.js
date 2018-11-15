const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';
// Current Prgoress: Start of Step 6
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }
  static getStories(cb) {
    // Returns a StoryList instance with an array that contains Story instances, one for each story in the api
    $.getJSON(`${BASE_URL}/stories`, function(response) {
      const stories = response.stories.map(function(story) {
        const { username, title, author, url, storyId } = story;
        return new Story(username, title, author, url, storyId);
      });
      const storyList = new StoryList(stories);
      return cb(storyList);
    });
  }
  addStory(user, newStory, cb) {
    let settings = {
      method: 'POST',
      url: `${BASE_URL}/stories`,
      headers: {
        'content-type': 'application/json'
      },
      data: `{"token": "${user.loginToken}", "story": {"author": "${
        newStory.author
      }", "title": "${newStory.title}", "url": "${newStory.url}" } }`
    };
    $.ajax(settings).done(function(response) {
      let { author, title, url, username, storyId } = response.story;
      let newStory = new Story(username, title, author, url, storyId);
      // Adds the newly created story to the user's story array
      this.stories.push(newStory);
      // Syncs the user's data object with the server's entry for the user.
      user.retrieveDetails(() => cb(newStory));
    });
  }
  removeStory(user, id, cb) {
    let settings = {
      url: `${BASE_URL}/stories/${id}`,
      method: 'DELETE',
      headers: {
        'content-type': 'application/json'
      },
      data: `{"token": "${user.loginToken}"}`
    };
    $.ajax(settings).done(function(response) {
      let storyIndex = this.stories.findIndex(story => story.storyId === id);
      // Removes a story from the user's object array
      this.stories.splice(storyIndex, 1);
      // Syncs with server
      user.retrieveDetails(() => cb(this));
    });
  }
}

class User {
  constructor(username, password, name) {
    this.username = username;
    this.password = password;
    this.name = name;
    this.loginToken = '';
    this.favorites = [];
    this.ownStories = [];
  }
  static create(username, password, name, cb) {
    let settings = {
      url: `${BASE_URL}/signup`,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data: `{"user": {"name": "${name}","username": "${username}","password": "${password}"}}`
    };
    $.ajax(settings).done(function(response) {
      // Returns the created User instance
      let { username, name } = response.user;
      let newUser = new User(username, password, name);
      return cb(newUser);
    });
  }
  login(cb) {
    let settings = {
      url: `${BASE_URL}/signuplogin`,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data: `{"user": {"username": "${this.username}","password": "${
        this.password
      }"}}`
    };
    $.ajax(settings).done(function(response) {
      // Returns the user object with a new token value from the server
      this.loginToken = response.token;
      return cb(this);
    });
  }
  retrieveDetails(cb) {
    let settings = {
      url: `${BASE_URL}/${this.username}`,
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      },
      data: `{"token": "${this.loginToken}"}`
    };
    $.ajax(settings).done(function(response) {
      // Returns the user object with updated keys.
      this.name = response.user.name;
      this.favorites = response.user.favorites;
      this.ownStories = response.user.stories;
      return cb(this);
    });
  }
  addFavorite(id, cb) {
    let settings = {
      url: `${BASE_URL}/users/${this.username}/favorites/${id}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data: `{"token": "${this.loginToken}"}`
    };
    $.ajax(settings).done(function(response) {
      // uses a POST method to add a favorite to the user server entry,
      // then syncs with the local user data object
      this.retrieveDetails(() => cb(this));
    });
  }
  removeFavorite(id, cb) {
    let settings = {
      url: `${BASE_URL}/users/${this.username}/favorites/${id}`,
      method: 'DELETE',
      headers: {
        'content-type': 'application/json'
      },
      data: `{"token": "${this.loginToken}"}`
    };
    $.ajax(settings).done(function(response) {
      // uses a DELETE method to remove a favorite from the user's favorites array,
      // then syncs with the server
      this.retrieveDetails(() => cb(this));
    });
  }
}

class Story {
  constructor(username, title, author, url, storyId) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
  }
}
