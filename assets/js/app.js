//Globals
var jigsawController; //This will be an instance of JigsawController class when page is loaded
var grid; //This will be an instance of Grid class
var player; //This will be an instance of Player class
var moveTable; //This will be an instance of moveTable class
var stopWatch; //This will be an instance of stopWatch class

//Class JigsawController
function JigsawController() {
    // Game Settings Variables
    var cellType; //It determines the cell and piece types which are photographic and numeric
    var cellNumber; //Total cells and pieces number
    var choosenPiece; //Id of clicked piece 
    var columnSize;
    var edgeLength;
    var gameContainer; //It is the DOM element(#gameContainer) which contains all game components
    var gameResult; //It works as enumeration: 0 = Lost, 1 = Win, 2 = Continue 
    var imgSource; 
    var loop; //It is game loop
    var pieceArray; //It uses to assign the event listeners to every piece
    var rowSize;
    var screenSize;
};

//Methods of the JigsawController Class 
    
    /*** Main Menu Methods ***/

    JigsawController.prototype.clickRestartButton = function () {
        playSound( SOUND_TRANS , .8 );
        this.cleanGameContainer();

        document.getElementById("board").style.display = 'none'; //Hide timer and move board
        document.getElementById("startMenu").style.display = 'block'; //Show start menu     
        
        this.swapScreen("startMenu","finalScreen");
        
        document.getElementById("settings").style.display = 'block'; //Show settings  
    };

    JigsawController.prototype.clickSaveButton = function () {
        this.swapScreen("startMenu","settings");
        playSound( SOUND_TRANS , .8 );
    };

    JigsawController.prototype.clickSettingsButton = function () {
        this.swapScreen("settings","startMenu");
        playSound( SOUND_TRANS , .8 );
    };

    JigsawController.prototype.clickStartButton = function () {
        playSound( SOUND_TRANS , .8 );
        this.setGameValues();  //Assign the game settings

        document.getElementById("startMenu").style.display = 'none'; //Hide start menu
        document.getElementById("settings").style.display = 'none'; //Hide settings
        
        this.screenSize = this.getAvailableScreenSize();
        this.cellNumber = this.rowSize * this.columnSize;
        this.resizeGameContainer();

        if(this.cellType == "Photographic")
            this.setRandomImageSource();

        this.loop();
    };

    JigsawController.prototype.swapScreen = function (first,second) {
        document.getElementById(second).className = "fadeOutUp animated";
        document.getElementById(second).style.display = 'none';
        document.getElementById(first).className = "fadeInDown animated";
        document.getElementById(first).style.display = 'block';
    };//-->This method provides to pass one screen to another

    JigsawController.prototype.setGameValues = function () {
        this.cellType = document.getElementById("cellType").value;
        this.columnSize = parseInt(document.getElementById("columnSize").value);
        this.rowSize = parseInt(document.getElementById("rowSize").value); 
        this.edgeLength = parseInt(document.getElementById("edgeLength").value);
    };//--> This method assigns the game settings

    /*--- End of Main Menu Methods ---*/



    /*** Game Container Creation Methods ***/

    JigsawController.prototype.cleanGameContainer = function() {
        while (this.gameContainer.firstChild) {
            this.gameContainer.removeChild(this.gameContainer.firstChild);
        }
    };//--> This method clean the Game Container to restart the game

    JigsawController.prototype.createGrid = function() {
        var gridW = this.columnSize * this.edgeLength;
        var gridH = this.rowSize * this.edgeLength;
        var gridX = Math.round((this.screenSize.w - gridW) / 2); //Calculate the y point for grid to center
        var gridY = Math.round((this.screenSize.h - gridH) / 2); //Calculate the x point for grid to center       
       
        grid = new Grid(gridW,gridH,gridX,gridY); //Create a instance of Grid class
    };//--> This method creates an instance of Grid class

    JigsawController.prototype.generateCells = function() {  
        var startPointX = grid.getX();
        var startPointY = grid.getY();
        var gridWidth = grid.getWidth() + startPointX;
        var gridHeight = grid.getHeight() + startPointY;
        var currentX = startPointX;
        var currentY = startPointY;

        for(var i = 1; i <= this.cellNumber; i++) {
            if(currentX == gridWidth) {
                currentY += this.edgeLength;
                currentX = startPointX;
            }
            grid.cells[i] = new Cell(i, currentX, currentY, this.cellType, this.edgeLength); //Create an instance of cell class inside grid.cells object
            currentX += this.edgeLength;
        }
    };//--> This method generates cells' instances

    JigsawController.prototype.generatePieces = function() {
        var randCoordinate = this.getRandomXY();

        for(var i = 1; i <= this.cellNumber; i++) {
            do {
                randCoordinate = this.getRandomXY();
            }
            while (this.isOverlappedWithGrid(randCoordinate) || this.isOverlappedWithOthers(randCoordinate)); //If the coordinate is not overlapped with grid and other pieces
    
            grid.pieces[i] = new Piece(i, randCoordinate.x, randCoordinate.y, this.cellType, this.edgeLength); //Creates an instance of piece class
        }
    };//--> This method generates pieces' instances

    JigsawController.prototype.resizeGameContainer = function() {
        this.gameContainer = document.getElementById("gameContainer");
        this.gameContainer.style.height = this.screenSize.h + "px";
        this.gameContainer.style.width = this.screenSize.w + "px";

        var board = document.getElementById("board");
        board.style.display = "block";
        board.style.left = parseInt((this.screenSize.w - 330) / 2) + "px"; //Center the board which contains timer and moves counter
    };//--> This method gives width and height of #gameContainer dynamically and shows board, when page is loaded

    /*--- End of Game Container Creation Methods ---*/



    /*** Drag and Drop Methods ***/

    JigsawController.prototype.startEvents = function() {
        var allPieces = document.getElementsByClassName('piece'); //Get all dom elements of pieces on screen
        var that = this; //Scope fixing
        var firstClick = false;

        this.pieceArray = new Array(); //It contains all pieces for creating event listener for every pieces
        this.gameResult = 2; //Set gameResult as continues
        this.choosenPiece = -1; //At the beginning of the game, there is no clicked piece

        for(var i = 0; i < allPieces.length; i++) {
            this.pieceArray[i] = allPieces[i];    

            this.pieceArray[i].addEventListener("mousedown",function(e) {
                e.preventDefault();
                
                if(firstClick == false){
                        that.startGameContainerEvents(); //Game containers events are started after the first click
                        firstClick = true; 
                }

                if(moveTable.getMoveNumber() > 0 && that.gameResult == 2) {
                    var p = that.getPieceObject(parseInt(this.id)); //Get object reference of dom element of clicked piece
                    that.choosenPiece = p.getId(); //Id of clicked piece
                    p.moveActive(); //Now, piece can be moved
                }
            },false);//--> Create event listener functions dynamically for every piece
        }
    };//--> This method starts all drag and drop events of the game

    JigsawController.prototype.startGameContainerEvents = function() {
        var that = this; //Scope fixing

        this.gameContainer.addEventListener("mousemove",function(e) {
            e.preventDefault();
            
            if(moveTable.getMoveNumber() > 0  &&  that.gameResult == 2) { //If the previous piece is the correct cell
                if(that.choosenPiece > 0) {
                    var p = that.getPieceObject(that.choosenPiece); //Get object of piece dom element

                    if(that.isInGameContainer(p)) {
                        p.movePassive();
                    }

                    that.isInGameContainer(p);
                    that.isOverlappedOnMove(p);

                    if(p.getOnMove() == true && p.getMoveable() == true){
                        var pos = that.getMousePosition(e);
                        pos.x -= (that.edgeLength / 2);
                        pos.y -= (that.edgeLength / 2);

                        that.changePosition(p.getId(), pos.x, pos.y);

                        p.x = pos.x; //Set new x point to piece object
                        p.y = pos.y; //Set new y point to piece object
                    }
                }
            }
        },false);

        this.gameContainer.addEventListener("mouseup",function(e) {
            e.preventDefault();
            
            if(moveTable.getMoveNumber() > 0  && that.gameResult == 2) {
                if(that.choosenPiece > 0) {
                    playSound( SOUND_DROP , 1. );
                    moveTable.updateMoveNumber(); //Move number is decreased 
                    moveTable.updateMoveTable(); //Score board is updated

                    var p = that.getPieceObject(that.choosenPiece); //Get piece object reference of clicked piece
                    var c = that.getCellObject(that.choosenPiece); //Get cell object reference of cell of clicked piece
                    
                    p.movePassive(); //Now piece can not be moved
                    
                    var mCoordinates = new Object(); //This object is used for checking that is the piece in the right cell according to mouse coordinates?
                    
                    mCoordinates.x = that.getMousePosition(e).x; 
                    mCoordinates.y = that.getMousePosition(e).y;

                    if(that.isInGrid(mCoordinates)) {
                        if(that.isInCell(mCoordinates, c)) {
                            p.becomeComplete();
                            c.becomeComplete();

                            p.setX(c.getX()); 
                            p.setY(c.getY());

                            that.changePosition(p.getId(), p.getX(), p.getY());

                            document.getElementById(p.getId()).className += " pieceCorrect";

                            delete grid.pieces[p.getId()]; //If piece is on right cell, delete for not to check any overlapped with other piece in grid
                        }
                        else {
                            var randCoordinate = that.getRandomXY();

                            do {
                                randCoordinate = that.getRandomXY();
                            }
                            while (that.isOverlappedWithGrid(randCoordinate) || that.isOverlappedWithOthers(randCoordinate));

                            that.changePosition(p.getId(), randCoordinate.x, randCoordinate.y);  //Move the piece out of the grid, If the piece is on the wrong piece 
                        }
                    }
                }
            }

            that.choosenPiece = -1; //When piece is released, there is no clicked piece
        },false);
     };

     /*--- End of Drag and Drop Methods ---*/



    /*--- Helper Methods ---*/

    JigsawController.prototype.calculateScore = function() {
        var totalTime = stopWatch.getTotalSeconds();
        var leftMoves = moveTable.getMoveNumber();
        var initialTime = 60 - this.cellNumber; //If every piece is placed
        var initialMoves = this.cellNumber;
        var score = parseInt((totalTime / initialTime) * 500 + (leftMoves / initialMoves) * 500);

        return score;
    };

    JigsawController.prototype.changePosition = function(id, x, y) {
        document.getElementById(id).style.left = x + "px";
        document.getElementById(id).style.top = y + "px";
    };//--> This method draws the object again whose id is given

    JigsawController.prototype.checkEndGame = function() {
        for(var cell in grid.cells) {
            var c = grid.cells[cell];

            if(c.isComplete != true)
                return false;
        }
        return true;
    };//--> This method checks the all cells, If all of them are completed, It return true

    JigsawController.prototype.drawFinalScreen = function() {
        var gc = this.screenSize;

        gc.w = (gc.w - 900) / 2;
        gc.h = (gc.h - 450) / 2;

        var finalDiv = document.getElementById("finalScreen");
        var finalResult = document.getElementById("gameResult");
        var finalResultImage = document.getElementById("resultImage");
        var score = document.getElementById("playerScore"); 

        finalDiv.style.top = gc.h + "px";
        finalDiv.style.left = gc.w + "px";
        finalDiv.style.display = 'block';
        finalDiv.className = "fadeInDown animated";

        finalResult.innerHTML = (this.gameResult == 1) ? 'You Win!' : 'Game Over!';
        finalResultImage.style.backgroundPosition = (this.gameResult == 1) ? '0 0' : '0 -133px';
        score.innerHTML = player.getPlayerScore();
    };//--> This method draws the result of the game to screen

    JigsawController.prototype.gameLoop = function() {
        if(stopWatch.getTotalSeconds() == 0) {
            this.gameResult = 0; //Lost
            playSound( SOUND_LOSE , .8 );
            player.setScore(0);
            this.drawFinalScreen();
        }
        else if(stopWatch.getTotalSeconds() == 10) {
            playSound( SOUND_WARNING , 1. );
            document.getElementById("timer").className = "timer warning";
            
        }
        else if(this.checkEndGame()) {
            this.gameResult = 1; //Win
            playSound( SOUND_WIN , .8 );
            player.setScore(this.calculateScore());
            this.drawFinalScreen();
        }
        else if(moveTable.getMoveNumber() == 0) {
            this.gameResult = 0; //Lost
            playSound( SOUND_LOSE , .8 );
            player.setScore(0);
            this.drawFinalScreen();
        }

        if(this.gameResult == 1 || this.gameResult == 0) {
            stopWatch.stop();
            clearInterval(this.loop);
        }
    };//--> This method determines the game according to move number, time, pieces and cells
    
    JigsawController.prototype.getAvailableScreenSize = function() {
        var screenW = $(window).width();
        var screenH = $(window).height();

        return {w: screenW, h: screenH};
    }; 

    JigsawController.prototype.getCellObject = function(id) {
        for(var key in grid.cells){
            if(grid.cells[key].id === id){
                return grid.cells[key];
            }
        }
    };//--> This method returns the cell object which has the id in parameter of the method, It is used for interaction between DOM elements and cell objects

    JigsawController.prototype.getColumnSize = function() {
        return this.columnSize;
    };

    JigsawController.prototype.getImageSource = function() {
        return this.imgSource;
    };

    JigsawController.prototype.getMousePosition = function(e) {
        var mouseX; 
        var mouseY;
        
        if (!e) e = window.event || Event;

        if (typeof(e.pageY) == "number"){
            mouseX = e.pageX;
            mouseY = e.pageY;
        }
        else{
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
 
        return {x: mouseX, y: mouseY};
    };//--> This method returns the x and y coordinates of mouse

    JigsawController.prototype.getObjectSize = function(object) {
        var size = 0;

        for(var key in object){
            size++;
        }
        return size;
    };//--> This method returns the size of object which is given, It is written that IE 9 does not support Object.keys().length 

    JigsawController.prototype.getPieceObject = function(id) {
        for(var key in grid.pieces){
            if(grid.pieces[key].id === id){
                return grid.pieces[key];
            }
        }
    };//--> This method returns the piece object which has the id in parameter of the method, It is used for interaction between DOM elements and piece objects

    JigsawController.prototype.getRandomArbitrary = function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };//--> This method returns coordinates between the given min and max numbers

    JigsawController.prototype.getRandomXY = function() {
        var screenWidth = this.screenSize.w;
        var screenHeight = this.screenSize.h;
        var randX = this.getRandomArbitrary(25,(screenWidth - this.edgeLength) - 25);
        var randY = this.getRandomArbitrary(75,(screenHeight - this.edgeLength) - 25);

        return { x: randX, y:randY };
    };//--> This method returns random coordinates, according to available screen size

    JigsawController.prototype.isInCell = function(pieceCoord, cell) {
        var c = cell;
        var pCoord = pieceCoord;

        if((c.getX() <= pCoord.x && pCoord.x <= (c.getX() + c.getEdgeLength())) && (c.getY() <= pCoord.y && pCoord.y <= (c.getY() + c.getEdgeLength())))
            return true;
        else
            return false;
    };//--> This method checks piece and If piece is in the cell, It returns true 

    JigsawController.prototype.isInGameContainer = function(piece) {
        var gc = this.screenSize; //Game Container

        if(!(piece.getX() >= 15 && (piece.getX() + piece.getEdgeLength()) <= (gc.w - 15) && piece.getY() >= 51 && (piece.getY() + piece.getEdgeLength()) <= (gc.h - 15))) 
            this.overlappedGameContainer(piece);
    };//This method checks piece and If piece is coming closer to out of Game Container, It block the piece

    JigsawController.prototype.isInGrid = function(pieceCoord) {
        var g = grid;
        var pCoord = pieceCoord;

        if((g.getX() <= pCoord.x && pCoord.x <= (g.getX() + g.getWidth())) && (g.getY() <= pCoord.y && pCoord.y <= (g.getY() + g.getHeight())))
            return true;
        else
            return false;
    };//This method checks piece and If piece is in grid, It returns true

    JigsawController.prototype.isOverlappedOnMove = function(piece) {
        var pCoord = new Object();
        pCoord.x = piece.getX();
        pCoord.y = piece.getY();

        for(var pie in grid.pieces) {
            var p = grid.pieces[pie];

            if(p.id != piece.getId()) {
                if(this.isOverlappedWithPiece(pCoord, p)) {
                    piece.movePassive();
                    this.overlappedZone(piece, p);
                }
            }
        }
    };//--> This method checks any overlapped with other pieces while the piece is moving

    JigsawController.prototype.isOverlappedWithGrid = function(pieceCoord) {
        var g = grid;
        var p = pieceCoord;

        if((p.x + this.edgeLength) < g.getX()  || (g.getX() + g.getWidth()) < p.x || (p.y + this.edgeLength) < g.getY() || (g.getY() + g.getHeight()) < p.y)
            return false;
        else
            return true;
    };//--> This method checks availability of coordinates, according to grid, It is used for generating pieces   

    JigsawController.prototype.isOverlappedWithOthers = function(pieceCoord) {
        if(this.getObjectSize(grid.pieces) > 0) {
            for (var piece in grid.pieces) {
                var piece = grid.pieces[piece];
        
                if(this.isOverlappedWithPiece(pieceCoord, piece))
                    return true;
            }
            return false;
        }
        else {
            return false;
        }
    };//--> This method checks availability of coordinates, according to other pieces, It is used for generating pieces 

    JigsawController.prototype.isOverlappedWithPiece = function(pieceCoord, piece) {
        var p1 = pieceCoord;
        var p2 = piece;

        if((p1.x + this.edgeLength) < p2.getX()  || (p2.getX() + p2.getEdgeLength()) < p1.x || (p1.y + this.edgeLength) < p2.getY() || (p2.getY() + p2.getEdgeLength()) < p1.y)
            return false;
        else
            return true;
    };//--> This method checks availability of coordinates, according to the piece which is given as a parameter, It is used for generating pieces 

    JigsawController.prototype.loop = function() {
        var that = this; //Scope Fixing
        
        this.loop = setInterval(function(){ 
            that.gameLoop();
        } , 1000);
    };
    
    JigsawController.prototype.overlappedGameContainer = function(piece) {
        var gc = this.screenSize;

        if(piece.getOnMove() == true) {
            piece.movePassive();
        }

        if(piece.getX() <= 15 && piece.getY() <= 51) {
            //Overlapped Zone: Top Left
            piece.setX(piece.getX() + piece.getEdgeLength() / 4);
            piece.setY(piece.getY() + piece.getEdgeLength() / 4);
            this.changePosition(piece.getId(), piece.getX(), piece.getY());
        } 
        else if((piece.getX() + piece.getEdgeLength()) >= (gc.w - 15) && piece.getY() <= 51) {
            //Overlapped Zone: Top Right
            piece.setX(piece.getX() - piece.getEdgeLength() / 4);
            piece.setY(piece.getY() + piece.getEdgeLength() / 4);
            this.changePosition(piece.getId(), piece.getX(), piece.getY());
        }
        else if(piece.getX() <= 15 && (piece.getY() + piece.getEdgeLength()) >= (gc.h - 15)) {
            //Overlapped Zone: Bottom Left
            piece.setX(piece.getX() + piece.getEdgeLength() / 4);
            piece.setY(piece.getY() - piece.getEdgeLength() / 4);
            this.changePosition(piece.getId(), piece.getX(), piece.getY());
        }   
        else if((piece.getX() + piece.getEdgeLength()) >=  (gc.w - 15) && (piece.getY() + piece.getEdgeLength()) >= (gc.h - 15)) {
            //Overlapped Zone: Bottom Right
            piece.setX(piece.getX() - piece.getEdgeLength() / 4);
            piece.setY(piece.getY() - piece.getEdgeLength() / 4);
            this.changePosition(piece.getId(), piece.getX(), piece.getY());
        }
        else if(piece.getX() <= 15) {
            //Overlapped Zone: Left
            piece.setX(piece.getX() + piece.getEdgeLength() / 4);
            this.changePosition(piece.getId(), piece.getX(), piece.getY());
        }
        else if(piece.getY() <= 51) {
            //Overlapped Zone: Top
            piece.setY(piece.getY() + piece.getEdgeLength() / 4);
            this.changePosition(piece.getId(), piece.getX(), piece.getY());
        }
        else if((piece.getX() + piece.getEdgeLength()) >= (gc.w - 15)) {
            //Overlapped Zone: Right
            piece.setX(piece.getX() - piece.getEdgeLength() / 4);
            this.changePosition(piece.getId(), piece.getX(), piece.getY());
        }
        else if((piece.getY() + piece.getEdgeLength()) >= (gc.h - 15)) {
            //Overlapped Zone: Bottom
            piece.setY(piece.getY() - piece.getEdgeLength() / 4);
            this.changePosition(piece.getId(), piece.getX(), piece.getY());
        }
    };//--> This method is used for determined the overlapped zone and It blocks out of border 

    JigsawController.prototype.overlappedZone = function(piece1, piece2) {
        var xDiff;
        var yDiff;
        var that = this;

        xDiff = piece1.getX() - piece2.getX();
        yDiff = piece1.getY() - piece2.getY();

        if(xDiff > 0 && yDiff > 0) {
            //Overlapped Zone: Bottom Right
            piece1.setX(piece1.getX() + piece1.getEdgeLength() / 4);
            piece1.setY(piece1.getY() + piece1.getEdgeLength() / 4);
            that.changePosition(piece1.getId(), piece1.getX(), piece1.getY());
        }
        else if(xDiff < 0 && yDiff > 0) {
            //Overlapped Zone: Bottom Left
            piece1.setX(piece1.getX() - piece1.getEdgeLength() / 4);
            piece1.setY(piece1.getY() + piece1.getEdgeLength() / 4);
            that.changePosition(piece1.getId(), piece1.getX(), piece1.getY());
        }
        else if(xDiff > 0 && yDiff < 0) {
            //Overlapped Zone: Top Right
            piece1.setX(piece1.getX() + piece1.getEdgeLength() / 4);
            piece1.setY(piece1.getY() - piece1.getEdgeLength() / 4);
            that.changePosition(piece1.getId(), piece1.getX(), piece1.getY());
        }
        else {
            //Overlapped Zone: Top Left
            piece1.setX(piece1.getX() - piece1.getEdgeLength() / 4);
            piece1.setY(piece1.getY() - piece1.getEdgeLength() / 4);
            that.changePosition(piece1.getId(), piece1.getX(), piece1.getY());
        }
    };//--> This method is used for determined the overlapped zone and It blocks the overlapping between two pieces 

    JigsawController.prototype.setRandomImageSource = function() {
        var order = this.getRandomArbitrary(1,6);

        switch (order)
        {
            case 1: this.imgSource = "alan_turing";
                    break;
            case 2: this.imgSource = "albert_einstein";
                    break;
            case 3: this.imgSource = "eniac";
                    break;
            case 4: this.imgSource = "ada_lovelace";
                    break;
            case 5: this.imgSource = "maya";
                    break;
        }
    };//--> This method generates random image path

    /*--- End of Helper Methods ---*/


