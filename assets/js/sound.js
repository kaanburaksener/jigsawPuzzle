// SOUND SECTION
	
	//Audio variables
	var SOUND_WARNING = "warning";
   	var SOUND_DROP = "drop";
   	var SOUND_WIN = "win";
   	var SOUND_LOSE = "lose";
   	var SOUND_TRANS = "transition";

   	var MAX_SOUNDS= 20;
   	var STATE_LOADING;
   	var STATE_RESET;

	var soundPool = new Array();

	var warning, warning2, warning3;
	var drop, drop2, drop3;
	var win, win2, win3;
	var lose, lose2, lose3;
	var transition, transition2, transition3;

	//Audio Functions

	//This method loads the sounds into the sound pool and remove them from there
	function itemLoaded(event) {
	    loadCount++;

		if (loadCount >= itemsToLoad) {	
			warning.removeEventListener("canplaythrough",itemLoaded, false);
			warning2.removeEventListener("canplaythrough",itemLoaded, false);
			warning3.removeEventListener("canplaythrough",itemLoaded, false);

			drop.removeEventListener("canplaythrough",itemLoaded,false);
			drop2.removeEventListener("canplaythrough",itemLoaded,false);
			drop3.removeEventListener("canplaythrough",itemLoaded,false);

			win.removeEventListener("canplaythrough",itemLoaded,false);
			win2.removeEventListener("canplaythrough",itemLoaded,false);
			win3.removeEventListener("canplaythrough",itemLoaded,false);

			lose.removeEventListener("canplaythrough",itemLoaded,false);
			lose2.removeEventListener("canplaythrough",itemLoaded,false);
			lose3.removeEventListener("canplaythrough",itemLoaded,false);

			transition.removeEventListener("canplaythrough",itemLoaded,false);
			transition2.removeEventListener("canplaythrough",itemLoaded,false);
			transition3.removeEventListener("canplaythrough",itemLoaded,false);

			soundPool.push({name:"warning", element:warning, played:false});
			soundPool.push({name:"warning", element:warning2, played:false});
			soundPool.push({name:"warning", element:warning3, played:false});

			soundPool.push({name:"drop", element:drop, played:false});
			soundPool.push({name:"drop", element:drop2, played:false});
			soundPool.push({name:"drop", element:drop3, played:false});

			soundPool.push({name:"win", element:win, played:false});
			soundPool.push({name:"win", element:win2, played:false});
			soundPool.push({name:"win", element:win3, played:false});

			soundPool.push({name:"lose", element:lose, played:false});
			soundPool.push({name:"lose", element:lose2, played:false});
			soundPool.push({name:"lose", element:lose3, played:false});

			soundPool.push({name:"transition", element:transition, played:false});
			soundPool.push({name:"transition", element:transition2, played:false});
			soundPool.push({name:"transition", element:transition3, played:false});

			appState = STATE_RESET;
 		}
	}	

	//This method creates the HTML5 audio elements and initialize them
	function initApp() {
		loadCount=0;
		itemsToLoad = 20;
		
		warning = document.createElement("audio");
		document.body.appendChild(warning);
		warning.setAttribute("src", "assets/sounds/warning.ogg");
		warning.addEventListener("canplaythrough",itemLoaded,false);
		
		warning2 = document.createElement("audio");
		document.body.appendChild(warning2);
		warning2.setAttribute("src", "assets/sounds/warning.ogg");
		warning2.addEventListener("canplaythrough",itemLoaded,false);
		
		warning3 = document.createElement("audio");
		document.body.appendChild(warning3);
		warning3.setAttribute("src", "assets/sounds/warning.ogg");
		warning3.addEventListener("canplaythrough",itemLoaded,false);

		drop = document.createElement("audio");
		document.body.appendChild(drop);
		drop.setAttribute("src", "assets/sounds/drop.ogg");
		drop.addEventListener("canplaythrough",itemLoaded,false);
		
		drop2 = document.createElement("audio");
		document.body.appendChild(drop2);
		drop2.setAttribute("src", "assets/sounds/drop.ogg");
		drop2.addEventListener("canplaythrough",itemLoaded,false);
		
		drop3 = document.createElement("audio");
		document.body.appendChild(drop3);
		drop3.setAttribute("src", "assets/sounds/drop.ogg");
		drop3.addEventListener("canplaythrough",itemLoaded,false);

		lose = document.createElement("audio");
		document.body.appendChild(lose);
		lose.setAttribute("src", "assets/sounds/lose.ogg");
		lose.addEventListener("canplaythrough",itemLoaded,false);
		
		lose2 = document.createElement("audio");
		document.body.appendChild(lose2);
		lose2.setAttribute("src", "assets/sounds/lose.ogg");
		lose2.addEventListener("canplaythrough",itemLoaded,false);
		
		lose3 = document.createElement("audio");
		document.body.appendChild(lose3);
		lose3.setAttribute("src", "assets/sounds/lose.ogg");
		lose3.addEventListener("canplaythrough",itemLoaded,false);

		transition = document.createElement("audio");
		document.body.appendChild(transition);
		transition.setAttribute("src", "assets/sounds/transition.ogg");
		transition.addEventListener("canplaythrough",itemLoaded,false);
		
		transition2 = document.createElement("audio");
		document.body.appendChild(transition2);
		transition2.setAttribute("src", "assets/sounds/transition.ogg");
		transition2.addEventListener("canplaythrough",itemLoaded,false);
		
		transition3 = document.createElement("audio");
		document.body.appendChild(transition3);
		transition3.setAttribute("src", "assets/sounds/transition.ogg");
		transition3.addEventListener("canplaythrough",itemLoaded,false);

		appState = STATE_LOADING;
	}

	//This method resets the appState in audio aspect
	function resetApp() {
		appState = STATE_PLAYING;
	};

 	//This method plays the sound which is been selected to play.
    function playSound(sound,volume,bolean) {
		var soundFound = false;
		var soundIndex = 0;
		var tempSound;

		if (soundPool.length> 0) {
			while (!soundFound && soundIndex < soundPool.length) {
				var tSound = soundPool[soundIndex];
				
				if ((tSound.element.ended || !tSound.played) && tSound.name == sound) {
					soundFound = true;
					tSound.played = true;
				} 
				else {
					soundIndex++;
		 		}
			}
		}
		
		if (soundFound) {			
			tempSound = soundPool[soundIndex].element;
			tempSound.volume = volume;
			tempSound.play();
			tempSound.loop=bolean;
		} 
		else if (soundPool.length < MAX_SOUNDS){
			tempSound = document.createElement("audio");
			tempSound.setAttribute("src", "assets/sounds/"+ sound + "." + "ogg");
			tempSound.volume = volume;
			tempSound.play();
			tempSound.loop=bolean;
			soundPool.push({name:sound, element:tempSound, type:"ogg", played:true});
		}	
	};

	


