var data;
var map;
var artCaptionMap;
var mobile = false;
var cardPositions = [];
var windowWidth;
var isEmphasized = false;
var hasDragged = false;

var cardsPerRow;
var margin_left = 70;
var cardContainerMinWidth = 450;
var cardContainerHeight = 610;

var tags = [];

function getProjectData(){
    return $.getJSON('projects.json', function(jsonData, status, xhr){
        data = jsonData;
        map = new Map();
        artCaptionMap = new Map();
        for (var i = 0; i < data.projects.length; i++){
            map.set(data.projects[i].hash, i);
        }
        data.projects.sort((a, b) => (a.index < b.index) ? 1 : -1);

        for (var i = 0; i < data.art_captions.length; i++){
            artCaptionMap.set(data.art_captions[i].link, data.art_captions[i].title);
        }
        console.log(artCaptionMap);
    });
}


function renderProject(projectIndex){
    $('#project')[0].style.display = "block";
    $('#cards')[0].style.display = "none";

    var projectData;
    if (projectIndex == -1){
        projectData = data.about;
    }
    else{
        projectData = data.projects[data.projects.length - projectIndex - 1];
    }

    fetch('project.mustache')
    .then((response) => response.text())
    .then((template) => {
        var rendered = Mustache.render(template, projectData);
        $('#project')[0].innerHTML = rendered;
        if (projectData.index == 0){
            configureArt();
        }
    });
}

function configureArt(){
    $("#project-image").attr("href", "#art");
    $("#project-image").removeClass("project-image-link");
    $("#project-image").addClass("project-image-link-large");
    $(".image").on('click', function(){
        $("#modal")[0].style.display = "block";
        $("#modal-content")[0].src = this.src;
        $("#modal-caption")[0].innerHTML = artCaptionMap.get(this.src.split("/").at(-1));
    });
    $("#modal").on('click', function(){
        $("#modal")[0].style.display = "none";
    });
}

function renderCards(){
    $('#cards')[0].style.display = "block";
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
        var cardContainerWidth = (windowWidth - margin_left) / cardsPerRow;
        var currX = margin_left;
        var currY = 30;
        for (var i = 0; i < cardContainers.length; i++){
            cardContainer = cardContainers[i];
            if (!mobile){
                cardContainer.style.marginLeft = currX;
                cardPositions[i] = [currX, currY];
            }
            else{
                cardPositions[i] = [margin_left, currY];
            }
            cardContainer.style.marginTop = currY;

            if ((i + 1) % cardsPerRow == 0){
                currX = margin_left;
                currY += cardContainerHeight;
            }
            else{
                currX += cardContainerWidth;
            }
        }

        $("#about").click(function(){
            renderProject(-1);
        })

        setCategories();


        $('.drag-word').each(function() {
            this.addEventListener("dragstart", dragstart_handler);
        });
        $('.drag-word').each(function() {
            this.addEventListener("dragend", dragend_handler);
        });
        $('.drag-word').each(function() {
            this.addEventListener("drop", drop_handler);
        });
        $('.drag-word').each(function()  {
            this.addEventListener("dragenter", dragenter_handler);
        });
        $('.drag-word').each(function()  {
            this.addEventListener("dragleave", dragleave_handler);
        });

        $('#word-first').click(function(){
            toggleFirst();
        })

        $('#word-second').click(function(){
            swapWithFirst(this);
        })

        $('#word-third').click(function(){
            swapWithFirst(this);
        })

        $('.tag').each(function(){
            addTagColor(this);
        });
    });
}

function addTagColor(tag){
    if (tag.innerHTML === " {writing} "){
        tag.style.color = "var(--writing)";
    }
    else if (tag.innerHTML === " {art} "){
        tag.style.color = "var(--art)";
    }
    else if (tag.innerHTML === " {tech} "){
        tag.style.color = "var(--code)";
    }
}

function toggleFirst(){
    if (isEmphasized){
        $("#word-first").css("color", "var(--gray)");
    }
    else{
        getWord($("#word-first")[0].innerHTML, true);
    }
    hasDragged = true;
    isEmphasized = !isEmphasized;
    setTagsBasedOnIntro();
}

function swapWithFirst(other){
    var oldword = other.innerHTML;
    other.innerHTML = getWord($("#word-first")[0].innerHTML, false);
    $("#word-first")[0].innerHTML = getWord(oldword, true);
    setTagsBasedOnIntro();
}

function dragstart_handler(ev) {
    if (!ev.target.classList || !ev.target.classList.contains("drag-word")) { return; }
    hasDragged = true;
    ev.dataTransfer.setData("word", ev.target.innerHTML);
    ev.dataTransfer.setData("id", ev.target.id);
    
    setTimeout(function() {
        ev.target.style.visibility = "hidden";
    }, 1);
}

function dragend_handler(ev) {
    if (!ev.target.classList || !ev.target.classList.contains("drag-word")) { return; }
    setTimeout(function() {
        ev.target.style.visibility = "";
    }, 1);
}

function drop_handler(ev) {
    ev.preventDefault();
    var word = ev.dataTransfer.getData("word");
    var id = ev.dataTransfer.getData("id");
    if (word === "" || id === "") { return; }
    var oldword = ev.target.innerHTML;
    ev.target.innerHTML = getWord(word, ev.target.id == "word-first");
    $("#" + id)[0].innerHTML = getWord(oldword, id == "word-first");
    if (ev.target.id === "word-first" || id === "word-first"){
        isEmphasized = true;
        setTagsBasedOnIntro();
    }
    ev.target.classList.remove("hovered");
    ev.target.style.textDecoration = "";
}

