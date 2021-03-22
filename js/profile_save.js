
function processSection(id){
    if(id==1){
        saveBiddingType(id)
    }else if(id==3){
        saveCustomerDetails(id)
    }else if(id==4){
        saveCustomerAddress(id)
    }else if(id==5){
        //saveCustomerAddress(id)
    }else if(id==6){
        saveCustomerVerification(id)
    }
  }


  function saveCustomerAddress(id){
    var address = {
        premises: $('#txtpremN').val()
        , door: $('#txtdoorN').val()
        , street: $('#txtstreetN').val()
        , town: $('#txttownN').val()
        , district: $('#txtdistrictN').val()
        , county: $('#txtcountyN').val()
        , country: $('#txtcountryN').val()
        , postcode: $('#txtpostcodeN').val()
    }
    $.post('/profile/updatecustomeraddress',{address},function(data){
        moveNext()
    },'json')
  }


  function saveBiddingType(id){
    var biddingType = $('#optbiddingtype').val()
    if(!biddingType){
      $('#error-'+id).html('You are required to select One')
    }else{
      $('#error-'+id).html('')
      $.post('/profile/updateCompany',{biddingType},function(){
        moveNext()
      },'json')
    }
  }

  function saveCustomerDetails(id){
    
    var errors = 0
    var issues = []
    $('#error-'+id).html('')
    var title = $('#opttitle').val();
    
    var forename = $('#txtforename').val()
    var lastname = $('#txtsurname').val()
    var middlename = $('#txtmiddlename').val()
    var telephone = $('#txttelephone').val()
    var mobile = $('#txtmobile').val()
    if(!title){
      errors++;
      issues.push('<div>Title is not defined</div>')
    }
    if(forename.length<2){
      errors++;
      issues.push('<div>Issue with your First Name</div>')
    }
    if(lastname.length<2){
      errors++;
      issues.push('<div>Issue with your Last Name</div>')
    }
    if(errors){
        issues.forEach(function(ms){
            $('#error-'+id).append(ms)
        })
     
    }else{
      $.post('/profile/updatecustomer',{title,forename,lastname,middlename,telephone,mobile},function(data){
        moveNext()
      },'json')
    }
  }
  
  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  function saveCustomerVerification(id){
    $('#error-'+id).html('')
    var errors = 0
    var issues = [];
    var dob = $('#txtdob').val()
    var year = $('#dobyear').val()
    var monthi =  parseInt($('#dobmonth').val())
    var dayi = parseInt($('#dobday').val())
    var day = dayi> 9 ? "" + dayi: "0" + dayi;
    var month = monthi> 9 ? "" + monthi: "0" + monthi;
    var tmpdate = year+'-'+month+'-'+day
    var mydate = new Date(tmpdate)
    if(!isValidDate(mydate)){
        errors++;
        issues.push('<div>Date of Birth is Invalid</div>')
    }
    
    var nino = $('#txtnino').val()
    var driving = $('#txtdrivinglicense').val()
    var passport = $('#txtpassportno').val()
    if(errors){
       
        issues.forEach(function(ms){
            $('#error-'+id).append(ms)
        })
     
      }else{
        $.post('/profile/updateverificationcustomer',{dob:tmpdate,nino,driving,passport},function(data){
        moveNext()
        },'json')
    }
  }


$(function(){
$('#btnSaveAndAdd').click(function(){ 
  console.log('dadsfa')
  $('#error-'+5).html('')
  var errors =0;
  var issues = [];
  var address = {
  premises: $('#txtpremP').val()
  , door: $('#txtdoorP').val()
  , street: $('#txtstreetP').val()
  , town: $('#txttownP').val()
  , district: $('#txtdistrictP').val()
  , county: $('#txtcountyP').val()
  , country: $('#txtcountryP').val()
  , postcode: $('#txtpostcodeP').val()
  }
  var startYear = $('#txtStartYear').val()
  var startMonth = $('#txtStartMonth').val()
  if(!startMonth){
    errors++;
    issues.push('The Start Month is missing')

  }
  if(!startYear){
    errors++;
    issues.push('The Start Year is missing')
    
  }
  if(errors){
    issues.forEach(function(ms){
        $('#error-'+5).append('<div>'+ms+'</div>')
    })
 
  }else{
  $.post('/profile/addHistoryAddr',{address,startYear,startMonth},function(data){
    loadOldAddresses(data.addrs)    
  },'json')
}
})
})

function loadOldAddresses(addrs){

  $('#txtpremP').val('')
  $('#txtdoorP').val('')
  $('#txtstreetP').val('')
  $('#txttownP').val('')
  $('#txtdistrictP').val('')
  $('#txtcountyP').val('')
  $('#txtcountryP').val('')
  $('#txtpostcodeP').val('')
  $('#txtStartYear').val('')
  $('#txtStartMonth').val('')
  $('#postcodesearch_statusP').html('')
  $('#postcodesearchboxP').val('')
  var monthNames = [{id:1,name:'January'},{id:2,name:'Febuary'},{id:3,name:'March'},{id:4,name:'April'},{id:5,name:'May'},{id:6,name:'June'},{id:7,name:'July'},{id:8,name:'August'},{id:9,name:'September'},{id:10,name:'October'},{id:11,name:'November'},{id:12,name:'December'}];
   
  var strs = ''
  addrs.forEach(a=>{
    var tmp = a.premises ? a.premises +', '+ a.door : a.door
    var addrlbl = tmp+' '+ a.street;
    var theMonthName = ''
    monthNames.forEach(x=>{
      if(a.start_month == x.id){
        theMonthName = x.name;
      }
})

strs += "<div class='addrPick' id='addrid-"+a.id+"'><div class='addrboxlbl'>"+theMonthName +" "+a.start_year+"</div><div class='addrcontent'>"+addrlbl+"</div></div>";

  })
  $('#addrHistoryLoaded').html(strs)
  $('#specialfunctionaddrhistory').html('')
  $('.addrPick').click(function(){
  var tmpaddrid = this.id.split('-')[1];
  console.log(tmpaddrid)
  runAddPick(tmpaddrid)
})
}



function runAddPick(addrid){
  addrs.forEach(a=>{
    if(a.id==addrid){
      $('#txtpremP').val(a.premises)
      $('#txtdoorP').val(a.door)
      $('#txtstreetP').val(a.street)
      $('#txttownP').val(a.town)
      $('#txtdistrictP').val(a.district)
      $('#txtcountyP').val(a.county)
      $('#txtcountryP').val(a.country)
      $('#txtpostcodeP').val(a.postcode)
      $('#txtStartYear').val(a.start_year)
      $('#txtStartMonth').val(a.start_month)
      $('#specialfunctionaddrhistory').html('<button class="sitebtn-small" onclick="deleteAddr('+a.id+')" >Delete</button>')
    }
  })
}