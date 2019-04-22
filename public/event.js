/*global chrome*/
chrome.runtime.onMessage.addListener (
  function (request, sender, sendResponse) {
      if (request.command === "getLocation") {

          navigator.geolocation.getCurrentPosition (function (position) {
              sendResponse ( {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              } );
          } );
          return true; // Needed because the response is asynchronous
      }
  }
);