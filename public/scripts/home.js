$('#photoButton').click(function() {
  $('#photoFile').click();
});

$('#photoFile').change(function(){
  $('#selfieForm').submit();
});
