$('body').on('pagecontainershow', function() {
  $('#galleryList').infinitescroll({
      // required options
      navElement: '#nextPage',
      itemsToLoad: '.selfie'
  }, function(){
      // optional callback function
      $('#galleryList').listview('refresh');
  });
});
