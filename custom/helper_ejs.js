var dateFormat = require('dateformat');

class helper{


  formatDateOnlyFull(date){
    var d = new Date(date)
    var options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    var dateString = d.toLocaleDateString("en-GB", options)
    dateString = dateFormat(d, "DDDD, dS mmmm yyyy");
    return dateString;
  }
  formatDateOnlyFullSpecial(date){
    var d = new Date(date)
    var options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    var dateString = d.toLocaleDateString("en-GB", options)
    dateString = dateFormat(d, "DDD, dS mmm");
    return dateString;
  }
  formateDateTimeFull(date){
    var d = new Date(date)
    var options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    var dateString = d.toLocaleDateString("en-GB", options)
    dateString = dateFormat(d, "DDDD, dS mmmm yyyy") + " " +this.formatTimeOnly(d)
    return dateString;
  }


   incrementDate(dateInput,increment) {
          var dateFormatTotime = new Date(dateInput);
          var increasedDate = new Date(dateFormatTotime.getTime() +(increment *86400000));
          return increasedDate;
      }

 formatDate(date) {
    var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
    }

     formatDateOnly(date) {
      var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
      }
       formatTimeOnly(date) {
        var d = new Date(date)
      var hours = d.getHours();
      var minutes = d.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }

  printHeader (name,recordtype,notes,editlink,icon){
    var link = editlink? `<div style="float:right;"><a href="${editlink}"><button class="forminput small success">edit</button></a></div>`:''
    var record = recordtype? recordtype:'Record'
    var ico = icon? icon : "data:image/png;base64,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"
    var notes = notes ? notes : '';

    return `
    <div class="titlebar">
    <div class="titleupper">
        <div style="float:left;"><img src="${ico}"></div>

     <div style="float:left;">
        <div class="recordtype">${record}</div>
        <div class="recordname">${name}</div>
    </div>
        ${link}
        <div style="clear:both;"></div>
    </div>
    <div class="titlelower">
        ${notes}
    </div>
</div>
    `}
     formatToCurrency = function numberWithCommas(x) {
      return "£" +x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

}

module.exports = new helper();
