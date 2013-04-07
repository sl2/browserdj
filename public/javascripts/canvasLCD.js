/** 
 * @license canvasLCD.js 1.0 Copyright (c) 2012, Ryoya KAWAI All Rights Reserved.
 * Available via the MIT or new BSD license.
 */

var CanvasLCD = function(lcdType) {
  var colorSet = {
    //'greenNoBLBlack'
    '01' : {
      'background' : '#b4be8a',
      'on'         : '#000000',
      'on2'        : '#696969',
      'on3'        : '#808080',
      'off'        : '#a8c39a'
    },
    //'greenNoBLPurple'
    '02' : {
      'background' : '#b4be8a',
      'on'         : '#5658c1',
      'on2'        : '#706ed7',
      'on3'        : '#8381e3',
      'off'        : '#a8c39a'
    },
    //'blueNoBLBlack'
    '03' : {
      'background' : '#719891',
      'on'         : '#000000',
      'on2'        : '#5b6d69',
      'on3'        : '#576360',
      'off'        : '#6da3a6'
    },
    //'yellowBLBlack'
    '04' : {
      'background' : '#00FF64',
      'on'         : '#000000',
      'on2'        : '#00BB55',
      'on3'        : '#008855',
      'off'        : '#00EE55'
    },
    //'orangeBLBlack'
    '05' : {
      'background' : '#ff7300',
      'on'         : '#000000',
      'on2'        : '#e16805',
      'on3'        : '#703301',
      'off'        : '#e86903'
    },
    //'blueBLGray'
    '06' : {
      'background' : '#5f2fff',
      'on'         : '#c9cde5',
      'on2'        : '#b7bbd5',
      'on3'        : '#aeb3d2',
      'off'        : '#5527ff'
    }

  };
  var lcdType = lcdType;
  var color = colorSet[lcdType];
  var digits = { 'x': 18, 'y': 2 };
  var magnif = 1.0; // magnification
  var offset = { 'top'  : 4, 'left' : 4, 'right' : 4 };
  var dot = { 'x': 3, 'y': 3, 'space': 1 };
  var numSector = { 'x': 5, 'y': 8 };
  var intervalID = null;
  
  return {
    init : function(canvasIdName, initialWord, logoDisp) {
      if(typeof color =='undefined') {
        console.log('Color Set [' + lcdType + '] does NOT exist.');
        return;
      }
      this.systemReady = false;
      this.canvas = document.getElementById(canvasIdName);
      this.canvasContext = this.canvas.getContext('2d'); 
      this.canvas.width  =  offset.left + offset.right + digits.x * magnif * (dot.space + (numSector.x * dot.x) + (numSector.x-1)*dot.space + dot.space) - 2*magnif*dot.space;
      this.canvas.height =  offset.top + offset.top + digits.y * magnif * (dot.space + (numSector.y * dot.y) + (numSector.y-1)*dot.space + dot.space) - 2*magnif*dot.space;

      // write background
      this.canvasContext.beginPath();
      this.canvasContext.fillStyle = color.background;
      this.canvasContext.rect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
      this.canvasContext.fill();
      this.canvasContext.closePath();
      this.write2Display('init', 'SPACE');
      if(logoDisp==true) this.HTML5Logo(initialWord);
    },

    HTML5Logo: function(initialWord) {
      var HTML5Logo = [
        {'x': '0', 'y': '0', 'pattern': 'HTML5-0:0'},
        {'x': '1', 'y': '0', 'pattern': 'HTML5-1:0'},
        {'x': '0', 'y': '1', 'pattern': 'HTML5-0:1'},
        {'x': '1', 'y': '1', 'pattern': 'HTML5-1:1'},
        {'x': '2', 'y': '0', 'pattern': 'HTML5-2:0'},
        {'x': '2', 'y': '1', 'pattern': 'HTML5-2:1'},
        {'x': '3', 'y': '0', 'pattern': 'H'},
        {'x': '4', 'y': '0', 'pattern': 'T'},
        {'x': '5', 'y': '0', 'pattern': 'M'},
        {'x': '6', 'y': '0', 'pattern': 'L'},
        {'x': '7', 'y': '0', 'pattern': '5'},
        {'x': '4', 'y': '1', 'pattern': 'W'},
        {'x': '5', 'y': '1', 'pattern': 'e'},
        {'x': '6', 'y': '1', 'pattern': 'b'},
        {'x': '8', 'y': '1', 'pattern': 'A'},
        {'x': '9', 'y': '1', 'pattern': 'u'},
        {'x': '10', 'y': '1', 'pattern': 'd'},
        {'x': '11', 'y': '1', 'pattern': 'i'},
        {'x': '12', 'y': '1', 'pattern': 'o'},
        {'x': '14', 'y': '1', 'pattern': 'A'},
        {'x': '15', 'y': '1', 'pattern': 'P'},
        {'x': '16', 'y': '1', 'pattern': 'I'}
      ];
      var sequence = [
        {'mode': 'logo', 'letters': HTML5Logo},
        {'mode': 'logo', 'letters': HTML5Logo},
        {'mode': 'logo', 'letters': HTML5Logo},
        {'mode': 'logo', 'letters': HTML5Logo},
        {'mode': 'logo', 'letters': HTML5Logo},
        {'mode': 'logo', 'letters': HTML5Logo},
        {'mode': 'init', 'letters': 'SPACE'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth   Version 0.1'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth   Version 0.1'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth   Version 0.1'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth Loading.        |'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth Loading..       -'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth Loading....     |'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth Loading......   -'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth Loading........ |'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth Ready!'},
        {'mode': 'letters', 'letters': 'Web Audio FM Synth'},
        {'mode': 'letters', 'letters': initialWord }
      ];
      var intervalSec = 600;
      var seqCount = 0;
      var that = this;
      intervalID = setInterval(
        function() {
          that.write2Display('init', 'SPACE');
          that.write2Display(sequence[seqCount].mode, sequence[seqCount].letters);
          if( seqCount >= sequence.length-1 ) {
            that.systemReady = true;
            clearInterval( intervalID );
            intervalID = null;
          }
          seqCount++;
        }, intervalSec);
    },

    clearDisplay: function() {
      this.write2Display('init', 'SPACE');
    },
    
    // mode: init, letters, lettersRL01, lettersRL02, logo
    write2Display : function(mode, letters) {
      if(typeof letters == 'number') letters=String(letters);
      if(mode!='init' && mode!='logo' && (digits.x * digits.y) < letters.length) {
        letters = letters.substring(0, digits.x * digits.y);
      }
      switch(mode) {
      default:
       case 'init':
        if(letters =='SPACE') { var pattern = this.getPattern(letters); }
        for(var digX=0; digX<digits.x; digX++) {
          for(var digY=0; digY<digits.y; digY++) {
            this.letterOn(digX, digY, pattern);
          } // iteration of digY
        } // iteration of digX
        break;
       case 'letters' :
        this.clearDisplay();
        var digX = 0, digY = 0;
        for(var i=0; i<letters.length; i++) {
          var pattern = this.getPattern(letters.substring(i, i+1));
          if(i>1 && i%digits.x==0) {
            digY++;
            digX = 0;
          }
          this.letterOn(digX, digY, pattern);
          digX++;
        }
        break;

       case 'lettersRL01' :
        this.clearDisplay();
        var digX = 0, digY = 0;
        var i = 0;
        var that = this;
        var itrL = setInterval(
          function() {
            var pattern = that.getPattern(letters.substring(i, i+1));
            if(i>1 && i%digits.x==0) {
              digY++;
              digX = 0;
            }
            that.letterOn(digX, digY, pattern);
            digX++;
            i++;
            if(letters.length < i) clearInterval(itrL);
          }, 100);
        break;

       case 'lettersRL02' :
        this.clearDisplay();
        var digX = 0, digY = 0;
        var i = 0;
        var arrayLetters = new Array();
        for(var j=0; j<digits.y; j++) {
          arrayLetters.push(letters.substring(j*digits.x, (j+1)*digits.x));
        }
        var that = this;
        var itrL = setInterval(
          function() {
            for(var j=0; j<digits.y; j++) {
              var pattern=that.getPattern(arrayLetters[j].substring(i, i+1));
              that.letterOn(digX, j, pattern);
            }
            digX++;
            i++;
            if(digits.x <= i) clearInterval(itrL);
          }, 100);
        break;

       case 'logo':
        for(var i=0; i<letters.length; i++) {
          this.letterOn(letters[i].x, letters[i].y, this.getPattern(letters[i].pattern));
        }
        break;
      }
    },

    sleep : function( T ) {
      var d1 = new Date().getTime();
      var d2 = new Date().getTime();
      while( d2 < d1+1000*T ){
        d2=new Date().getTime();
      }
      return;
    },

    // digX: Offset Position of X, digY: Offset Position Y
    // pattern: pattern of the letter
    letterOn: function(digX, digY, pattern){
      var position = {
        'x': offset.left + digX * magnif * (dot.space + (numSector.x*dot.x) + (numSector.x-1)*dot.space + dot.space),
        'y': offset.top + digY * magnif * (dot.space + (numSector.y*dot.y) + (numSector.y-1)*dot.space + dot.space)
      };
      for(var i=0; i<numSector.x; i++) {
        for(var j=0; j<numSector.y; j++) {
          this.canvasContext.beginPath();
          var writeColor=color.off;
          switch(pattern[j][i]) {
           case 1:
            writeColor = color.on;
            break;
           case 2:
            writeColor = color.on2;
           break;
            case 3:
            writeColor = color.on3;
            break;
          }
          this.canvasContext.fillStyle = writeColor;
          this.canvasContext.rect(position.x + i*(magnif * dot.x) + i*(magnif * dot.space),
                                  position.y + j*(magnif * dot.y) + j*(magnif * dot.space),
                                  magnif * dot.x,
                                  magnif * dot.y);
          this.canvasContext.fill();
          this.canvasContext.closePath();
        } // iteration of i
      } // iteration of j
        
    },
    
    getPattern: function(letter) {
      var out = new Array(numSector.x, numSector.y);
      switch(letter) {
       case '0':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [1,0,0,1,1], [1,0,1,0,1],
          [1,1,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case '9':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,1],
          [0,0,0,0,1], [0,0,0,1,0], [0,1,1,0,0], [0,0,0,0,0]
        ];
        break;
        case '8':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0],
          [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
        case '7':
        out=[
          [1,1,1,1,1], [0,0,0,0,1], [0,0,0,1,0], [0,0,1,0,0],
          [0,1,0,0,0], [0,1,0,0,0], [0,1,0,0,0], [0,0,0,0,0]
        ];
        break;
       case '6':
        out=[
          [0,1,1,1,0], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,0],
          [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case '5':
        out=[
          [1,1,1,1,1], [1,0,0,0,0], [1,1,1,1,0], [0,0,0,0,1],
          [0,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case '4':
        out=[
          [0,0,0,1,0], [0,0,1,1,0], [0,1,0,1,0], [1,0,0,1,0],
          [1,0,0,1,0], [1,1,1,1,1], [0,0,0,1,0], [0,0,0,0,0]
        ];
        break;
       case '3':
        out=[
          [1,1,1,1,1], [0,0,0,1,0], [0,0,1,0,0], [0,0,0,1,0],
          [0,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case '2':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [0,0,0,0,1], [0,0,0,1,0],
          [0,0,1,0,0], [0,1,0,0,0], [1,1,1,1,1], [0,0,0,0,0]
        ];
        break;
       case '1':
        out=[
          [0,0,1,0,0], [0,1,1,0,0], [0,0,1,0,0], [0,0,1,0,0],
          [0,0,1,0,0], [0,0,1,0,0], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'a':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,1,1,1,0], [0,0,0,0,1],
          [0,1,1,1,1], [1,0,0,0,1], [0,1,1,1,1], [0,0,0,0,0]
        ];
        break;
       case 'b':
        out=[
          [1,0,0,0,0], [1,0,0,0,0], [1,0,1,1,0], [1,1,0,0,1],
          [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'c':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,1,1,1,0], [1,0,0,0,0],
          [1,0,0,0,0], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'd':
        out=[
          [0,0,0,0,1], [0,0,0,0,1], [0,1,1,0,1], [1,0,0,1,1],
          [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,1], [0,0,0,0,0]
        ];
        break;
       case 'e':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,1,1,1,0], [1,0,0,0,1],
          [1,1,1,1,1], [1,0,0,0,0], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'f':
        out=[
          [0,0,1,1,0], [0,1,0,0,1], [0,1,0,0,0], [1,1,1,0,0],
          [0,1,0,0,0], [0,1,0,0,0], [0,1,0,0,0], [0,0,0,0,0]
        ];
        break;
       case 'g':
        out=[
          [0,0,0,0,0], [0,1,1,1,1], [1,0,0,0,1], [1,0,0,0,1],
          [0,1,1,1,1], [0,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'h':
        out=[
          [1,0,0,0,0], [1,0,0,0,0], [1,0,1,1,0], [1,1,0,0,1],
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'i':
        out=[
          [0,0,1,0,0], [0,0,0,0,0], [0,1,1,0,0], [0,0,1,0,0],
          [0,0,1,0,0], [0,0,1,0,0], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'j':
        out=[
          [0,0,0,1,0], [0,0,0,0,0], [0,0,1,1,0], [0,0,0,1,0],
          [0,0,0,1,0], [1,0,0,1,0], [0,1,1,0,0], [0,0,0,0,0]
        ];
        break;
       case 'k':
        out=[
          [1,0,0,0,0], [1,0,0,0,0], [1,0,0,1,0], [1,0,1,0,0],
          [1,1,0,0,0], [1,0,1,0,0], [1,0,0,1,0], [0,0,0,0,0]
        ];
        break;
       case 'l':
        out=[
          [0,1,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0],
          [0,0,1,0,0], [0,0,1,0,0], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'm':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,1,0,1,0], [1,0,1,0,1],
          [1,0,1,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'n':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,0,1,1,0], [1,1,0,0,1],
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'o':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,1,1,1,0], [1,0,0,0,1],
          [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'p':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,1,1,1,0], [1,0,0,0,1],
          [1,1,1,1,0], [1,0,0,0,0], [1,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case 'q':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,1,1,1,1], [1,0,0,0,1],
          [0,1,1,1,1], [0,0,0,0,1], [0,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'r':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,0,1,1,0], [1,1,0,0,1],
          [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case 's':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,1,1,1,0], [1,0,0,0,0],
          [0,1,1,1,0], [0,0,0,0,1], [1,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 't':
        out=[
          [0,1,0,0,0], [0,1,0,0,0], [1,1,1,0,0], [0,1,0,0,0],
          [0,1,0,0,0], [0,1,0,0,1], [0,0,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'u':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,0,0,1], [1,0,0,1,1], [0,1,1,0,1], [0,0,0,0,0]
        ];
        break;
       case 'v':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,0,0,1], [0,1,0,1,0], [0,0,1,0,0], [0,0,0,0,0]
        ];
        break;
       case 'w':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,1,0,1], [1,0,1,0,1], [0,1,0,1,0], [0,0,0,0,0]
        ];
        break;
       case 'y':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,1], [1,0,0,0,1],
          [0,1,1,1,1], [0,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'x':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,1], [0,1,0,1,0],
          [0,0,1,0,0], [0,1,0,1,0], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'z':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,1,1,1,1], [0,0,0,1,0],
          [0,0,1,0,0], [0,1,0,0,0], [1,1,1,1,1], [0,0,0,0,0]
        ];
        break;
       case 'A':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1],
          [1,1,1,1,1], [1,0,0,0,1], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'B':
        out=[
          [1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0],
          [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'C':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,0], [1,0,0,0,0],
          [1,0,0,0,0], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'D':
        out=[
          [1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'E':
        out=[
          [1,1,1,1,1], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,0],
          [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,1], [0,0,0,0,0]
        ];
        break;
       case 'F':
        out=[
          [1,1,1,1,1], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,0],
          [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case 'G':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,0], [1,0,1,1,1],
          [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,1], [0,0,0,0,0]
        ];
        break;
       case 'H':
        out=[
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,1],
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'I':
        out=[
          [0,1,1,1,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0],
          [0,0,1,0,0], [0,0,1,0,0], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'J':
        out=[
          [0,0,1,1,1], [0,0,0,1,0], [0,0,0,1,0], [0,0,0,1,0],
          [0,0,0,1,0], [1,0,0,1,0], [0,1,1,0,0], [0,0,0,0,0]
        ];
        break;
       case 'K':
        out=[
          [1,0,0,0,1], [1,0,0,1,0], [1,0,1,0,0], [1,1,0,0,0],
          [1,0,1,0,0], [1,0,0,1,0], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'L':
        out=[
          [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0],
          [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,1], [0,0,0,0,0]
        ];
        break;
       case 'M':
        out=[
          [1,0,0,0,1], [1,1,0,1,1], [1,0,1,0,1], [1,0,1,0,1],
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'N':
        out=[
          [1,0,0,0,1], [1,0,0,0,1], [1,1,0,0,1], [1,0,1,0,1],
          [1,0,0,1,1], [1,0,0,0,1], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'O':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'P':
        out=[
          [1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0],
          [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case 'Q':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,1,0,1], [1,0,0,1,0], [0,1,1,0,1], [0,0,0,0,0]
        ];
        break;
       case 'R':
        out=[
          [1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0],
          [1,0,1,0,0], [1,0,0,1,0], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'S':
        out=[
          [0,1,1,1,1], [1,0,0,0,0], [1,0,0,0,0], [0,1,1,1,0],
          [0,0,0,0,1], [0,0,0,0,1], [1,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'T':
        out=[
          [1,1,1,1,1], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0],
          [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,0,0,0]
        ];
        break;
       case 'U':
        out=[
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'V':
        out=[
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,0,0,1], [0,1,0,1,0], [0,0,1,0,0], [0,0,0,0,0]
        ];
        break;
       case 'W':
        out=[
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1],
          [1,0,1,0,1], [1,0,1,0,1], [0,1,0,1,0], [0,0,0,0,0]
        ];
        break;
       case 'X':
        out=[
          [1,0,0,0,1], [1,0,0,0,1], [0,1,0,1,0], [0,0,1,0,0],
          [0,1,0,1,0], [1,0,0,0,1], [1,0,0,0,1], [0,0,0,0,0]
        ];
        break;
       case 'Y':
        out=[
          [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,1,0,1,0],
          [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,0,0,0]
        ];
        break;
       case 'Z':
        out=[
          [1,1,1,1,1], [0,0,0,0,1], [0,0,0,1,0], [0,0,1,0,0],
          [0,1,0,0,0], [1,0,0,0,0], [1,1,1,1,1], [0,0,0,0,0]
        ];
        break;
       case ':':
        out=[
          [0,0,0,0,0], [0,1,1,0,0], [0,1,1,0,0], [0,0,0,0,0],
          [0,1,1,0,0], [0,1,1,0,0], [0,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case ';':
        out=[
          [0,0,0,0,0], [0,1,1,0,0], [0,1,1,0,0], [0,0,0,0,0],
          [0,1,1,0,0], [0,1,1,0,0], [0,0,1,0,0], [0,0,0,0,0]
        ];
        break;
       case '?':
        out=[
          [0,1,1,1,0], [1,0,0,0,1], [0,0,0,0,1], [0,0,0,1,0],
          [0,0,1,0,0], [0,0,0,0,0], [0,0,1,0,0], [0,0,0,0,0]
        ];
        break;
       case '<':
        out=[
          [0,0,0,1,0], [0,0,1,0,0], [0,1,0,0,0], [1,0,0,0,0],
          [0,1,0,0,0], [0,0,1,0,0], [0,0,0,1,0], [0,0,0,0,0]
        ];
        break;
       case '>':
        out=[
          [0,1,0,0,0], [0,0,1,0,0], [0,0,0,1,0], [0,0,0,0,1],
          [0,0,0,1,0], [0,0,1,0,0], [0,1,0,0,0], [0,0,0,0,0]
        ];
        break;
       case '+':
        out=[
          [0,0,0,0,0], [0,0,1,0,0], [0,0,1,0,0], [1,1,1,1,1],
          [0,0,1,0,0], [0,0,1,0,0], [0,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case '-':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [1,1,1,1,1],
          [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case '=':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [1,1,1,1,1], [0,0,0,0,0],
          [1,1,1,1,1], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case '(':
        out=[
          [0,0,0,1,0], [0,0,1,0,0], [0,1,0,0,0], [0,1,0,0,0],
          [0,1,0,0,0], [0,0,1,0,0], [0,0,0,1,0], [0,0,0,0,0]
        ];
        break;
       case ')':
        out=[
          [0,1,0,0,0], [0,0,1,0,0], [0,0,0,1,0], [0,0,0,1,0],
          [0,0,0,1,0], [0,0,1,0,0], [0,1,0,0,0], [0,0,0,0,0]
        ];
        break;
       case '!':
        out=[
          [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0],
          [0,0,1,0,0], [0,0,0,0,0], [0,0,1,0,0], [0,0,0,0,0]
        ];
        break;
       case '.':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0],
          [0,0,0,0,0], [0,1,1,0,0], [0,1,1,0,0], [0,0,0,0,0]
        ];
        break;
       case 'HTML5-0:0':
        out=[
          [0,0,0,0,0], [0,1,1,1,1], [0,1,1,1,1], [0,1,1,1,0],
          [0,1,1,1,0], [0,1,1,1,0], [0,0,1,1,0], [0,0,1,1,1]
        ];
        break;
       case 'HTML5-1:0':
        out=[
          [0,0,0,0,0], [1,1,1,1,1], [1,1,1,3,3], [0,0,0,0,0],
          [1,1,1,1,1], [1,1,1,3,3], [0,0,0,0,0], [1,1,1,3,0]
        ];
        break;
       case 'HTML5-0:1':
        out=[
          [0,0,1,1,1], [0,0,0,1,0], [0,0,0,1,1], [0,0,0,1,1],
          [0,0,0,0,1], [0,0,0,0,1], [0,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case 'HTML5-1:1':
        out=[
          [1,1,1,3,0], [1,1,1,3,0], [0,1,1,0,3], [1,0,0,3,3],
          [1,1,1,3,1], [1,1,1,1,1], [0,1,1,1,0], [0,0,0,0,0]
        ];
        break;
       case 'HTML5-2:0':
        out=[
          [0,0,0,0,0], [1,1,1,1,0], [3,3,1,1,0], [3,3,1,1,0],
          [3,3,1,1,0], [3,3,1,1,0], [3,1,1,0,0], [3,1,1,0,0]
        ];
        break;
       case 'HTML5-2:1':
        out=[
          [3,1,1,0,0], [1,1,0,0,0], [1,1,0,0,0], [1,1,0,0,0],
          [1,0,0,0,0], [1,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]
        ];
        break;
       case '|':
        out=[
          [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0],
          [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,0,0,0]
        ];
        break;
      default:
       case 'SPACE':
       case ' ':
        out=[
          [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0],
          [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]
        ];
        break;
      }
      return out;
    }
  };

  
};

