$('*').delegate("*", "pagecontainershow", function (event, data) {
  var direction = data.state.direction;
  if (direction == 'back') {
   	window.location.replace("localhost:3000/");
  }
});

$(document).on("pagecontainerhide", function (e, ui) {
    alert("Next Page: " + ui.nextPage[0]);
});