$(function(){

    (function checkWebAudio(){
        try {
            var context = new window.AudioContext();
        } catch(e) {
            alert('Please use a browser which supports AudioContext() of WebAudio API');
        }
    })();

    var context = new window.AudioContext();
    
    var deck1 = createDeck(); 
    var deck2 = createDeck(); 
    function createDeck() {
        return {
            source : context.createBufferSource(),
            analyser : context.createAnalyser(),
            panner : context.createPanner(),
            lowpass : context.createBiquadFilter(),
            highpass : context.createBiquadFilter(),
            gain : context.createGain(),
            scriptProcessor : context.createScriptProcessor(2048, 1, 1),
            playing : false
        };
    }

    function connectDeck(deck, buffer, startTime) {
        deck.source = context.createBufferSource();
        deck.source.buffer = buffer;
        deck.source.loop = true;
        
        deck.gain.gain.value = 1;
         
        deck.lowpass.type = "lowpass";
        deck.lowpass.frequency.value = 30000;
        deck.lowpass.Q.value = 5;
         
        deck.highpass.type = "highpass";
        deck.highpass.frequency.value = 0;
        deck.highpass.Q.value = 5;
        
        deck.panner.setPosition(0,0,0);

        deck.analyser.smoothingTimeConstant = 0.9;
        deck.analyser.fftSize = 128;

        deck.source.connect(deck.gain);
        deck.gain.connect(deck.lowpass);
        deck.lowpass.connect(deck.highpass);
        deck.highpass.connect(deck.panner); 
        deck.panner.connect(deck.analyser);
        deck.panner.connect(context.destination);
        deck.analyser.connect(deck.scriptProcessor);
        deck.scriptProcessor.connect(context.destination);
        
        deck.source.start(startTime);
        return deck;
    }

    var buffer1;
    var buffer2;

    function loadAudioFile(track){
        var item = document.getElementById('input_file_track' + track).files[0];
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
                alert('Decode Error');
            });
        };

        //For smoothness of drawing the 'Now loading...'.
        setTimeout(function(){
            fr.readAsDataURL(item);
        }, 1500);
    }

    function play1() {
        if (!deck1.playing) {
            deck1.playing = true;

            var startTime = context.currentTime + 0.100;
            deck1 = connectDeck(deck1, buffer1, startTime);
            deck1.scriptProcessor.onaudioprocess = function(){
                var freq; 
                var formattedFreq = [];
                if (deck1.analyser){ 
                    freq = new Uint8Array(deck1.analyser.frequencyBinCount);
                    deck1.analyser.getByteTimeDomainData(freq);
                    for(var i = 0; i<freq.length; i++){
                        formattedFreq.push({val:freq[i]}); 
                    }
                }
                drawEQ('#viz1', formattedFreq);
            };
            calcVolume();
            calcEffect();
        }
    }

    function play2() {
        if (!deck2.playing) {
            deck1.playing = true;

            var startTime = context.currentTime + 0.100;
            deck2 = connectDeck(deck2, buffer2, startTime);
            deck2.scriptProcessor.onaudioprocess = function(){
                var freq; 
                var formattedFreq = [];
                if (deck2.analyser){ 
                    freq = new Uint8Array(deck2.analyser.frequencyBinCount);
                    deck2.analyser.getByteTimeDomainData(freq);
                    for(var i = 0; i<freq.length; i++){
                        formattedFreq.push({val:freq[i]}); 
                    }
                }
                drawEQ('#viz2', formattedFreq);
            };
            calcVolume();
            calcEffect();
        }
    }
 
    function stop1() {
        if (deck1.playing) {
            deck1.source.stop(0);
            deck1.playing = false;
        }
    } 

    function stop2() {
        if (deck2.playing) {
            deck2.source.stop(0);
            deck2.playing = false;
        }
    } 

    function drawEQ(elem, data){
        d3.select(elem).select('svg').remove();
        
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
        if(fader > 0){
            vol = vol1 * (1 - fader);
            deck1.gain.gain.value = vol;
            deck2.gain.gain.value = vol2;
        }else if(fader < 0){
            vol = vol2 * (1 + fader);
            deck2.gain.gain.value = vol;
            deck1.gain.gain.value = vol1;
        }else if(fader === 0){
            deck1.gain.gain.value = vol1;
            deck2.gain.gain.value = vol2;
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
        
        deck1.panner.setPosition(_panner1X,0,-1);
        deck1.panner.setPosition(0, _panner1Y,-1);
        deck2.panner.setPosition(_panner2X,0,-1);
        deck2.panner.setPosition(0, _panner2Y,-1);
        
        deck1.lowpass.frequency.value = _lowpass1;
        deck2.lowpass.frequency.value = _lowpass2;
        
        deck1.highpass.frequency.value = _highpass1;
        deck2.highpass.frequency.value = _highpass2;
        
        deck1.source.playbackRate.value = _speed1;
        deck2.source.playbackRate.value = _speed2;
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
            deck1.source.playbackRate.value = ui.value;
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
            deck2.source.playbackRate.value = ui.value;
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
            deck1.panner.setPosition(ui.value,0,-1);
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
            deck2.panner.setPosition(ui.value,0,-1);
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
            deck1.panner.setPosition(0, ui.value,-1);
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
            deck2.panner.setPosition(0, ui.value,-1);
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
            deck1.lowpass.frequency.value = ui.value;
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
            deck2.lowpass.frequency.value = ui.value;
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
            deck1.highpass.frequency.value = ui.value;
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
            deck2.highpass.frequency.value = ui.value;
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