//Class Grid
function Grid(width,height,x,y) {
    var width;
    var height;
    var x;
    var y;
    this.cells = {}; //It is a singleton object, it contains cells
    this.pieces = {}; //It is a singleton object, it contains pieces

    this.initializer(width,height,x,y);
    this.draw(); 
};

//Methods of the Grid Class

    Grid.prototype.draw = function() {
        var gridDiv = document.createElement("div"); 
        
        gridDiv.id = "grid";   
        gridDiv.style.top = this.y + "px";
        gridDiv.style.left = this.x + "px";
        gridDiv.style.width = this.width + "px";
        gridDiv.style.height = this.height + "px"; 
        
        jigsawController.gameContainer.appendChild(gridDiv); 
    };

    Grid.prototype.getHeight = function() {
        return this.height;
    };

    Grid.prototype.getWidth = function() {
        return this.width;
    };

    Grid.prototype.getX = function() {
        return this.x;
    };

    Grid.prototype.getY = function() {
        return this.y;
    };

    Grid.prototype.initializer = function(width,height,x,y) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };

    

//Class Cell
function Cell(id,x,y,type,edgeLength) {
    var id;
    var x;
    var y;
    var type;
    var edgeLength;
    var isComplete;
    
    this.initializer(id,x,y,type,edgeLength);
    this.draw((this.x - grid.getX()), (this.y - grid.getY()));
};

