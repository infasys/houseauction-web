var spinner ='<div class="sk-chase"><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div></div>';

var mysectionid = 1;

$('#btnNext').click(function(){
    processSection(mysectionid)
})

function moveNext(){
    for(var i = 0;i<list.length;i++){
      if(i>mysectionid){
        var idName = getCurrentStep(i+1);
        idName = idName.replace(/\s+/g, '-').toLowerCase();
        $('#'+idName).removeClass('visited').removeClass('current')
      }
    }
    var currentStatus = document.getElementById('current-status')
    currentStatus.style.transition = 'width 1000ms linear';
    $('#section-'+mysectionid).hide()
    mysectionid++;
    if(mysectionid==2){
      if(isCompany){
  
      }else{
        mysectionid++;
      }
    }
    $('#section-'+mysectionid).show()
    var idName = getCurrentStep(mysectionid);
    idName = idName.replace(/\s+/g, '-').toLowerCase();
    var percentage = ((mysectionid-1)*100)/(list.length-1);
    console.log(percentage)
    $('.current-status').width(percentage+'%')
    var renderingWaitDelay = 1000;
    setTimeout(function() {
      $('.section').removeClass('current')
    $('#'+idName).addClass('visited').addClass('current')
        }, renderingWaitDelay);
  }