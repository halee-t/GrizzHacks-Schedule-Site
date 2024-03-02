var app = angular.module("grizzHacksSchedule", []);
var testTime = new Date("March 02, 2024 15:00:00 GMT-0500"); //for testing purposes

app.filter("pad", function () {
  return function (input) {
    return input < 10 ? "0" + input : "" + input;
  };
});

app.controller("ScheduleCtrl", function ($scope, $http, $interval, $filter) {
  $scope.events = [];
  $scope.hour = 0;
  $scope.min = 0;
  $scope.sec = 0;

  //COUNT DOWN CODE
  var targetDate = new Date("March 10, 2024 12:30:00 GMT-0400"); // Adjust for your timezone

  function calculateCountdown() {
    var now = new Date();
    var timeDiff = targetDate - now;

    if (timeDiff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    var hours = Math.floor(timeDiff / (1000 * 60 * 60));
    var minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    $scope.hour = hours;
    $scope.min = minutes;
    $scope.sec = seconds;
  }

  function loadSchedule() {
    $http
      .get("./schedule/grizzhacks6_schedule.json")
      .then(function (response) {
        $scope.events = response.data;
        updateCurrentEvents();
        console.log($scope.events);
      })
      .catch(function (error) {
        console.error("Error fetching schedule:", error);
      });
  }

  function updateCurrentEvents() {
    // var currentTime = new Date();
    var currentTime = testTime; //for testing purposes

    // $scope.previousEvent = angular.copy($scope.currentEvent);
    $scope.currentEvent = findCurrentEvent(currentTime);

    // Check if currentEvent has changed, and update previouslyEvent accordingly
    // if (!angular.equals($scope.currentEvent, $scope.previousEvent)) {
    //   $scope.previousEvent = angular.copy($scope.currentEvent);
    // }
    $scope.previousEvent = findPreviousEvent($scope.currentEvent);

    $scope.nextEvent = findNextEvent(currentTime);
  }

  function parseTimeString(dateString, timeString) {
    // Combine the date and time strings
    var dateTimeString = dateString + " " + timeString;
    // Create a new Date object
    var date = new Date(dateTimeString);
    return date;
  }

  function findCurrentEvent(currentTime) {
    for (var day in $scope.events) {
      for (var i = 0; i < $scope.events[day].length; i++) {
        var event = $scope.events[day][i];
        var startTime = parseTimeString(day, event.startTime);
        var endTime = parseTimeString(day, event.endTime);

        if (
          startTime &&
          endTime &&
          currentTime >= startTime &&
          currentTime < endTime
        ) {
          event.formattedStartTime = $filter("date")(startTime, "shortTime");
          event.formattedEndTime = $filter("date")(endTime, "shortTime");
          return event;
        }
      }
    }

    //if you didn't find an event, return null
    return null;
  }

  function findPreviousEvent(currentEvent) {
    var previousId;
    var previousDay;
    for (var day in $scope.events) {
      for (var i = 0; i < $scope.events[day].length; i++) {
        if (currentEvent.name == $scope.events[day][i].name) {
          previousId = i - 1;
          previousDay = day;
        }
      }
    }

    // Change the line below
    return $scope.events[previousDay][previousId];
  }

  function findNextEvent(currentTime) {
    for (var day in $scope.events) {
      for (var i = 0; i < $scope.events[day].length; i++) {
        var event = $scope.events[day][i];
        var startTime = parseTimeString(day, event.startTime);
        var endTime = parseTimeString(day, event.endTime);

        if (startTime && currentTime < startTime) {
          event.formattedStartTime = $filter("date")(startTime, "shortTime");
          event.formattedEndTime = $filter("date")(endTime, "shortTime");
          return event;
        }
      }
    }

    return null;
  }

  function changeFontSize() {
    var textElement = document.getElementById("happening-now-description");
    var textLength = textElement.innerHTML.length;

    if (textLength > 40) {
      // You can set your threshold here
      textElement.style.fontSize = "24px"; // Set the desired font size
    } else {
      textElement.style.fontSize = "32px"; // Default font size
    }
  }

  $scope.currentEvent = {};
  $scope.nextEvent = {};

  // Initial call to loadSchedule
  calculateCountdown();
  loadSchedule();

  $interval(calculateCountdown, 1000);
  $interval(changeFontSize, 1000);

  $interval(loadSchedule, 1000);
});
