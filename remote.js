var current_url = window.location.href

var now = new Date();
var h = 9;
var m = 0;
var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0) - now;
if (millisTill10 < 0) {
     millisTill10 += 86400000;
}

var testCount = 1
var waitCount = 0
var userList = []

function getAppDate(){
    let aDate = JS.getDate()
    $('#appdate').val(aDate)
    return aDate
    //return "10-01-2023"
}

function getAppTime(){
    let aTime = JS.getTime()
    $('#captcha').val(aTime)
    return aTime
}

function getPersonList(){
    let aPerson = JS.getPerson()
    let obj = JSON.parse(aPerson)
    let userName = obj[0].user_name
    let fatherName = obj[0].father_name
    let dob = obj[0].dob
    let sex = obj[0].gender
    let nrcNo = obj[0].nrc_no
    let nrcType = obj[0].option

    let userObj = {  
        user_name: userName,
        father_name: fatherName, 
        dob : dob,
        gender: sex,
        nrc_no: nrcNo,
        option: nrcType
    }

    let uList = []
    uList.push(userObj)
    userList = uList
    $('#captcha').val(userList[0].user_name)
    return userList;
}

function getTime(startUp = "NO"){

    var obj = {
        "appdate" : getAppDate(),
        "rand_1": $('#hdn_id').val(),
        "start_day" : "1",
        "end_day" : "89"
    };
    
    $.ajax({	            
        type: "POST",
        url: "https://www.passport.gov.mm/user/get-time",
        data: obj,
        
        success: function (data) {       
            console.log(data)     	
            if(data == "wait" || data == "Wait"){
                waitCount++;
                console.log(data + " - " + waitCount)     	

                if(waitCount > 40){
                    window.location.href =  'https://www.passport.gov.mm/user/booking';
                }else{
                    getTime(startUp)
                }  	
            }else{
                waitCount = 0;
                if(data.message.random)
                {	
                    $('#hdn_id').val(data.message.random);
                    console.log("%cPass Time: %c"+data.message.random, "color:green", "color:blue")
                    if(startUp == "NO"){
                        //goToNext()
                        window.location.href =  'http://passport.gov.mm/user/view-booking';
                    }else{
                        console.log("%cStartUp Mode", "color:blue")
                        
                        var count = {test: 1}
                        localStorage.setItem("test_count", JSON.stringify(count))

                        localStorage.removeItem('openOnePage')
                        localStorage.removeItem('_grecaptcha')
                    }
                }
                else{
                    window.location.href =  'https://www.passport.gov.mm/user/booking'; 
                }
            }
        }
    })
    .fail(function(xhr, t, err) {
        console.log("%cGet Time Connection Error", "color:red")
        getTime(startUp);
    })
}

function getCfg(startUp = "NO"){
    $.ajax({
        type: "POST",
        data: {
            rand_1: $('#hdn_id').val()
        },
        url: "https://www.passport.gov.mm/user/get-config/",
        success: function (data) {
            console.log(data);
            if(data == "wait" || data == "Wait"){
                waitCount++;
                console.log(data + " - " + waitCount)
                if(waitCount > 40){
                    window.location.href =  'https://www.passport.gov.mm/user/booking';
                }else{
                    getCfg(startUp)
                }  	
            }else{
                waitCount = 0;
                if(data.message.random)
                {	
                    $('#hdn_id').val(data.message.random);
                    console.log("%cPass Date: %c"+data.message.random, "color:green", "color:blue")
                    getTime(startUp)
                }
                else{
                    window.location.href =  'https://www.passport.gov.mm/user/booking'; 
                }
            }
        }
    })
    .fail(function(xhr, t, err) {
        console.log("%cGet Config Connection Error", "color:red")
        getCfg(startUp);
    })
}

function goToNext(){

    var tcount = localStorage.getItem("test_count");
    if(tcount){
        var tcountObj = JSON.parse(tcount);
        testCount = tcountObj.test + 1
        var count = {test: testCount}
        localStorage.setItem("test_count", JSON.stringify(count))
        console.log("Test Count - ", testCount)
    }else{
        var count = {test: 1}
        localStorage.setItem("test_count", JSON.stringify(count))
        console.log("First Time")
    }

    $.ajax({
        type: 'POST',
        url: 'https://www.passport.gov.mm/user/reserve',       
        data: {  
            "appdate": getAppDate(),
            "apptime": getAppTime(),
            "station": '16',
            "no_of_booking": '1',
            "ip_address": "37.19.205.19",
            "captcha": $("img").attr('src').split('=')[1],
            "start_day" : '1',
            "end_day" : '89',
            "rand_1": $('#hdn_id').val(),
            "g_recaptcha_response": $('#g-recaptcha-response').val()
        },
        success: function (data) {
            console.log(data)
            localStorage.setItem("status_code", data)
            if(data != 0 || data != -1 || data != 1 || data != 2 || data != 3 || data != 4 || data != 5 || data != 6 || data != 'wait'){
                
                if(data.includes("Error") || data.includes("error")){
                    console.log("%cReturned Error", "color:red")
                    window.location.href = 'https://www.passport.gov.mm/user/booking';
                }

                window.location.href = 'https://www.passport.gov.mm/user/booking_info';
            }
        },
        error: function(error){
            console.log(error)
        }
    }).fail(function(xhr, t, err) {
        console.log("%cNext Connection Error", "color:red")
        goToNext();
    })
}

