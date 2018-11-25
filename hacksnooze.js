let storyList;
let localUser;

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

  $deleteMenu.on('click', function() {
    $deleteForm.slideToggle();
  });

  $switchLoginForm.on('click', function() {
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
  $resetDelete.on('click', function() {
    //.far = unselected, .fas is selected
    $('.fa-trash-alt')
      .addClass('far')
      .removeClass('fas');
  });

  $stories.on('click', '.far, .fas', function(e) {
    let $e = $(e.target);
    // If it is a star element,
    if ($e.hasClass('fa-star')) {
      // find the story's id from the id attribute on the dom element
      let id = $e.parent().attr('id');

      // If star is not filled in
      if ($e.hasClass('far')) {
        //Ping the server to add a favorite
        localUser.addFavorite(id, function() {
          // Once the server sends a response, switch the icon
          $e.toggleClass('far fas');
        });
      } else {
        //Ping the server to remove a favorite
        localUser.removeFavorite(id, function() {
          // Once the server sends a response, switch the icon
          $e.toggleClass('far fas');
        });
      }
    } else {
      // Toggle trash can icon
      $e.toggleClass('far fas');
    }
  });

  // ADDING / DELETING STORIES
  $deleteButton.on('click', function(e) {
    e.preventDefault();
    // Get a list of all stories with a filled in delete button
    let $elementList = $stories.children('li').filter(function(i, el) {
      return $(el)
        .children('.fa-trash-alt')
        .hasClass('fas');
    });
    // For each element in the list:
    $elementList.each(function(i, ele) {
      // Call remove story on their id, using their id stored in the attr "id"
      let id = $(ele).attr('id');
      storyList.removeStory(localUser, id, function() {
        // Once the server sends a response, remove the element from the DOM.
        $(ele).remove();
      });
    });
    // Hides the delete menu
    $deleteMenu.trigger('click');
  });

  $newForm.on('submit', function(e) {
    e.preventDefault();
    let storyData = {
      title: $title.val(),
      author: localUser.username,
      url: $url.val()
    };
    storyList.addStory(localUser, storyData, function() {
      // Once server responds, add a new story to the DOM.
      appendNewStory($title.val(), $url.val());
      $submit.trigger('click');
      $title.val('');
      $url.val('');
    });
    // Hides the submit menu and empties the fields.
  });

  // LOGIN / LOGOUT FEATURES
  function logIn(newUser) {
    // On server response, set localUser = the response from the server, a user object
    localUser = newUser;
    //Hides the login menu and enables logged in features
    $login.trigger('click');

    toggleLoginElements();
  }

  $loginForm.on('submit', function(e) {
    e.preventDefault();
    let $username = $('#username').val();
    let $name = $('#your-name').val();
    let $password = $('#password').val();

    if ($loginButton.text() === 'register') {
      // Creates a new user
      User.create($username, $password, $name, function(newUser) {
        logIn(newUser);
        $username.val('');
        $name.val('');
        $password.val('');
      });
    } else {
      User.login($username, $password, function(newUser) {
        logIn(newUser);
        $username.val('');
        $password.val('');
      });
    }
  });

  $logout.on('click', function() {
    // Delete local storage items and the localUser variable. Hides logged in features
    localStorage.removeItem('tokenJWT');
    localStorage.removeItem('usernameJWT');
    toggleLoginElements();
    localUser = undefined;
  });

  // FILTERING STORIES
  $stories.on('click', 'small', function(e) {
    // on clicking the small hostname, hide all different hostnames
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

  $favorites.on('click', function() {
    // on clicking the favorite button, hide all non favorites and show all favorites
    // also, transform favorite button into "all". Future clicks will show all items and turn "all" into favorites again.
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

  // UNDER THE StoryList.getStories function below:

  // On loading the window, call the getStoryList method and append the results to the DOM.

  StoryList.getStories(response => {
    storyList = response;
    for (let i = 0; i < 25; i++) {
      let currentStory = storyList.stories[i];
      //Append the first X elements of the storylist to the dom
      appendNewStory(
        currentStory.title,
        currentStory.url,
        currentStory.username,
        currentStory.storyId
      );
    }
    // After stories are rendered, checks local storage for a user. If found, "logs in"
    isUserLoggedIn();
  });

  // MISC FUNCTIONS
  function appendNewStory(title, url, username = '', id = '') {
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
      class: `ml-2 far fa-trash-alt hidden`
    });
    let $author = $('<div>', {
      class: `storyauthor pl-4`,
      text: `by: ${username}`
    });

    let $newStory = $('<li>')
      .append($star, $newLink, $small, $trash, $author)
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
    } else toggleLoginElements();
  }

  function toggleLoginElements() {
    let username = localStorage.getItem('usernameJWT');
    let token = localStorage.getItem('tokenJWT');
    // If User is "logged in"
    if (username && token) {
      showLoggedInFeatures();
      checkFavorites();
    } else {
      // If user is not "logged in"
      hideLoggedInFeatures();
    }
  }

  function showLoggedInFeatures() {
    $login.hide();
    $profile.show();
    $logout.show();
    $deleteMenu.show();
    $submit.show();
    $favorites.show();
    // Unhides the favorite star on all list elements.
    $stories
      .children('li')
      .children('.fa-star')
      .removeClass('houdini');
    // Iterates stories whose owners match the current user and unhides the trash can icon.
    $stories
      .children('li')
      .filter(function(i, element) {
        return $(element).attr('data-username') === localUser.username;
      })
      .children('.fa-trash-alt')
      .removeClass('hidden');
  }

  function hideLoggedInFeatures() {
    $profile.hide();
    $logout.hide();
    $deleteMenu.hide();
    $submit.hide();
    $favorites.hide();
    $login.show();
    // Hide all delete buttons, favorite icons
    $('.fa-trash-alt').addClass('hidden');
    $('.fa-star').addClass('houdini');
    // Removes any filled in favorite stars
    $('.fa-star')
      .addClass('far')
      .removeClass('fas');
  }

  function checkFavorites() {
    // If a story id on the page is in the story id of user's favorites
    let favoriteStoryIds = {};
    for (let favoriteEntry of localUser.favorites) {
      favoriteStoryIds[favoriteEntry.storyId] = 1;
    }
    // Fill the star in
    $stories
      .children('li')
      .filter(function(i, element) {
        return favoriteStoryIds[$(element).attr('id')];
      })
      .children('.fa-star')
      .toggleClass('far fas');
  }
});