function dragenter_handler(ev) {
    ev.preventDefault()
    var id = ev.dataTransfer.getData("id");
    if (ev.target.className.includes("drag-word")){
        ev.target.classList.add("hovered");
        ev.target.style.textDecoration = "underline";
    }
}

function dragleave_handler(ev){
    ev.target.style.textDecoration = "";
}

function getWord(word, isFirst){
    if (word == "writer" || word == "writes"){
        if (isFirst){
            $("#word-first").css("color", "var(--writing)");
            return "writer";
        }
        return "writes";
    }
    else if (word == "artist" || word == "draws"){
        if (isFirst){
            $("#word-first").css("color", "var(--art)");
            $('#n')[0].style.display = "inline";
            return "artist";
        }
        $('#n')[0].style.display = "none";
        return "draws";
    }
    else if (word == "technologist" || word == "codes"){
        if (isFirst){
            $("#word-first").css("color", "var(--code)");
            return "technologist";
        }
        return "codes";
    }
    console.log("Shouldn't be here!")
    return word;
}

function showTags(){
    console.log(tags);
    if (tags.length == 0) {
        tags = [];
        resetTags();
        return;
    }
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
        $('#' + shownCards[i])[0].style.display = "block";
        $('#' + shownCards[i])[0].style.opacity = "1";
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

function setCategories(){
    $('#all').click(function() {
        if (isEmphasized){ toggleFirst(); }
        resetTags();
        $("#code").removeClass("selected");
        $("#writing").removeClass("selected");
        $("#art").removeClass("selected");
        $('#all').addClass("selected");
        tags = [];
    });
    $('#code').click(selectCode);
    $('#writing').click(selectWriting);
    $('#art').click(selectArt);
}

function selectCode(){
    if (isEmphasized){ toggleFirst(); }
    if (!$("#code").hasClass("selected")){
        $("#code").addClass("selected");
        $('#all').removeClass("selected");
        if (!tags.includes("tech")){
            tags.push("tech");
        }
    }
    else {
        $("#code").removeClass("selected");
    
        var i = tags.indexOf("tech");
        if (i > -1){
            tags.splice(i, 1);
        }
        if (tags.length == 0){
            $('#all').addClass("selected");
        }
    }
    showTags();
}

function selectWriting(){
    if (isEmphasized){ toggleFirst(); }
    if (!$("#writing").hasClass("selected")){
        $("#writing").addClass("selected");
        $('#all').removeClass("selected");
        if (!tags.includes("writing")){
            tags.push("writing");
        }
    }
    else {
        $("#writing").removeClass("selected");
    
        var i = tags.indexOf("writing");
        if (i > -1){
            tags.splice(i, 1);
        }
        if (tags.length == 0){
            $('#all').addClass("selected");
        }
    }
    showTags();
}

function selectArt(){
    if (isEmphasized){ toggleFirst(); }
    if (!$("#art").hasClass("selected")){
        $("#art").addClass("selected");
        $('#all').removeClass("selected");
        if (!tags.includes("art")){
            tags.push("art");
        }
    }
    else {
        $("#art").removeClass("selected");
    
        var i = tags.indexOf("art");
        if (i > -1){
            tags.splice(i, 1);
        }
        if (tags.length == 0){
            $('#all').addClass("selected");
        }
    }
    showTags();
}

function setTagsBasedOnIntro(){
    if (!isEmphasized) { 
        $('#all').addClass("selected");
        if ($("#art").hasClass("selected")){
            $('#art').removeClass("selected");
        }
        if ($("#writing").hasClass("selected")){
            $('#writing').removeClass("selected");
        }
        if ($("#code").hasClass("selected")){
            $('#code').removeClass("selected");
        }    
        tags = [];
    }
    else{
        $('#all').removeClass("selected");
        var firstWord = $('#word-first')[0].innerHTML;
        
        if (firstWord == "artist"){
            $("#art").addClass("selected");
            tags = ["art"];
        }
        else if ($("#art").hasClass("selected")){
            $('#art').removeClass("selected");
        }
    
        if (firstWord == "writer"){
            tags = ["writing"];
            $("#writing").addClass("selected");
        }
        else if ($("#writing").hasClass("selected")){
            $('#writing').removeClass("selected");
        }
    
        if (firstWord == "technologist"){
            tags = ["tech"];
            $("#code").addClass("selected");
        }
        else if ($("#code").hasClass("selected")){
            $('#code').removeClass("selected");
        }    
    }

    
    showTags();
}

window.fadeIn = function(obj) {
    console.log("fading in " + obj)
    obj.style.opacity = "1";
}

window.onhashchange = function() {
    if (window.location.hash === ""){
        renderCards();
    }
}

// On Page Load
$(function() {
    windowWidth = $(window).width();
    if (windowWidth < 631) { configureMobile(); }
    cardsPerRow = Math.floor((windowWidth- margin_left) / cardContainerMinWidth);
    if (cardsPerRow == 0) { cardsPerRow = 1; }
    getProjectData().then(() => {
        console.log(map);
        console.log(map.get(window.location.hash));
        if (window.location.hash && map.get(window.location.hash) != undefined){
            renderProject(map.get(window.location.hash));
        }
        else if (window.location.hash == "#about"){
            renderProject(-1);
        }
        else{
            renderCards();
        }
    });
});

function configureMobile(){
    console.log("Configuring mobile")
    mobile = true;
}