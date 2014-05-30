
var selectUser = function() {
  $('#tagged').val($(this).attr('data-value'));
  $('#userList li a, .ui-input-search').not($(this)).hide();
  $(this).buttonMarkup({ icon: 'delete', iconpos: 'right'});

  $('#userList li a').off('click');
  $(this).on('click', unselectUser);
};

var unselectUser = function() {
  $(this).buttonMarkup({ icon: false});
  $('#userList li a, .ui-input-search').not($(this)).show();
  $('#tagged').val("");

  $(this).off('click');
  $('#userList li a').on('click', selectUser);
};

// $('#userList').delegate('li a', 'click', selectUser);

$('#saveButton').click(function() {
  if ($('#tagged').val() !== "") {
    $('#tagForm').submit();
  }
  else {
    $('#popup').popup('open');
  }
});

var users = [];
var d;

$.getJSON('/users', function(response) {
  if (response.error) {
    alert("ERRORR!");
    return;
  }
  users = response.data;
});


var usersHtml = function() {
  return users.map(function(user) {
    return '<li data-icon="false"><a href="#" data-value="'+user._id+'">'+user.name+'</a></li>'
  });
};

$('#userList').on('filterablebeforefilter', function(e, data) {
  $(this).html(usersHtml());
  $('#userList li a').on('click', selectUser);
});
