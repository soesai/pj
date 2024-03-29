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
var myDate = ""
var nextCount = 0


function getAppDate(){
    let aDate = JS.getDate()
    $('#appdate').val(aDate)
    myDate = aDate
    return aDate
}

function getAppTime(){
    let aTime = JS.getTime()
    $('#captcha').val(aTime)
    console.log(`${myDate} => ${aTime}`)
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
                    console.log("Pass Time: "+data.message.random)
                    if(startUp == "NO"){
                        goToNext()
                    }else{
                        console.log("၉ နာရီအချိန်ကို စောင့်ဆိုင်းနေသည်")
                        
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
        console.log("Get Time Connection Error")
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
                    console.log("Pass Date: "+data.message.random)
                    getTime(startUp)
                }
                else{
                    window.location.href =  'https://www.passport.gov.mm/user/booking'; 
                }
            }
        }
    })
    .fail(function(xhr, t, err) {
        console.log("Get Config Connection Error")
        getCfg(startUp);
    })
}

function goToNext(){

    console.log("Captcha - ", $("img").attr('src').split('=')[1])

    var data = document.documentElement.innerHTML
    var start = data.indexOf("grecaptcha.execute('")
    var end = data.indexOf("', {action: 'submit'}")
    var gKey = data.substring(start + 20, end)
    //console.log(gKey)

    try {
        
        grecaptcha.execute(gKey, {action: 'submit'}).then(function (token) {
            $('#g-recaptcha-response').val(token);
            //console.log(token)
    
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
                    "g_recaptcha_response": token
                },
                success: function (data) {
                    console.log(data)
                    localStorage.setItem("status_code", data)
        
                    if( data == 3 ){
                        window.location.href = 'https://www.passport.gov.mm/user/booking';
                    }
                    if(data == -1 || data == 0 || data == 1 || data == 2 || data == 4 || data == 5 || data == 6 || data == "wait" || data == "Wait"){
                        console.log("Next Count - ", nextCount)
                        if(nextCount <= 40){
                            goToNext()
                        }else{
                            window.location.href = 'https://www.passport.gov.mm/user/booking';
                        }
                        nextCount++
                        //window.location.href = 'https://www.passport.gov.mm/user/booking';
                    }
                    else{
                        if(data.includes("Error") || data.includes("error")){
                            console.log("Returned Error")
                            goToNext()
                            nextCount++
                            //window.location.href = 'https://www.passport.gov.mm/user/booking';
                        }
                        else{
                            window.location.href = 'https://www.passport.gov.mm/user/booking_info';
                        }
                    }
                    
                },
                error: function(error){
                    console.log(error)
                }
            }).fail(function(xhr, t, err) {
                console.log("%cNext Connection Error", "color:red")
                goToNext();
            })
    
        })

    } catch (error) {
        console.log("G-Recaptcha is null")
        window.location.href = 'https://www.passport.gov.mm/user/booking';
    }
}

/******* Wait & Go ********/

try{
    $(document).ready(function(){
        console.log("JQ Mode")
        console.log("Document is Ready")
        checkPageDecision()
    })
}catch (error) {
    console.log("Pure Js Mode")
    ready(function(){
        console.log("Document is Ready")
        checkPageDecision()
    })
}

function ready(callback) {
    // in case the document is already rendered
    if (document.readyState != 'loading') callback();
    // modern browsers
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
    // IE <= 8
    else document.attachEvent('onreadystatechange', function() {
       if (document.readyState == 'complete') callback();
    });
 }


function checkPageDecision(){
    if(current_url == "https://www.passport.gov.mm/user/booking" || current_url == "https://www.passport.gov.mm/user/booking/"){
        prepareToGo()
    }

    else if(current_url == "https://www.passport.gov.mm/user/booking_info" || current_url == "https://www.passport.gov.mm/user/booking_info/"){
        console.log("Open Form")
        var data = document.documentElement.innerHTML
        if(data.includes("<body>Wait") || data.includes("<body><text>Wait</text>")){
            console.log("Form is Fake")
            window.location.href =  'https://www.passport.gov.mm/user/booking';
        }else{
            console.log("Form is real 50%")
            uploadIfReal()
        }
    }else{
        console.log("Other Page - ", current_url)
        window.location.href = 'https://www.passport.gov.mm/user/booking';
    }
}


function prepareToGo(){
    var current_time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    console.log(current_time)

    var isTime = Date.parse(`01/01/2022 ${current_time}`) > Date.parse(`01/01/2022 ${h}:${m}:00`)
    console.log(isTime)
    
    if(isTime){
        getCfg("NO") // Not Start Up
    }else{
        console.log("Waiting for time")
        getCfg("YES"); //Start Up

        setTimeout(function(){
            console.log("It's time.")
            goToNext()
        }, millisTill10);
    }
}


/** Step 2 **/

function hit(action = 0){
    
    getPersonList()
    //$("#view_captcha").val(userList[0].father_name)

    $.ajax({
        type: 'GET',
        url: "https://www.passport.gov.mm/user/check-valid/",
        success: function(data){
            $('#hdn_id').val(data);
            console.log("KEYS ARE UNDER")
            console.log("---------------")
            console.log($('#txt_hid').val())
            console.log($('#txt_hkey').val())
            console.log($('#hdn_id').val())
            saveBooking(action)
        },
        error: function (err) {   
            console.log("Check Valid Error")              
        }
    
    }).fail(function(xhr, t, err) {
        console.log("Check Valid Connection Error")
        hit()
    });
}

function saveBooking(action){
    $('#btnSave').attr('disabled', true);

    console.log("Action - ", action)
    console.log("Uploading...")

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
        url: 'https://www.passport.gov.mm/user/save-passport-booking',       
        data: post_obj  ,
        success: function (data) { 
            if(data == 1) { 
                JS.setAsComplete(userList[0].nrc_no, "")
                window.location.href =  'https://www.passport.gov.mm/booking';
            }
            else if(data == -1) {
                window.location.href =  'https://www.passport.gov.mm/booking';
            }
            else if(data == -2) {
                console.log("Retrying...")
                saveBooking(0)
            }
            else if(data == -3) {
                window.location.href =  'https://www.passport.gov.mm/booking';
            }
            else {
                const myArray = data.split("/");
                let word = myArray[1];
                if(myArray[0] == 'Empty'){
                        console.log("Empty zone") 
                        saveBooking(0);
                    }
                else if(myArray[0] == 'Over'){
                    JS.setAsComplete(userList[0].nrc_no, "over")
                    console.log("Get new & Retrying...")
                    getPersonList()
                    saveBooking(0)
                }
                else{
                    //if(userList.length == 1)
                    if(word == "") {
                        console.log("Blank word zone")
                        saveBooking(0)
                    }
                    else{
                        console.log("option 1 zone")
                        if(action == 0){
                            saveBooking(1)
                        }else{
                            saveBooking(0)
                        }
                    }
                }
                $('#btnSave').attr('disabled', false);                    
            }
        },
        error: function () {                 
        }
    })
    .fail(function(xhr, t, err) {
        console.log("Save Connection Error")
        saveBooking(0);
    });
}

function uploadIfReal(){

    let hid = document.getElementById("txt_hid")
    if(hid){
        let hid_value = document.getElementById("txt_hid").value
        if(hid_value){
            console.log("Form is real 100%\n")
            hit()
        }else{
            console.log("require id!")
        }
    }else{
        console.log("ID Not Found!")
        window.location.href =  'https://www.passport.gov.mm/user/booking';
    }

}
