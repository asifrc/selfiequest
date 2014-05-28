
var selectUser = function() {
  $('#tagged').val($(this).attr('data-value'));
  $('#userList li a, .ui-input-search').not($(this)).hide();
  $(this).buttonMarkup({ icon: 'delete', iconpos: 'right'});

  $('#userList li a').off('click');
  $(this).click(unselectUser);
};

var unselectUser = function() {
  $(this).buttonMarkup({ icon: false});
  $('#userList li a, .ui-input-search').not($(this)).show();
  $('#tagged').val("");

  $(this).off('click');
  $('#userList li a').click(selectUser);
};

$('#userList li a').click(selectUser);