//Methods of the Cell class
    
    Cell.prototype.becomeComplete = function() {
        this.isComplete = true;
    };

    Cell.prototype.draw = function(x,y) {
        var cellDiv = document.createElement("div"); 
        
        cellDiv.id = this.id + ".cell";
        cellDiv.className = "cell";
        cellDiv.style.top = y + "px";
        cellDiv.style.left = x + "px";
        cellDiv.style.width = this.edgeLength + "px"; //Cell will be exact width with 1 pixel border
        cellDiv.style.height = this.edgeLength + "px"; //Cell will be exact height with 1 pixel border

        document.getElementById("grid").appendChild(cellDiv);

        if(this.type == "Numeric") {
            cellDiv.style.backgroundColor = "#7DD7CF";  
            var number = document.createElement("p");
            var node = document.createTextNode(this.id);
            number.appendChild(node);
            number.className = "numeric";
            number.style.lineHeight = this.edgeLength + "px";       
            document.getElementById(this.id + ".cell").appendChild(number);
        }
        else {
            var picX = (parseInt(((this.id - 1) % jigsawController.getColumnSize()) * this.edgeLength) * -1);
            var picY = ((Math.floor(((this.id - 1) / jigsawController.getColumnSize()))  * this.edgeLength) * -1);
    
            cellDiv.style.background = "url(assets/img/photographic/" + jigsawController.getImageSource() + ".jpg)";
            cellDiv.style.backgroundPosition = picX + "px " + picY + "px";
            cellDiv.style.backgroundSize = grid.getWidth() + "px " + grid.getHeight() + "px";
        }
    };

    Cell.prototype.getEdgeLength = function() {
        return this.edgeLength;
    };

    Cell.prototype.getX = function() {
        return this.x;
    };

    Cell.prototype.getY = function() {
        return this.y;
    };

    Cell.prototype.initializer = function(id,x,y,type,edgeLength) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.edgeLength = edgeLength;
        this.isComplete = false;
    };



