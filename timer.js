(function() {
    "use strict";
    require.config({
        paths: {
            CerosSDK: '//sdk.ceros.com/standalone-player-sdk-v5.min'
        }
    });
    require(['CerosSDK'], function (CerosSDK) {
        CerosSDK.findExperience()
            .done(function(experience) { 
                let animatedNumbers = experience.findComponentsByTag("timer");

                animatedNumbers.on(CerosSDK.EVENTS.ANIMATION_STARTED, function (component){
                    let tags = component.getTags();
                    let duration;
                    let dur = [];
                    let extraText = "", endText = "";
                    let easingTime = "swing";
                    let clock = false;
                    let fraction = 1;
                    let n = null;

                    _.forEach(tags, function(value, key){
                        if(value.indexOf("dur:") > -1){
                            duration = value.slice(4, value.length);
                            dur = duration.split(",");
                        }
                        if(value.indexOf("extra-text:") > -1){
                            extraText = value.slice(11, value.length);
                        }
                        if(value.indexOf("end-text:") > -1){
                            endText = value.slice(9, value.length);
                        }
                        if(value.indexOf("clock") > -1){
                            clock = true;
                        }
                        if(value.indexOf("fraction:") > -1){
                            n = parseInt(value.slice(9, value.length))
                            fraction = 10**n;
                        }
                    })

                    //check if clock may require changing 'easing'
                    if(clock==true){
                        if((dur[0]/1000) == dur[1] || (dur[0]/1000) == dur[2]){
                            easingTime = "linear";
                        }
                    }
                    //check if 'dur' has at least 3 elements in Array 
                    if(dur.length < 3){
                        console.warn("'duration' tag is incomplete");
                        return;
                    }
                    //set initial number to count from
                    component.setText(dur[1]);

                    //counter
                    $({ countNum: component.getText() }).animate(
                        {
                            countNum: parseInt(dur[2])
                        },
                        {
                            duration: parseInt(dur[0]),
                            easing: easingTime,
                            step: function() {
                                let numbers = Math.round(this.countNum);
                                let nums = ((numbers/fraction).toFixed(n)).toString();
                                if(clock === true){
                                    nums = clockk(numbers, nums);
                                }
                                component.setText(nums + extraText);
                                if(numbers == parseInt(dur[2]) && endText != ""){
                                    component.setText(nums + endText);
                                }
                            },
                            complete: function() {
                                let numbers = this.countNum;
                                let nums = ((numbers/fraction).toFixed(n)).toString();
                                if(clock === true){
                                    nums = clockk(numbers, nums);
                                }
                                if(endText != ""){
                                    component.setText(nums + endText);
                                }
                                else if(extraText != ""){
                                    component.setText(nums + extraText);
                                }
                                else{
                                    component.setText(nums);
                                }
                            }
                        }
                    );
                });
            })
    });
})();
var clockk = (number,num) => {
    let sec = (number % 60);
    if(sec < 10){
        sec = "0" + (number % 60);
    }
    num = (Math.floor(number/60) + " " + sec).toString();
    return num;
}