$(function(){
    
    (function canIuseWebAudio(){
        try {
            var context_for_check = new webkitAudioContext();
        }catch(e) {
            alert('This browser does not support WebAudio API.');
        }
    })();
  

    var context = new webkitAudioContext();

    var buffer1;
    var buffer2;

    function load_local_file(track){
        var item = document.getElementById('input_file_track' + track).files[0];
        var info = "name:" + item.name + " type:" + item.type + " size:" + item.size;
        console.log(info);
        
        track_num = track;
        track_name = item.name;
        
        switch (track_num){
            case 1:
                lcd1.write2Display('lettersRL01', "Now Loading...");
                break;
            case 2:
                lcd2.write2Display('lettersRL01', "Now Loading...");
                break;
        }

        var fr = new FileReader();
        
        //For 
        fr.onload = function(evt) { 
            dataURI = evt.target.result;    //DataURI Data
            base64 = dataURI.split(",");    //Splitting the DataURI into MIME type and Base64. data. See Data URI schema.

            //Convert Base64 data into ArrayBuffer data.
            var byteArray = Base64Binary.decodeArrayBuffer(base64[1]);
 
            //Asynchronously decode ArrayBuffer data into audio buffer.
            context.decodeAudioData(byteArray, function(buffer) {
                switch (track_num){
                    case 1:
                        lcd1.write2Display('lettersRL01', 'Load Completed.');
                        setTimeout(function(){
                            lcd1.write2Display('lettersRL01', track_name);
                        },2200);
                        buffer1 = buffer;
                        break;
                    case 2:
                        lcd2.write2Display('lettersRL01', 'Load Completed.');
                        setTimeout(function(){
                            lcd2.write2Display('lettersRL01', track_name);
                        },2200);
                        buffer2 = buffer;
                        break;
                }
            }, function(err) { console.log("err(decodeAudioData):" + err); });
        };

        //For smoothness of drawing the "Now loading...".
        setTimeout(function(){
            //Asynchronously read selected local audio file as a DataURI data.
            fr.readAsDataURL(item);
        }, 1300);
    }

    //Nodes 
    var source1 = context.createBufferSource();
    var analyser1 = context.createAnalyser();
    var panner1 = context.createPanner();
    var lowpass1 = context.createBiquadFilter();
    var highpass1 = context.createBiquadFilter();
    var jsNode1 = context.createJavaScriptNode(2048, 1, 1);

    var source2 = context.createBufferSource();
    var analyser2 = context.createAnalyser();
    var panner2 = context.createPanner();
    var lowpass2 = context.createBiquadFilter();
    var highpass2 = context.createBiquadFilter();
    var jsNode2 = context.createJavaScriptNode(2048, 1, 1);
   
    function playSound(buffer,time) {
        var source = context.createBufferSource();
        var analyser = context.createAnalyser();
        var panner = context.createPanner();
        var lowpass = context.createBiquadFilter();
        var highpass = context.createBiquadFilter();
        var jsNode = context.createJavaScriptNode(2048, 1, 1);
        jsNode.connect(context.destination);
 
        //Nodes configuration
        source.buffer = buffer;
        source.loop = true;
 
        panner.setPosition(0,0,0);
         
        lowpass.type = 0;
        lowpass.frequency.value = 30000;
         
        highpass.type = 1;
        highpass.frequency.value = 0;

        analyser.smoothingTimeConstant = 0.3; //1:Max smoothness
        analyser.fftSize = 128;

        //Node connection
        source.connect(lowpass);
        lowpass.connect(highpass);
        highpass.connect(panner);
        
        panner.connect(analyser);
        panner.connect(context.destination);
        
        analyser.connect(jsNode);

        source.noteOn(time); 
        
        return {
            source:source,
            analyser:analyser,
            panner:panner,
            lowpass:lowpass,
            highpass:highpass,
            jsNode:jsNode
        };
    }

    function play1() {
        var startTime = context.currentTime + 0.100;
        var rt = playSound(buffer1, startTime);

        source1 = rt.source;
        panner1 = rt.panner;
        compressor1 = rt.compressor;
        lowpass1 = rt.lowpass;
        highpass1 = rt.highpass;
        analyser1 = rt.analyser;
        jsNode1 = rt.jsNode;
        jsNode1.onaudioprocess = function(){
            var freq; 
            var formatted_freq = [];
            
            if (analyser1){ 
                freq = new Uint8Array(analyser1.frequencyBinCount);
                analyser1.getByteTimeDomainData(freq);
                for(var i = 0; i<freq.length; i++){
                    formatted_freq.push({val:freq[i]}); 
                }
            }
            drawEQ("#viz1", formatted_freq);
        }
        calcVolume();
        calcEffect();
    }

    function play2() {
        var startTime = context.currentTime + 0.100;
        var rt = playSound(buffer2, startTime);

        source2 = rt.source;
        panner2 = rt.panner;
        compressor2 = rt.compressor;
        lowpass2 = rt.lowpass;
        highpass2 = rt.highpass;
        analyser2 = rt.analyser;
        jsNode2 = rt.jsNode;
        jsNode2.onaudioprocess = function(){
            var freq; 
            var formatted_freq = [];
            
            if (analyser2){ 
                freq = new Uint8Array(analyser2.frequencyBinCount);
                analyser2.getByteTimeDomainData(freq);
                for(var i = 0; i<freq.length; i++){
                    formatted_freq.push({val:freq[i]}); 
                }
            }
            drawEQ("#viz2", formatted_freq);
        }
        calcVolume();
        calcEffect();
    }
    
    function stop1() {
        source1.noteOff(0);
    }   
    
    function stop2() {
        source2.noteOff(0);
    }
    
    
    function drawEQ(elem, data){
        d3.select(elem).select("svg").remove();
        
        var bS = 1. //Space between two bar
        var bW = 5; //width of each bar
        var bH = 80; //max height of bar
        var cW = (data.length) * (bW + bS); //width of canvas
        var cH = bH; //height of canvas
        var bC = "#dddddd"; //color of bar
        
        var canvas = d3.select(elem);
        var svg = canvas.append("svg")
            .attr("width", cW)
            .attr("height", cH)
            .attr("shape-rendering", "crispEdges");
        var scaleX = d3.scale.linear()
            .domain([0, data.length])
            .range([0, cW]);
        var scaleY = d3.scale.linear()
            .domain([0, d3.max(data, function(d){ return d.val; })])
            .range([0,cH]); 

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x",function(d,i){ return (bW + bS) * i; })
            .attr("y", function(d,i){ return scaleY(d.val); })
            .attr("width", function(d){ return bW; })
            .attr("height", function(d){ return bH; })
            .attr("fill",function(d,i){ return bC; });
    }

    function calcVolume(){
        var fader = parseFloat($("#crossfader_display").html());
        var vol1 = parseFloat($("#playvolume_display1").html());
        var vol2 = parseFloat($("#playvolume_display2").html());
        var vol = 0;
        
        if(fader > 0){
            vol = vol1 * (1 - fader);
            source1.gain.value = vol;
            source2.gain.value = vol2;
        }else if(fader < 0){
            vol = vol2 * (1 + fader);
            source2.gain.value = vol;
            source1.gain.value = vol1;
        }else if(fader == 0){
            source1.gain.value = vol1;
            source2.gain.value = vol2;
        }
    }
    
    function calcEffect(){
        var _speed1 = parseFloat($("#playspeed_display1").html());
        var _speed2 = parseFloat($("#playspeed_display2").html());
        
        var _lowpass1 = parseFloat($("#lowpass_display1").html());
        var _lowpass2 = parseFloat($("#lowpass_display2").html());
        
        var _highpass1 = parseFloat($("#highpass_display1").html());
        var _highpass2 = parseFloat($("#highpass_display2").html());
   
        var _panner1X = parseFloat($("#panner1X_display").html());
        var _panner1Y = parseFloat($("#panner1Y_display").html());
        var _panner2X = parseFloat($("#panner2X_display").html());
        var _panner2Y = parseFloat($("#panner2Y_display").html());
        
        panner1.setPosition(_panner1X,0,-1);
        panner1.setPosition(0, _panner1Y,-1);
        panner2.setPosition(_panner2X,0,-1);
        panner2.setPosition(0, _panner2Y,-1);
        
        lowpass1.frequency.value = _lowpass1;
        lowpass2.frequency.value = _lowpass2;
        
        highpass1.frequency.value = _highpass1;
        highpass2.frequency.value = _highpass2;
        
        source1.playbackRate.value = _speed1;
        source2.playbackRate.value = _speed2;
    }

     
    $("#button_open_track1").click(function(){
        $("#input_file_track1").click();
    });

    $("#button_open_track2").click(function(){
        $("#input_file_track2").click();
    });
 
    $("#input_file_track1").change(function(){
        load_local_file(1); 
    });

    $("#input_file_track2").change(function(){
        load_local_file(2); 
    });

    $('#play1').click(function(){
        play1();
    });
    
    $('#stop1').click(function(){
        stop1();
    });

    $('#play2').click(function(){
        play2();
    });

    $('#stop2').click(function(){
        stop2();
    });

    //Slider
    $('#crossfader').slider({
        min: -1,
        max: 1,
        value: 0,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#crossfader_display').html( ui.value ); 
            calcVolume();
        }
    }).css('width', 300).css('height', 0).css('top','8px');


    $('#playspeed_slider1').slider({
        orientation: 'vertical',
        min: 0.1,
        max: 2,
        value: 1,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#playspeed_display1').html( ui.value );
            source1.playbackRate.value = ui.value;
        }
    }).css('height', 170).css('width', 0);

    $('#playspeed_slider2').slider({
        orientation: 'vertical',
        min: 0.1,
        max: 2,
        value: 1,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#playspeed_display2').html( ui.value );
            source2.playbackRate.value = ui.value;
        }
    }).css('height', 170).css('width', 0);
    
    $('#playvolume_slider1').slider({
        orientation: 'vertical',
        min: 0.0,
        max: 1,
        value: 1,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#playvolume_display1').html( ui.value );
            calcVolume();
        }
    }).css('height', 170).css('width', 0);

    $('#playvolume_slider2').slider({
        orientation: 'vertical',
        min: 0.0,
        max: 1,
        value: 1,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#playvolume_display2').html( ui.value );
            calcVolume();
        }
    }).css('height', 170).css('width', 0);


    $('#panner1X').slider({
        min: -1,
        max: 1,
        value: 0,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#panner1X_display').html( ui.value );
            panner1.setPosition(ui.value,0,-1);
        }
    }).css('width', 80).css('height', 0);

    $('#panner2X').slider({
        min: -1,
        max: 1,
        value: 0,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#panner2X_display').html( ui.value );
            panner2.setPosition(ui.value,0,-1);
        }
    }).css('width', 80).css('height', 0);

    $('#panner1Y').slider({
        orientation: 'vertical',
        min: -1,
        max: 1,
        value: 0,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#panner1Y_display').html( ui.value );
            panner1.setPosition(0, ui.value,-1);
        }
    }).css('height', 80).css('width', 0);

    $('#panner2Y').slider({
        orientation: 'vertical',
        min: -1,
        max: 1,
        value: 0,
        step: 0.01,
        animate: "slow",
        slide: function(event, ui){
            $('#panner2Y_display').html( ui.value );
            panner2.setPosition(0, ui.value,-1);
        }
    }).css('height', 80).css('width', 0);

    //default:30000
    $('#lowpass1').slider({
        orientation: 'vertical',
        min: 0,
        max: 30000,
        value: 30000,
        step: 20,
        animate: "slow",
        slide: function(event, ui){
            $('#lowpass_display1').html( ui.value );
            lowpass1.frequency.value = ui.value;
        }
    }).css('height', 170).css('width', 0);

    $('#lowpass2').slider({
        orientation: 'vertical',
        min: 0,
        max: 30000,
        value: 30000,
        step: 20,
        animate: "slow",
        slide: function(event, ui){
            $('#lowpass_display2').html( ui.value );
            lowpass2.frequency.value = ui.value;
        }
    }).css('height', 170).css('width', 0);

    //default:0
    $('#highpass1').slider({
        orientation: 'vertical',
        min: 0,
        max: 8000,
        value: 0,
        step: 10,
        animate: "slow",
        slide: function(event, ui){
            
            $('#highpass_display1').html( ui.value );
            highpass1.frequency.value = ui.value;
        }
    }).css('height', 170).css('width', 0);

    $('#highpass2').slider({
        orientation: 'vertical',
        min: 0,
        max: 8000,
        value: 0,
        step: 10,
        animate: "slow",
        slide: function(event, ui){
            $('#highpass_display2').html( ui.value );
            highpass2.frequency.value = ui.value;
        }
    }).css('height', 170).css('width', 0);
   
    //Music information LCD
    var lcd1 = new CanvasLCD('06');
    var lcd2 = new CanvasLCD('06');
    lcd1.init('canvasLCD1', 'initialword', false);
    lcd2.init('canvasLCD2', 'initialword', false);
    lcd1.write2Display('lettersRL01','TrackA');
    lcd2.write2Display('lettersRL01','TrackB');

});



