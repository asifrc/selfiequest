var dataID = null;

$('.deleteButton').on('click', function() {
  dataID = $(this).attr('data-value');
  $('#confirmPopup').popup('open');
});

$('#deleteConfirm').on('click', function() {
  $.post('/deleteSelfie', { id: dataID },  function(response) {
    $('div[data-value="' + dataID +'"]').fadeOut(function() { $(this).remove(); });
    $('#confirmPopup').popup('close');
  });
});