//Class Piece
function Piece(id,x,y,type,edgeLength) {
    var id;
    var x;
    var y;
    var type;
    var edgeLength;
    var moveable;
    var onMove;

    this.initializer(id,x,y,type,edgeLength);
    this.draw();
};

//Methods of the Piece class
    
    Piece.prototype.becomeComplete = function() {
        this.moveable = false;
    };

    Piece.prototype.draw = function() {
        var pieceDiv = document.createElement("div"); 
    
        pieceDiv.id = this.id;
        pieceDiv.className = "piece";
        pieceDiv.style.top = this.y + "px";
        pieceDiv.style.left = this.x + "px";
        pieceDiv.style.width = this.edgeLength + "px"; //Cell will be exact width with 1 pixel border
        pieceDiv.style.height = this.edgeLength + "px"; //Cell will be exact height with 1 pixel border

        jigsawController.gameContainer.appendChild(pieceDiv);

        if(this.type == "Numeric") {
            pieceDiv.style.backgroundColor = "#7DD7CF";  
            var number = document.createElement("p");
            var node = document.createTextNode(this.id);
            number.appendChild(node);
            number.className = "numeric";
            number.style.lineHeight = this.edgeLength + "px";       
            document.getElementById(this.id).appendChild(number);
        }
        else {
            var picX = (parseInt(((this.id - 1) % jigsawController.getColumnSize()) * this.edgeLength) * -1);
            var picY = ((Math.floor(((this.id - 1) / jigsawController.getColumnSize()))  * this.edgeLength) * -1);

            pieceDiv.style.background = "url(assets/img/photographic/" + jigsawController.getImageSource() + ".jpg)";
            pieceDiv.style.backgroundPosition = picX + "px " + picY + "px";
            pieceDiv.style.backgroundSize = grid.getWidth() + "px " + grid.getHeight() + "px";
        }
    };

    Piece.prototype.getEdgeLength = function() {
        return this.edgeLength;
    };

    Piece.prototype.getId = function() {
        return this.id;
    };

    Piece.prototype.getMoveable = function() {
        return this.moveable;
    };

    Piece.prototype.getOnMove = function() {
        return this.onMove;
    };

    Piece.prototype.getX = function() {
        return this.x;
    };
    
    Piece.prototype.getY = function() {
        return this.y;
    };

    Piece.prototype.initializer = function(id,x,y,type,edgeLength) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.edgeLength = edgeLength;
        this.moveable = true;
        this.onMove = false;
    };

    Piece.prototype.moveActive = function() {
        this.onMove = true;
    };

    Piece.prototype.movePassive = function() {
        this.onMove = false;
    };

    Piece.prototype.setX = function(x) {
        this.x = x;
    };

    Piece.prototype.setY = function(y) {
        this.y = y;
    };
    


