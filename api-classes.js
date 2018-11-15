const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';
// Current Prgoress: Start of Step 6
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }
  static getStories(cb) {
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
      data: `{"token": "${user.token}", "story": {"author": "${
        newStory.author
      }", "title": "${newStory.title}", "url": "${newStory.url}" } }`
    };
    $.ajax(settings).done(function(response) {
      let { author, title, url, username, storyId } = response.story;
      let newStory = new Story(username, title, author, url, storyId);
      this.stories.push(newStory);
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
      data: `{"token": "${user.token}"}`
    };
    $.ajax(settings).done(function(response) {
      let storyIndex = this.stories.findIndex(story => story.storyId === id);
      this.stories.splice(storyIndex, 1);
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
      data: `{"token": "${this.token}"}`
    };
    $.ajax(settings).done(function(response) {
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
      data: `{"token": "${this.token}"}`
    };
    $.ajax(settings).done(function(response) {
      let favoriteIndex = response.user.favorites.findIndex(
        index => index.storyId === id
      );
      this.favorites.push(response.user.favorites[favoriteIndex]);
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
      data: `{"token": "${this.token}"}`
    };
    $.ajax(settings).done(function(response) {
      let favoriteIndex = response.user.favorites.findIndex(
        index => index.storyId === id
      );
      this.favorites.splice(favoriteIndex, 1);
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
