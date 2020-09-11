var paywall = require("./lib/paywall");
setTimeout(() => paywall(13114900), 5000);

require("component-responsive-frame/child");

// require("./lib/ads");
// require("./lib/social");
var $ = require("./lib/qsa");
var closest = require("./lib/closest");
var dot = require("./lib/dot");

$(".row").forEach(el => el.addEventListener("click", () => el.classList.add("show-predictions")));

var userPredictions = {};

var setQuery = hash => Object.keys(hash).map(k => k + "=" + hash[k]).join("&");

var updateScore = function() {
  var output = 0;
  var wins = 0;
  var lose = 0;
  for (var k in userPredictions) {
    var result;
    var game = k * 1 - 1;
    if (userPredictions[k] == "W") {
      result = 1;
      wins++;
    } else {
      result = 2;
      lose++;
    }
    var binary = result << game * 2;
    output += binary;
  }
  $.one(".record").innerHTML = `${wins} - ${lose}`;
  window.location.hash = setQuery({
    picks: output
  });
};

var onClickIcon = function() {
  var game = this.getAttribute("data-game");
  var prediction = this.getAttribute("data-prediction");
  var src = this.getAttribute("src");
  this.classList.remove("faded");
  var row = closest(this, ".row");
  $(".team.logo", row).filter(el => el != this).pop().classList.add("faded");
  row.classList.add("pick-set");
  var pickImage = $.one(".user-pick", row);
  pickImage.src = src;
  userPredictions[game] = prediction;
  updateScore();
};

var clearGame = function() {
  var game = this.getAttribute("data-game");
  delete userPredictions[game];
  var row = closest(this, ".row");
  row.classList.remove("pick-set");
  var pick = $.one(".user-pick", row);
  pick.removeAttribute("src");
  updateScore();
};

$(".team.logo").forEach(el => el.addEventListener("click", onClickIcon));
$(".clear-pick").forEach(el => el.addEventListener("click", clearGame));

var hash = {};
window.location.hash.replace(/^#/, "").split("&").forEach(function(p) {
  var [key, value] = p.split("=");
  hash[key] = value;
});
if (hash.picks) {
  var binary = (hash.picks * 1).toString(2);
  if (binary.length % 2) binary = "0" + binary;
  for (var i = binary.length - 2; i >= 0; i -= 2) {
    var game = (binary.length - i) >> 1;
    var result = parseInt(binary.slice(i, i + 2), 2);
    if (result) {
      userPredictions[game] = result == 1 ? "W" : "L";
      var row = $.one(`.row[data-game="${game}"]`);
      row.classList.add("show-predictions", "pick-set");
      var original = $.one(`img[data-prediction="${userPredictions[game]}"]`, row);
      $.one(".user-pick", row).src = original.src;
      $.one(`img:not([data-prediction="${userPredictions[game]}"])`, row).classList.add("faded");
    }
  }
  updateScore();
}

$.one(".show-experts").addEventListener("click", () => $.one(".staff.records").classList.add("show"));
