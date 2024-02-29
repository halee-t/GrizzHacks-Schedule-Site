var app = angular.module("grizzHacksSchedule", []);

app.controller("ScheduleCtrl", function ($scope, $http, $interval) {
  $scope.events = [];
  //Fetch schedule data from grizzhacks6_schedule.json

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

  function showTime() {
    // Getting current time and date
    var time = new Date();
    var hour = time.getHours();
    var min = time.getMinutes();
    var sec = time.getSeconds();
    var am_pm = "AM";

    // Setting time for 12 Hrs format
    if (hour >= 12) {
      if (hour > 12) hour -= 12;
      am_pm = "PM";
    } else if (hour == 0) {
      hour = 12;
      am_pm = "AM";
    }

    hour = hour < 10 ? "0" + hour : hour;
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;

    // Update the scope variables to be used in the view
    $scope.hour = hour;
    $scope.min = min;
    $scope.sec = sec;
  }

  function updateCurrentEvents() {
    var currentTime = new Date();

    $scope.currentEvent = findCurrentEvent(currentTime);
    $scope.nextEvent = findNextEvent(currentTime);
  }

  function findCurrentEvent(currentTime) {
    for (var day in $scope.events) {
      for (var i = 0; i < $scope.events[day].length; i++) {
        var event = $scope.events[day][i];
        var eventTime = parseEventTime(event.time, day);

        if (currentTime >= eventTime.start && currentTime < eventTime.end) {
          return event;
        }
      }
    }

    return "I'm here too";
  }

  function findNextEvent(currentTime) {
    for (var day in $scope.events) {
      for (var i = 0; i < $scope.events[day].length; i++) {
        var event = $scope.events[day][i];
        var eventTime = parseEventTime(event.time, day);

        if (currentTime < eventTime.start) {
          return event;
        }
      }
    }

    return "I'm here";
  }

  function parseEventTime(eventTime, day) {
    var times = eventTime.split(" - ");
    var startDate = new Date(day + " " + times[0]);
    var endDate = new Date(day + " " + times[1]);

    return { start: startDate, end: endDate };
  }

  $scope.currentEvent = {};
  $scope.nextEvent = {};

  // Initial call to loadSchedule
  loadSchedule();
  showTime();

  // Refresh every second
  $interval(showTime, 1000);

  $interval(loadSchedule, 60 * 1000);
  $interval(updateCurrentEvents, 1000);
});
