var app = angular.module("grizzHacksSchedule", []);

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
    var currentTime = new Date();

    $scope.previousEvent = angular.copy($scope.currentEvent);
    $scope.currentEvent = findCurrentEvent(currentTime);

    // Check if currentEvent has changed, and update previouslyEvent accordingly
    if (!angular.equals($scope.currentEvent, $scope.previouslyEvent)) {
      $scope.previouslyEvent = angular.copy($scope.previouslyEvent);
    }

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

  $scope.currentEvent = {};
  $scope.nextEvent = {};

  // Initial call to loadSchedule
  calculateCountdown();
  loadSchedule();

  $interval(calculateCountdown, 1000);

  $interval(loadSchedule, 60 * 1000);
});
