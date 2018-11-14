const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';

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
}

class User {
  constructor(username, password, name, loginToken, favorites, ownStories) {
    this.username = username;
    this.password = password;
    this.name = name;
    this.loginToken = loginToken;
    this.favorites = favorites;
    this.ownStories = ownStories;
  }
  static create(username, password, name, cb) {
    let settings = {
      async: true,
      crossDomain: true,
      url: `${BASE_URL}/signup`,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      processData: false,
      data: `{"user": {"name": "${name}","username": "${username}","password": "${password}"}}`
    };
    $.ajax(settings).done(function(newUser) {
      return cb(newUser);
    });
  }
  login(cb) {
    let settings = {
      async: true,
      crossDomain: true,
      url: `${BASE_URL}/signuplogin`,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      processData: false,
      data: `{"user": {"username": "${this.username}","password": "${
        this.password
      }"}}`
    };
    $.ajax(settings).done(function(response) {
      this.loginToken = response.token;
      return cb(response);
    });
  }
  retrieveDetails(cb) {
    let settings = {
      async: true,
      crossDomain: true,
      url: `${BASE_URL}/${this.username}`,
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      },
      processData: false,
      data: `{"token": "${this.token}"}`
    };
    $.ajax(settings).done(function(response) {
      this.favorites = response.user.favorites;
      this.ownStories = response.user.ownStories;
      return cb(response);
    });
  }
}

class Story {
  constructor(author, title, url, username, storyID) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyID = storyID;
  }
}
