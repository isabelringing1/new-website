var data;
var map;
var cardPositions = [];
var windowWidth;

var cardsPerRow;
var cardContainerMinWidth = 450;
var cardContainerHeight = 585;

function getProjectData(){
    return $.getJSON('projects.json', function(jsonData, status, xhr){
        data = jsonData;
        map = new Map();
        for (var i = 0; i < data.projects.length; i++){
            map.set(data.projects[i].hash, i);
        }
        data.projects.sort((a, b) => (a.index < b.index) ? 1 : -1);
    });
}


function renderProject(projectIndex){
    $('#project')[0].style.display = "block";
    $('#cards')[0].style.display = "none";

    var projectData = data.projects[data.projects.length - projectIndex - 1];

    fetch('project.mustache')
    .then((response) => response.text())
    .then((template) => {
        var rendered = Mustache.render(template, projectData);
        $('#project')[0].innerHTML = rendered;    
    });

}

function renderCards(){
    $('#cards')[0].style.display = "flex";
    $('#project')[0].style.display = "none";

    fetch('cards.mustache')
    .then((response) => response.text())
    .then((template) => {
        var rendered = Mustache.render(template, data);
        $('#cards')[0].innerHTML = rendered;
        $('.card').on('click', (event) => {
            card = event.target;
            while (card.className != "card-container"){
                card = card.parentNode;
            }
            console.log(card);
            renderProject(parseInt(card.id));
        });
        var cardContainers = $('.card-container');
        var cardContainerWidth = windowWidth / cardsPerRow;
        var currX = 30;
        var currY = 30;
        for (var i = 0; i < cardContainers.length; i++){
            cardContainer = cardContainers[i];
            cardContainer.style.marginLeft = currX;
            cardContainer.style.marginTop = currY;
            cardPositions[i] = [currX, currY];
            //console.log("card #" + i + " hashed to pos " + [currX, currY]);

            if ((i + 1) % cardsPerRow == 0){
                currX = 30;
                currY += cardContainerHeight;
            }
            else{
                currX += cardContainerWidth;
            }
        }
    });
}

function showTags(tags){
    var shownCards = [];
    for (var i = 0; i < data.projects.length; i++){
        var proj = data.projects[i];
        var included = false;
        for (var j = 0; j < proj.tags.length && !included; j++){
            for (var k = 0; k < tags.length && !included; k++){
                if (proj.tags[j] === tags[k]){
                    included = true;
                }
            }
        }
        if (!included){
            var el = $('#' + proj.index)[0];
            el.style.opacity = "0";
            setDisplayNoneTimeout(el);
        }
        else{
            shownCards.push(proj.index);
        }
    }

    for (var i = 0; i < shownCards.length; i++){
        $('#' + shownCards[i])[0].style.marginLeft = cardPositions[i][0] + "px";
        $('#' + shownCards[i])[0].style.marginTop = cardPositions[i][1] + "px";
    }
}

function setDisplayNoneTimeout(el){
    setTimeout(function() {
        el.style.display = "none";
    }, 250);
}

function resetTags(){
    var cards = $('.card-container');
    for (var i = 0; i < cards.length; i++){
        cards[i].style.display = "block";
        cards[i].style.opacity = "1";
        cards[i].style.marginLeft = cardPositions[i][0] + "px";
        cards[i].style.marginTop = cardPositions[i][1] + "px";
    }
}

window.fadeIn = function(obj) {
    console.log("fading in " + obj)
    obj.style.opacity = "1";
}

// On Page Load
$(function() {
    windowWidth = $(window).width();
    cardsPerRow = Math.floor(windowWidth / cardContainerMinWidth);
    console.log("cardsPerRow is " + cardsPerRow);
    getProjectData().then(() => {
        console.log(map);
        console.log(map.get(window.location.hash));
        if (window.location.hash && map.get(window.location.hash) != undefined){
            console.log(window.location.hash);
            renderProject(map.get(window.location.hash));
        }
        else{
            renderCards();
        }
    });
});