const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }
  static getStories(cb) {
    // fetch stories from API
    let settings = {
      async: true,
      crossDomain: true,
      url: `${BASE_URL}/stories`,
      method: 'GET',
      headers: {}
    };
    $.ajax(settings).done(function(response) {
      let storyList = new StoryList(response);
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
