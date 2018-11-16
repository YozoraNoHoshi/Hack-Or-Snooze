$(function() {
  const $submit = $('#submit');
  const $login = $('#login');
  const $favorites = $('#favorites');
  const $newForm = $('#new-form');
  const $stories = $('#stories');
  const $title = $('#title');
  const $url = $('#url');
  const $clearFilter = $('.navbar-right');
  const $switchForm = $('#switch-login-form');
  const $nameField = $('#name-field');
  const $profile = $('#profile');
  const $delete = $('#delete-story');

  const $loginForm = $('#login-form');
  const $loginButton = $('#login-button');
  const $logout = $('#logout');
  let localUser;

  // BONUS STUFF

  // TO DO: Create a user profile page or window or something.
  // Not sure how we should handle this yet, seperate page or just a dropdown menu
  // User profile should contain the username, name, and a censored password field.
  // Update changes to server with update user method.
  // Functionality to change these entries can be added in the form of a form / button.

  // TO DO: Editing Stories
  // Stories can be edited by clicking some sort of edit button, likely built using a similar function to the delete event listener
  // On clicking the edit button for a specific story, a dropdown menu will appear allowing for modification of title, url, link, etc etc
  // Call the update story method from the api to update changes to the server.

  $submit.on('click', function() {
    $newForm.slideToggle();
  });

  $login.on('click', function() {
    $loginForm.slideToggle();
  });

  $delete.on('click', function(e) {
    // let trackUsername = $(`li[data-username=${localUser.username}]`);
    // On first click of delete
    // Find all attributes with data-username = localuser's username
    // Show trash can icon to all valid matches.
    // On second click of delete
    // Find all "clicked" trash cans and delete them from dom,
    // and call remove story on their id, using their id stored in the attr "id"
    // Hide all trash cans again.
  });

  $switchForm.on('click', function(e) {
    $nameField.slideToggle();
    if ($switchForm.text() === 'new user') {
      $switchForm.text('login here');
      $loginButton.text('register');
    } else {
      $switchForm.text('new user');
      $loginButton.text('login');
    }
  });

  $loginForm.on('submit', function(e) {
    e.preventDefault();

    let $username = $('#username').val();
    let $name = $('#your-name').val();
    let $password = $('#password').val();

    if ($loginButton.text() === 'register') {
      User.create($username, $password, $name, function(newUser) {
        localUser = newUser;
        $loginForm.slideToggle();
        toggleLoginElements();
      });
    } else {
      User.login($username, $password, function(newUser) {
        localUser = newUser;
        $loginForm.slideToggle();
        toggleLoginElements();
      });
    }
  });

  $logout.on('click', function(e) {
    e.preventDefault();

    localStorage.removeItem('tokenJWT');
    localStorage.removeItem('usernameJWT');
    toggleLoginElements();
  });

  // On submitting a new story, add new story to the homepage
  // NEEDS: ADD SERVER INTERACTION
  // SHOULD CALL storyList.addStory(localUser, OBJ, cb)
  // WHERE OBJ is an object literal with keys { title = $title.val(), url = $url.val, author = localUser.username }
  // CB is a callback with one parameter 'response', response is an array containing all stories.
  // Not sure if the callback needs to do anything
  $newForm.on('submit', function(e) {
    e.preventDefault();

    appendNewStory($title.val(), $url.val());
    $submit.trigger('click');
    $title.val('');
    $url.val('');
  });

  // on clicking the small hostname, hide all different hostnames
  $stories.on('click', 'small', function(e) {
    let currentHostname = $(e.target).text();
    $stories
      .children('li')
      .filter(function(i, el) {
        return (
          $(el)
            .children('small')
            .text() !== currentHostname
        );
      })
      .hide();

    $stories.addClass('hide-numbers');
    $clearFilter.show();
    $favorites.text('all');
  });

  // on clicking the star, add item to favorites and switch the icon
  // NEEDS: ADD SERVER INTERACTION (ADD TO USER FAVORITES/REMOVE FROM USER FAVORITES)
  // find the story's id from the id attribute on the dom element
  // Adds the story id to a favorite object or array stored in local storage
  //
  // UNDER THE StoryList.getStories function below:
  // Call the user.favorite array and
  // check the user's favorite array for any story on the page,
  // if the story ids match, then change the star to be filled in.
  // Note: to save on time efficiency, convert the favorites array to an object with keys being the story ids, then search by key
  // In this case, value doesnt matter, the key needs to simply exist.
  $stories.on('click', '.far, .fas', function(e) {
    $(e.target).toggleClass('far fas');
  });

  // on clicking the favorite button, hide all non favorites and show all favorites
  // also, transform favorite button into "all". Future clicks will show all items and turn "all" into favorites again.
  $favorites.on('click', function(e) {
    if ($favorites.text() === 'favorites') {
      $stories
        .children('li')
        .filter(function(i, el) {
          return $(el)
            .children('.fa-star')
            .hasClass('far');
        })
        .hide();
      $stories.addClass('hide-numbers');
      $favorites.text('all');
    } else {
      $stories.children('li').show();
      $stories.removeClass('hide-numbers');
      $favorites.text('favorites');
    }
  });

  function appendNewStory(title, url, author = '', username = '', id = '') {
    let $newLink = $('<a>', {
      text: ` ${title}`,
      href: url,
      target: '_blank'
    });

    // get short hostname: http://foo.bar.baz.com/page.html -> baz.com
    let hostname = $newLink
      .prop('hostname')
      .split('.')
      .slice(-2)
      .join('.');
    let $small = $('<small>', {
      text: `(${hostname})`
    });

    let $star = $('<span>', {
      class: 'far fa-star'
    });
    let $trash = $('<span>', {
      class: 'far fa-trash-alt'
    });

    let $newStory = $('<li>')
      .append($star, $newLink, $small, $trash)
      .attr('data-username', `${username}`)
      .attr('id', `${id}`);

    $stories.append($newStory);
  }

  // On loading the window, call the getStoryList method and append the results to the DOM.
  let storyList;
  StoryList.getStories(response => {
    storyList = response;
    for (let i = 0; i < 25; i++) {
      let currentStory = storyList.stories[i];
      //Append the first 10 elements of the storylist to the dom
      appendNewStory(
        currentStory.title,
        currentStory.url,
        currentStory.author,
        currentStory.username,
        currentStory.storyId
      );
    }
  });

  if (localStorage.getItem('tokenJWT')) {
    let username = localStorage.getItem('usernameJWT');
    let token = localStorage.getItem('tokenJWT');
    localUser = new User(username, '', '', token);
    toggleLoginElements();
  }

  function toggleLoginElements() {
    $loginButton.toggleClass('hidden');
    $profile.toggleClass('hidden');
    $logout.toggleClass('hidden');
  }
});