var tcountstr = localStorage.getItem("test_count");
if(tcountstr){
    var tcountObj = JSON.parse(tcountstr);
    testCount = tcountObj.test
}


/******* Wait & Go ********/
$(document).ready(function(){
    if(current_url == "https://www.passport.gov.mm/user/booking"){
        var data = document.documentElement.innerHTML
        var start = data.indexOf("grecaptcha.execute('")
        var end = data.indexOf("', {action: 'submit'}")
        var gKey = data.substring(start + 20, end)
        console.log(gKey)
    
        grecaptcha.execute(gKey, {action: 'submit'}).then(function (token) {
            $('#g-recaptcha-response').val(token);
            console.log(token)
            prepareToGo(token)
        })
    }
    else if(current_url == "https://www.passport.gov.mm/user/booking_info"){
        console.log("Open Form")
        var data = document.documentElement.innerHTML
        if(data.includes("<body>Wait")){
            window.location.href =  'https://www.passport.gov.mm/user/booking';
        }else{
            playNoti()
        }
    }else{
        console.log("Play Noti")
    }
})


function prepareToGo(gToken){
    var current_time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    console.log(current_time)

    var isTime = Date.parse(`01/01/2022 ${current_time}`) > Date.parse(`01/01/2022 ${h}:${m}:00`)
    console.log(isTime)
    
    if(gToken != ""){
        if(isTime){
            getCfg("NO") // Not Start Up
            //window.location.href =  'http://passport.gov.mm/user/view-booking';
        }else{
            console.log("Waiting for time")
            getCfg("YES"); //Start Up

            setTimeout(function(){
                console.log("It's time.")
                //goToNext()
                window.location.href =  'http://passport.gov.mm/user/view-booking';
            }, millisTill10);
        }    
    }
}

function playNoti(){
    let browserStr = localStorage.getItem("browser");
    let browser_name = JSON.parse(browserStr).name;
    var msg = new SpeechSynthesisUtterance();
    msg.text = browser_name;
    window.speechSynthesis.speak(msg);
}



/** Step 2 **/

var hit = function(action = 0){
    $.ajax({
        type: 'GET',
        url: PATH+"/user/check-valid/",
        success: function(data){
            $('#hdn_id').val(data);
            console.log(data)
            console.log($('#txt_hid').val())
            console.log($('#txt_hkey').val())
            console.log($('#hdn_id').val())
            saveBooking(action)
        },
        error: function (err) {   
            console.log("Check Valid Error")              
        }
    
    }).fail(function(xhr, t, err) {
        console.log("%cCheck Valid Connection Error", "color:red")
        hit()
    });
}

var saveBooking = function(action){
    getPersonList()
    $('#btnSave').attr('disabled', true);

    console.log("Override is working!")
    console.log("Action - ", action)

    var post_obj = {   
        "reserve_id": $('#txt_hid').val(), 
        "station_id": $('#txt_hstation_id').val(), 
        "appdate": $('#txt_hreserve_date').val(), 
        "apptime": $('#txt_hreservetime').val(), 
        "appkey": $('#txt_hkey').val(),             
        "no_of_booking": $('#txt_hcount').val(),
        "userList": userList,
        "is_move" : action,
        "ip_address": "37.19.20.146",
        "rand_1":$('#hdn_id').val()
    };
    
    $.ajax({
        type: 'POST',
        url: PATH+'/user/save-passport-booking',       
        data: post_obj  ,
        success: function (data) { 
            console.log(data)
            if(data == 1) { 
                window.location.href = PATH + '/user/complete_appointment/';
            }
            else if(data == -1) {
                Swal.fire({
                    title: 'Error!',
                    text: 'ရွေးထားသောအချိန်အတွက်  Booking ပြည့်သွားပါပြီ။',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false                       
                }).then((result) => {
                if (result.isConfirmed) 
                    cancelReserve('Invalid Reserve Date');
                });
                $('#btnSave').attr('disabled', false);
            }
            else if(data == -2) {
                $('#btnSave').attr('disabled', false);
                saveBooking(0);
            }
            else {
                const myArray = data.split("/");
                let word = myArray[1];
                if(myArray[0] == 'Empty'){ 
                    console.log("Empty Condition")
                    Swal.fire({
                        title: 'အသိပေးချက်!',
                        html: word,
                        icon: 'warning',
                        confirmButtonText: 'OK'
                        });
                    }
                else if(myArray[0] == 'Over'){
                    Swal.fire({
                        title: 'အသိပေးချက်!',
                        text: 'မူလ Appointment Date နောက်ပိုင်းရက်သို့သာ ရွှေ့နိုင်ပါမည်။',
                        icon: 'warning',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false }) 
                        .then((result) => {
                        if (result.isConfirmed) 
                            cancelReserve("Over move");                       
                    });
                }
                else{
                    //saveBooking(0);
                    console.log("Unknown Condition")
                    Swal.fire({
                        title: 'အသိပေးချက်!',
                        html: word,
                        icon: 'question',
                        confirmButtonText: 'Yes',
                        showDenyButton: true,
                        denyButtonText: 'No'                        
                        }).then((result) => {
                          if (result.isConfirmed) {
                            saveBooking(1);
                            Swal.fire('Saved!', '', 'success')
                          }
                    });
                }
                $('#btnSave').attr('disabled', false);                    
            }
        },
        error: function () {                 
        }
    }).fail(function(xhr, t, err) {
        console.log("%cSave Connection Error", "color:red")
        saveBooking(0);
    });
}
