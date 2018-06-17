settingsVisible = true;
$('#navbtnSettings').on("click",toggleSettings);

function toggleSettings(){
    if (settingsVisible) {
        $("#content").animate({left: 0});
        settingsVisible=false;
    }
    else {
        $("#content").animate({left: 300});
        settingsVisible=true;
    }
    setTimeout(function(){ mymap.invalidateSize()}, 500);}

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        var panel = this.nextElementSibling;
        if (panel.style.display === "block" || panel.style.display === "") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}

$('#projnameinputline').hide();