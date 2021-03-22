

var postcodewaiting = false;
var lastpostcodeteststr = '';
function valid_postcode(postcodetxt) {
  postcodetxt = postcodetxt.replace(/\s/g, "");
  var regex = /^(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y]))) {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2}))$/i;
  return regex.test(postcodetxt);
}
function addrSelectionChanged(evt){
  var mypostcodedata = evt.currentTarget.mypostcodedata
  var letter = evt.currentTarget.letter
  mypostcodedata.myaddrs.forEach(function(addr,index){
    if(evt.currentTarget.value==index){
      var searchcriterea = addr.door
      if(addr.premises) searchcriterea= addr.premises
      $.post('/postcodedetailed',{postcode:mypostcodedata.postalcode,door:searchcriterea},function(data){
        console.log(data)
        $('#txtprem'+letter).val(data.addresses[0].sub_building_name)
        $('#txtdoor'+letter).val(data.addresses[0].building_number)
        $('#txtstreet'+letter).val(data.addresses[0].thoroughfare)
        $('#txttown'+letter).val(data.addresses[0].town_or_city)
        $('#txtdistrict'+letter).val(data.addresses[0].district)
        $('#txtcounty'+letter).val(data.addresses[0].county)
        $('#txtcountry'+letter).val(data.addresses[0].country)
        $('#txtpostcode'+letter).val(data.postcode)
      },'json')
    }
  })
}
var postcodeoptsid = 2;
  function handlepostcodereposne(mypostcodedata,letter,mypostcodeerrmsg){
    postcodeoptsid++;
      var statusbox = document.getElementById('postcodesearch_status'+letter);
      if(mypostcodeerrmsg){
          statusbox.innerHTML='<div class="postcodestatusmsg">Something went wrong</div>';
      }else if(mypostcodedata){
          if(mypostcodedata.status){
              statusbox.innerHTML='';
              if(mypostcodedata.myaddrs){
               
                  myopts = '<div class="select"><select id="myaddropts'+postcodeoptsid+'" >';
                  if( mypostcodedata.myaddrs.length==1){
                    myopts += '<option value="-1">Please Select</option>'
                  }
                  mypostcodedata.myaddrs.forEach(function(addr,index){
                      myopts += '<option value="'+index+'">'+addr.newlbl+'</option>'
                  })
                  myopts += '</select></div>'
                  statusbox.innerHTML+=myopts

                  var addressoptionsSelect = document.getElementById('myaddropts'+postcodeoptsid)
                  addressoptionsSelect.mypostcodedata = mypostcodedata;
                  addressoptionsSelect.letter = letter;
                  addressoptionsSelect.removeEventListener("change",addrSelectionChanged)
                  addressoptionsSelect.addEventListener("change",addrSelectionChanged)
                  
              }
          }else{
              statusbox.innerHTML='<div class="postcodestatusmsg">'+mypostcodedata.message+'</div>';
          }
      }
  }
  function postcodesearch(letter){
      var statusbox = document.getElementById('postcodesearch_status'+letter);
      var postcodeval = document.getElementById('postcodesearchbox'+letter).value;
      postcodetxt = postcodeval.replace(/\s/g, "");
      var status = valid_postcode(postcodetxt);
      if(valid_postcode(postcodetxt)){
          if(!postcodewaiting){
              postcodewaiting = true;
              if(lastpostcodeteststr!=postcodetxt){
                  statusbox.innerHTML=spinner+'<div class="postcodestatusmsggreen">'+postcodetxt+':SEARCHING</div>';
                  lastpostcodeteststr = postcodetxt
                  var finished = false;
              var mypostcodeerrmsg = '';
              var mypostcodedata = {}
              var timerdone = false
              setTimeout(function(){
                
                  if(finished) { handlepostcodereposne(mypostcodedata,letter,mypostcodeerrmsg); }
                  timerdone=true;
              },300)
              $.post('/postcode',{postcode:postcodetxt},function(data){
                  
                  postcodewaiting = false;
                  finished = true;
                 mypostcodedata=data
                 if(timerdone){handlepostcodereposne(mypostcodedata,letter)}
              },'json').fail(function(error) {finished = true; if(timerdone){ handlepostcodereposne(undefined,letter,'ERROR UNKNOWN')}  });
          }else{
            postcodewaiting = false;
          }
      }
  }else{
      lastpostcodeteststr='';
      statusbox.innerHTML='<div class="postcodestatusmsg">POSTCODE format invalid'+postcodeval+':'+status+'</div>';
  }
}


document.getElementById('postcodesearchboxN').addEventListener("keyup",function(){postcodesearch('N')})
document.getElementById('postcodesearchbtnN').addEventListener("click",function(){postcodesearch('N')})

document.getElementById('postcodesearchboxP').addEventListener("keyup",function(){postcodesearch('P')})
document.getElementById('postcodesearchbtnP').addEventListener("click",function(){postcodesearch('P')})