//Class Player    
function Player() {
    var playerScore;
};

//Methods of the Player class

    Player.prototype.getPlayerScore = function() {
        return this.playerScore;
    };

    Player.prototype.setScore = function(score) {
        this.playerScore = score;
    };



//Class MoveTable
function MoveTable(moveNumber) {
    var moveNumberLeft;

    this.initializer(moveNumber);
    this.draw();
};

   //Methods of the MoveTable class

    MoveTable.prototype.draw = function() {
        var moveTableDiv = document.getElementById("scoreBoard");
        
        moveTableDiv.className = "scoreBoard";
        
        this.updateMoveTable();   
    };

    MoveTable.prototype.getMoveNumber = function() {
        return this.moveNumberLeft;
    };

    MoveTable.prototype.initializer = function(moveNumber) {
        this.moveNumberLeft = moveNumber;
    };

    MoveTable.prototype.updateMoveNumber = function() {
        if(this.moveNumberLeft > 0)
            this.moveNumberLeft -= 1;
    };

    MoveTable.prototype.updateMoveTable = function() {
        document.getElementById("scoreBoard").innerHTML = (this.moveNumberLeft != 0) ? this.moveNumberLeft + " Move(s) Left" : "No Move Left!";
    };



//Class StopWatch
function StopWatch (minutes, seconds) {
    var minutes;
    var seconds;
    var isStarted = false;
    var timer;

    this.start(minutes,seconds);
};
    
    //Methods of the StopWatch class

    StopWatch.prototype.draw = function() {
        var stopWatchDiv = document.getElementById('timer');
        
        stopWatchDiv.className = "timer";

        this.update();
    };

    StopWatch.prototype.getTotalSeconds = function() {
        return this.minutes * 60 + this.seconds ;
    };

    StopWatch.prototype.loop = function() {
        this.update();
        
        if(this.isStarted == true) {
            this.seconds -= 1;
                if(this.seconds <= 0){
                    if(this.minutes == 0) {
                        this.stop();
                    }
                    else {
                        this.seconds = 59;
                        this.minutes -= 1;
                    }
                }
        }
        else {
            clearInterval(this.timer);
        }
    };

    StopWatch.prototype.start = function(minutes,seconds) {
        this.minutes = minutes;
        this.seconds = seconds
        this.isStarted = true;
        this.draw(); //StopWatch is drawed
        var that = this; //Scope Fixing

        this.timer = setInterval(function(){ 
            that.loop();
        } , 1000);
    };

    StopWatch.prototype.stop = function() {
        this.isStarted = false;
    };

    StopWatch.prototype.update = function() {
        var string = (this.minutes  < 10 ? '0' + this.minutes  : this.minutes) + ':' + 
                     (this.seconds < 10 ? '0' + this.seconds : this.seconds);
        
        document.getElementById("timer").innerHTML = string;
    };



$(document).ready(function(){
    initApp();//Game sounds are initialized
    jigsawController = new JigsawController();//Controller of the game is created

    $("#startButton").click(function(e) {
        e.preventDefault();
        jigsawController.clickStartButton();
        jigsawController.createGrid();
        jigsawController.generateCells();
        jigsawController.generatePieces();

        stopWatch = new StopWatch(1,0); //Create an instance of StopWatch class 
        moveTable = new MoveTable(jigsawController.cellNumber * 2); //Create an instance of MoveTable class      
        player = new Player(); //Create an instance of Player class
        
        jigsawController.startEvents();
    });

    $("#settingsButton").click(function(e) {
        e.preventDefault();
        jigsawController.clickSettingsButton();
    });

    $("#saveButton").click(function(e) {
        e.preventDefault();
        jigsawController.clickSaveButton();
    });

    $("#restartButton").click(function(e) {
        e.preventDefault();
        jigsawController.clickRestartButton();
        delete jigsawController;
        jigsawController = new JigsawController();
    });
});
