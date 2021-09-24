var data;

function getProjectData(){
    return $.getJSON('projects.json', function(jsonData, status, xhr){
        data = jsonData;
        data.projects.sort((a, b) => (a.index < b.index) ? 1 : -1)
    });
}


function renderProject(projectIndex){
    document.getElementById('project').style.display = "block";
    document.getElementById('cards').style.display = "none";

    var projectData = data.projects[projectIndex];

    fetch('project.mustache')
    .then((response) => response.text())
    .then((template) => {
        var rendered = Mustache.render(template, projectData);
        document.getElementById('project').innerHTML = rendered;    
    });

}

function renderCards(){
    document.getElementById('cards').style.display = "flex";
    document.getElementById('project').style.display = "none";

    fetch('cards.mustache')
    .then((response) => response.text())
    .then((template) => {
        var rendered = Mustache.render(template, data);
        document.getElementById('cards').innerHTML = rendered;    
    });
}

window.fadeIn = function(obj) {
    console.log("fading in " + obj)
    obj.style.opacity = "1";
}

// On Page Load
$(function() {
    getProjectData().then(() => {
        renderCards();
        //renderProject(1);
    });
});