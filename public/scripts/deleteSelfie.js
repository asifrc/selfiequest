$('.deleteButton').on('click', function(){
  var data = { id: $(this).attr('data-value') };
  $.post('/admin/delete', data,  function(response) {
    console.log(response);
  });
});
