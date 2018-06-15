settingsVisible = true;
$('#navbtnSettings').on("click",toggleSettings);
$('#closeSettings').on("click",toggleSettings);

function toggleSettings(){
    if (settingsVisible) {
        $("#B").animate({left: 0});
        $('#navbtnSettings').removeClass('active');
        settingsVisible=false;
    }
    else {
        $("#B").animate({left: 200});
        $('#navbtnSettings').addClass('active');
        settingsVisible=true;
    }
}