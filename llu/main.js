var images = ["bg.png", "bg.png", "bg.png"];

var startingY = -1;
var lastY = -1;
var percentToSwipe = 15;
var pageHeight;

var currentPage = 0;

// On Page Load
$(function() {
    for (var i = 0; i < images.length; i++){
        var img = $('<img class = "image" id="image' + i + '" draggable="true">');
        img.attr('src', "../llu/images/" + images[i]);
        img.appendTo('#container');
    }
    pageHeight = $('#image0')[0].height;

    document.addEventListener("drag", drag);
    document.addEventListener("dragend", dragEnd);
    // magic function that makes dragend snappy
    document.addEventListener("dragover", function( event ) {
        event.preventDefault();
    }, false);

});

function goToCurrentPage(){
    var marginTop = parseInt($('#container')[0].style.marginTop.slice(0, -2));
    var targetMarginTop = currentPage * pageHeight * -1;
    var diff = targetMarginTop - marginTop;
    console.log(currentPage, targetMarginTop, marginTop, diff)
    $('#container').animate({
        marginTop: '+=' + diff + 'px'
    }, 400);
}

// Drag handling
function drag(ev) {
    if (lastY == -1){
        lastY = ev.pageY;
        startingY = ev.pageY;
        return;
    }
    else if (ev.pageY == 0){
        return;
    }

    var marginTop = parseInt($('#container')[0].style.marginTop.slice(0, -2));

    if (isNaN(marginTop)){
        marginTop = 0;
    }

    marginTop += ev.pageY - lastY;

    $('#container')[0].style.marginTop =  marginTop + "px";
    lastY = ev.pageY;
}

function dragEnd(ev) {
    var difference = startingY - ev.pageY;
    var percentScrolled = 100 * (difference / screen.height);
    console.log("percent scrolled: " + percentScrolled);
    if (percentScrolled > percentToSwipe && currentPage + 1 < images.length){
        currentPage++;
    }
    else if (percentScrolled < -percentToSwipe && currentPage != 0){
        currentPage--;
    }

    lastY = -1;
    startingY = -1;

    goToCurrentPage();
}