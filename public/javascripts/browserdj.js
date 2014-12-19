$(function(){

    (function checkWebAudio(){
        try {
            var context = new window.AudioContext();
        } catch(e) {
            alert('This browser does not support WebAudio API.');
        }
    })();

    var context = new window.AudioContext();
    var buffer1;
    var buffer2;

    function loadAudioFile(track){
        var item = document.getElementById('input_file_track' + track).files[0];
        var info = 'name:' + item.name + ' type:' + item.type + ' size:' + item.size;
        
        var trackNum = track;
        var trackName = item.name;
        
        switch (trackNum){
            case 1:
                lcd1.write2Display('lettersRL01', 'Now Loading...');
                break;
            case 2:
                lcd2.write2Display('lettersRL01', 'Now Loading...');
                break;
        }

        var fr = new FileReader();
        fr.onload = function(evt) { 
            var dataURI = evt.target.result; //DataURI Data
            //Split the DataURI into MIME type and Base64 data.
            var base64 = dataURI.split(','); 
            //Convert Base64 data into ArrayBuffer data.
            var byteArray = Base64Binary.decodeArrayBuffer(base64[1]);
            //Decode ArrayBuffer into Audio Data.
            context.decodeAudioData(byteArray, function(buffer) {
                switch (trackNum){
                    case 1:
                        lcd1.write2Display('lettersRL01', 'Load Completed.');
                        setTimeout(function(){
                            lcd1.write2Display('lettersRL01', trackName);
                        }, 2200);
                        buffer1 = buffer;
                        break;
                    case 2:
                        lcd2.write2Display('lettersRL01', 'Load Completed.');
                        setTimeout(function(){
                            lcd2.write2Display('lettersRL01', trackName);
                        }, 2200);
                        buffer2 = buffer;
                        break;
                }
            }, function(err) {
                console.log(err);
                alert('Decode Error');
            });
        };

        //For smoothness of drawing the 'Now loading...'.
        setTimeout(function(){
            fr.readAsDataURL(item);
        }, 1500);
    }

    //Nodes 
    var source1 = context.createBufferSource();
    var analyser1 = context.createAnalyser();
    var panner1 = context.createPanner();
    var lowpass1 = context.createBiquadFilter();
    var highpass1 = context.createBiquadFilter();
    var jsNode1 = context.createScriptProcessor(2048, 1, 1);
    var gain1 = context.createGain();

    var source2 = context.createBufferSource();
    var analyser2 = context.createAnalyser();
    var panner2 = context.createPanner();
    var lowpass2 = context.createBiquadFilter();
    var highpass2 = context.createBiquadFilter();
    var jsNode2 = context.createScriptProcessor(2048, 1, 1);
    var gain2 = context.createGain();
   
    function playSound(buffer, time) {
        var source = context.createBufferSource();
        var analyser = context.createAnalyser();
        var panner = context.createPanner();
        var lowpass = context.createBiquadFilter();
        var highpass = context.createBiquadFilter();
        var gain = context.createGain();
        var jsNode = context.createScriptProcessor(2048, 1, 1);
        jsNode.connect(context.destination);
        
        source.connect(gain);
        gain.gain.value = 1;

        //Nodes configuration
        source.buffer = buffer;
        source.loop = true;
 
        panner.setPosition(0,0,0);
         
        lowpass.type = "lowpass";
        lowpass.frequency.value = 30000;
        lowpass.Q.value = 20;
         
        highpass.type = "highpass";
        highpass.frequency.value = 0;
        highpass.Q.value = 20;

        analyser.smoothingTimeConstant = 1; //1:Max smoothness
        analyser.fftSize = 128;
        source.connect(analyser);

        //Node connection
        source.connect(lowpass);
        lowpass.connect(highpass);
        highpass.connect(panner);
         
        panner.connect(gain);
        gain.connect(context.destination);
       
        source.start(time); 
        
        return {
            source:source,
            gain:gain,
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
        gain1 = rt.gain;
        panner1 = rt.panner;
        compressor1 = rt.compressor;
        lowpass1 = rt.lowpass;
        highpass1 = rt.highpass;
        analyser1 = rt.analyser;
        jsNode1 = rt.jsNode;
        jsNode1.onaudioprocess = function(){
            var freq; 
            var formattedFreq = [];
            
            if (analyser1){ 
                freq = new Uint8Array(analyser1.frequencyBinCount);
                analyser1.getByteTimeDomainData(freq);
                for(var i = 0; i<freq.length; i++){
                    formattedFreq.push({val:freq[i]}); 
                }
            }
            drawEQ('#viz1', formattedFreq);
        };
        calcVolume();
        calcEffect();
    }

    function play2() {
        var startTime = context.currentTime + 0.100;
        var rt = playSound(buffer2, startTime);

        source2 = rt.source;
        gain2 = rt.gain;
        panner2 = rt.panner;
        compressor2 = rt.compressor;
        lowpass2 = rt.lowpass;
        highpass2 = rt.highpass;
        analyser2 = rt.analyser;
        jsNode2 = rt.jsNode;
        jsNode2.onaudioprocess = function(){
            var freq; 
            var formattedFreq = [];
            
            if (analyser2){ 
                freq = new Uint8Array(analyser2.frequencyBinCount);
                analyser2.getByteTimeDomainData(freq);
                for(var i = 0; i<freq.length; i++){
                    formattedFreq.push({val:freq[i]}); 
                }
            }
            drawEQ('#viz2', formattedFreq);
        };
        calcVolume();
        calcEffect();
    }
    
    function stop1() {
        source1.stop(0);
    }   
    
    function stop2() {
        source2.stop(0);
    }
    
    function drawEQ(elem, data){
        d3.select(elem).select('svg').remove();
        
        //////////////////////////////////////////////

        var bS = 1; //Bar space
        var bW = 5; //Bar width
        var bH = 80; //Maximum height of bars
        var cW = (data.length) * (bW + bS); //Width of canvas
        var cH = bH; //Height of canvas
        var bC = '#dddddd'; //Color of bar
        
        var canvas = d3.select(elem);
        var svg = canvas.append('svg')
            .attr('width', cW)
            .attr('height', cH)
            .attr('shape-rendering', 'crispEdges');
        var scaleX = d3.scale.linear()
            .domain([0, data.length])
            .range([0, cW]);
        var scaleY = d3.scale.linear()
            .domain([0, d3.max(data, function(d){ return d.val; })])
            .range([0,cH]); 

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x',function(d,i){ return (bW + bS) * i; })
            .attr('y', function(d,i){ return scaleY(d.val); })
            .attr('width', function(d){ return bW; })
            .attr('height', function(d){ return bH; })
            .attr('fill',function(d,i){ return bC; });
    }

    function calcVolume(){
        var fader = parseFloat($('#crossfader_display').html());
        var vol1 = parseFloat($('#playvolume_display1').html());
        var vol2 = parseFloat($('#playvolume_display2').html());
        var vol = 0;
        console.log(gain1.gain.value); 
        if(fader > 0){
            vol = vol1 * (1 - fader);
            gain1.gain.value = vol;
            gain2.gain.value = vol2;
        }else if(fader < 0){
            vol = vol2 * (1 + fader);
            gain2.gain.value = vol;
            gain1.gain.value = vol1;
        }else if(fader === 0){
            gain1.gain.value = vol1;
            gain2.gain.value = vol2;
        }
    }
    
    function calcEffect(){
        var _speed1 = parseFloat($('#playspeed_display1').html());
        var _speed2 = parseFloat($('#playspeed_display2').html());
        
        var _lowpass1 = parseFloat($('#lowpass_display1').html());
        var _lowpass2 = parseFloat($('#lowpass_display2').html());
        
        var _highpass1 = parseFloat($('#highpass_display1').html());
        var _highpass2 = parseFloat($('#highpass_display2').html());
   
        var _panner1X = parseFloat($('#panner1X_display').html());
        var _panner1Y = parseFloat($('#panner1Y_display').html());
        var _panner2X = parseFloat($('#panner2X_display').html());
        var _panner2Y = parseFloat($('#panner2Y_display').html());
        
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

    $('#button_open_track1').click(function(){
        $('#input_file_track1').click();
    });

    $('#button_open_track2').click(function(){
        $('#input_file_track2').click();
    });
 
    $('#input_file_track1').change(function(){
        loadAudioFile(1); 
    });

    $('#input_file_track2').change(function(){
        loadAudioFile(2); 
    });

    var State;
    (function(){
      var instance;
      State = function State(){
          if (instance) {
              return instance;
          }
          instance = this;
          this.track1Play = false;
          this.track2Play = false;
      };
    }());

    $('#play1').click(function(){
        if (!State.track1Play){
            play1();
            State.track1Play = true;
        }
    });
    
    $('#stop1').click(function(){
        stop1();
        State.track1Play = false;
    });

    $('#play2').click(function(){
        if (!State.track2Play){
            play2();
            State.track2Play = true;
        }
    });

    $('#stop2').click(function(){
        stop2();
        State.track2Play = false;
    });

    //Slider
    $('#crossfader').slider({
        min: -1,
        max: 1,
        value: 0,
        step: 0.01,
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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
        animate: 'slow',
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



