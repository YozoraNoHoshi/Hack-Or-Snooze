$(function() {
  // DECLARATION OF A LOT OF CONSTANTS, GROUPED BY GENERAL ASSOCIATION
  const $favorites = $('#favorites');
  const $stories = $('#stories');
  const $clearFilter = $('.navbar-right');

  const $submit = $('#submit');
  const $newForm = $('#new-form');
  const $title = $('#title');
  const $url = $('#url');

  const $profile = $('#profile');

  const $deleteMenu = $('#delete-story');
  const $deleteForm = $('#delete-form');
  const $deleteButton = $('#delete-button');
  const $resetDelete = $('#reset-delete');

  const $login = $('#login');
  const $nameField = $('#name-field');
  const $loginForm = $('#login-form');
  const $switchLoginForm = $('#switch-login-form');
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

  // FORM TOGGLES
  // These event listeners control hiding/showing of forms.
  $submit.on('click', function() {
    $newForm.slideToggle();
  });

  $login.on('click', function() {
    $loginForm.slideToggle();
  });

  $deleteMenu.on('click', function(e) {
    e.preventDefault();
    $deleteForm.slideToggle();
  });

  $switchLoginForm.on('click', function(e) {
    e.preventDefault();
    if ($switchLoginForm.text() === 'new user') {
      $switchLoginForm.text('login here');
      $loginButton.text('register');
    } else {
      $switchLoginForm.text('new user');
      $loginButton.text('login');
    }
    $nameField.slideToggle();
  });

  // ICON SWITCHING
  // These event listeners handle switching icons.
  $resetDelete.on('click', function(e) {
    e.preventDefault();
    //.far = unselected, .fas is selected
    $('.fa-trash-alt')
      .addClass('far')
      .removeClass('fas');
  });

  $stories.on('click', '.far, .fas', function(e) {
    $(e.target).toggleClass('far fas');
  });

  // ADDING / DELETING STORIES

  $deleteButton.on('click', function(e) {
    e.preventDefault();
    // NEEDS SERVER INTERACTIONS FOR REMOVING A STORY
    // Call remove story on their id, using their id stored in the attr "id"
    // Removes selected elements from the DOM, then hides the delete form again.
    $stories
      .children('li')
      .filter(function(i, el) {
        return $(el)
          .children('.fa-trash-alt')
          .hasClass('fas');
      })
      .remove();
    $deleteForm.slideToggle();
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

  // LOGIN / LOGOUT FEATURES
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
    localUser = undefined;
  });
  // END LOGIN/LOGOUT FEATURES

  // FILTERING STORIES
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

  $favorites.on('click', function(e) {
    e.preventDefault();
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
  // on clicking the star, add item to favorites and switch the icon
  // NEEDS: ADD SERVER INTERACTION (ADD TO USER FAVORITES/REMOVE FROM USER FAVORITES)
  // find the story's id from the id attribute on the dom element
  // Adds the story id to a favorite object or array stored in local storage

  // UNDER THE StoryList.getStories function below:
  // Call the user.favorite array and
  // check the user's favorite array for any story on the page,
  // if the story ids match, then change the star to be filled in.
  // Note: to save on time efficiency, convert the favorites array to an object with keys being the story ids, then search by key
  // In this case, value doesnt matter, the key needs to simply exist.

  // on clicking the favorite button, hide all non favorites and show all favorites
  // also, transform favorite button into "all". Future clicks will show all items and turn "all" into favorites again.

  // On loading the window, call the getStoryList method and append the results to the DOM.
  let storyList;
  StoryList.getStories(response => {
    storyList = response;
    for (let i = 0; i < 25; i++) {
      let currentStory = storyList.stories[i];
      //Append the first X elements of the storylist to the dom
      appendNewStory(
        currentStory.title,
        currentStory.url,
        currentStory.username,
        currentStory.storyId,
        'hidden'
      );
    }
    // After stories are rendered, checks local storage for a user. If found, "logs in"
    isUserLoggedIn();
  });

  // MISC FUNCTIONS
  function appendNewStory(title, url, username = '', id = '', hidden = '') {
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
      class: `ml-2 far fa-trash-alt ${hidden}`
    });

    let $newStory = $('<li>')
      .append($star, $newLink, $small, $trash)
      .attr('data-username', `${username}`)
      .attr('id', `${id}`);

    $stories.append($newStory);
  }

  function isUserLoggedIn() {
    let username = localStorage.getItem('usernameJWT');
    let token = localStorage.getItem('tokenJWT');
    if (token && username) {
      let tempUser = new User(username, '', '', token);
      tempUser.retrieveDetails(user => {
        localUser = user;
        toggleLoginElements();
      });
    }
  }

  function toggleLoginElements() {
    let username = localStorage.getItem('usernameJWT');
    let token = localStorage.getItem('tokenJWT');
    if (username && token) {
      $loginButton.hide();
      $profile.show();
      $logout.show();
      $deleteMenu.show();
      $submit.show();
      // Iterates stories whose owners match the current user and unhides the trash can icon.
      $stories
        .children('li')
        .filter(function(i, element) {
          return $(element).attr('data-username') === localUser.username;
        })
        .children('.fa-trash-alt')
        .removeClass('hidden');
    } else {
      $loginButton.show();
      $profile.hide();
      $logout.hide();
      $deleteMenu.hide();
      $submit.hide();
      $('.fa-trash-alt').addClass('hidden');
    }
  }
});
