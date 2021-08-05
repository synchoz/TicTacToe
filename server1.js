const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '/../public')
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
let player1 = null;
let player2 = null;
let players = {};
let moves = ["", "", "","", "", "", "", "", ""];
let winner;
let playerTurn = 0;

app.use(express.static(publicPath));


server.listen(port, () =>
{
    console.log(`server is up on port ${port}`)
})


io.on('connection', (socket) =>
{
    if(player1 === null)
    {
        player1 = socket.id;
        console.log(` player1 is ->${socket.id}`)
        socket.emit("private message", socket.id,"You are playing with  X")
        //players[0] = socket.id;
    }
    else if(player2 === null)
    {
        player2 = socket.id;
        socket.emit("private message", socket.id,"You are playing with  O")
        console.log(` player2 is ->${socket.id}`)
        //players[1] = socket.id;

    }
    console.log('A user has Just connected.');
    let count2 = io.of("/").sockets.size;
    console.log(count2);
    if(count2 === 2)
    {
        io.emit('player2start',socket.id);
        socket.on('startGame', ()=>
        {
            io.emit('startGame',socket.id);//sending to the client that can start the game
            //socket.emit("playerTurn",(socket.id)); //refactor this!
        })
        
    }
    
    io.on('gamefinish', (data) =>
    {
        if(data == player1)
        {
            io.emit("private message", player2,"Player2 has just Won the game!")
        }
    })

    socket.on('clickCell', (data) =>
    {
        io.emit('clickCell',(data));
        console.log(`a cell has been clicked by ${data.playerClicked}`)

        let i = data.cellToChange.substr(data.cellToChange.length-1, data.cellToChange.length)
        let index = parseInt(i)
        
        if(moves[index] === "")
        {
            if(data.playerClicked == player1)
            {
                io.emit("hello", "X",player1);
                //socket.emit("playerTurn",(players[playerTurn]));
                if(playerTurn === 0)
                {
                    playerTurn++;
                }
                else{
                    playerTurn = 0;
                } 
                io.emit("turn","Player2");
                //data.playerTurnSign = "X";//useless
                moves[index] = "X";
            }
            else if(data.playerClicked == player2)
            {
                io.emit("hello", "O", player2 );
                //s socket.emit("playerTurn",(players[playerTurn]));
                if(playerTurn === 0)
                {
                    playerTurn++;
                }
                else{
                    playerTurn = 0;
                } 
                //data.playerTurnSign = "O";//useless
                moves[index] = "O";
            }
            console.log('server is trying to send playerTurn');
            
            var playerWin = false;
            for(let i = 0;i<3;i++)//check for column win
            {
                if((moves[i] !== "" && moves[i+3] !== "" && moves[i+6] !== "") && moves[i] == moves[i+3] && moves[i+3] == moves[i+6])
                {
                    playerWin = true;
                    //data.playerWon = true;
                    if(moves[i] == "X")
                    {
                        winner = player1;
                    }
                    else
                    {
                        winner = player2;
                    }
                    console.log('player has just won?');
                    io.emit("winner", winner,i,i+3,i+6);
                }
            }

            for(let i = 0;i<moves.length;i+=3)//check for column win
            {
                if((moves[i] !== "" && moves[i+1] !== "" && moves[i+2] !== "") && moves[i] == moves[i+1] && moves[i+1] == moves[i+2])
                {
                    playerWin = true;
                    //data.playerWon = true;
                    if(moves[i] == "X")
                    {
                        winner = player1;
                    }
                    else
                    {
                        winner = player2;
                    }
                    console.log('player has just won?');
                    io.emit("winner", winner,i,i+1,i+2);
                }
            }

            if((moves[0] !== "" && moves[4] !== "" && moves[8] !== "") && moves[0] == moves[4] && moves[4] == moves[8]) //diagonal win check
            {
                     playerWin = true;
                //data.playerWon = true;
                    if(moves[i] == "X")
                    {
                        winner = player1;
                    }
                    else
                    {
                        winner = player2;
                    }
                    console.log('player has just won?');
                    io.emit("winner", winner,0,4,8);
            }
            if((moves[2] !== "" && moves[4] !== "" && moves[6] !== "") && moves[2] == moves[4] && moves[4] == moves[6])//diagonal win check
            {
                    playerWin = true;
                    //data.playerWon = true;
                    if(moves[i] == "X")
                    {
                        winner = player1;
                    }
                    else
                    {
                        winner = player2;
                    }
                    console.log('player has just won?');
                    io.emit("winner", winner,2,4,6);
            }
            console.log(moves);

            var leftMoves = false;
            moves.forEach(element => {  //check if there is any moves left to do
                if(element === "")
                {
                    leftMoves = true;
                }
            });

            //data.playerWon = CheckForWin();
            if(leftMoves)//check for left moves i can refactor the function into the emit "moves"!
            {
                console.log("the player can still continue");
                io.emit("moves",false);
            }
            else if(playerWin === false)
            {
                console.log("no moves left need to announce for a tie!");
                io.emit("moves",true);
            }
        }
    })
    
/*     socket.on('restart', ()=>
    {
        io.emit("restart")//gets from 1 client and sends to the other so  we can start another game after a tie/win/loss
    }) */
    socket.on('disconnect', ()=>
    {
        moves = ["", "", "","", "", "", "", "", ""];
        count2--;
        if(socket.id === player1)
        {
            player1 = null;
        }
        else if(socket.id === player2)
        {
            player2 = null;
        }
        io.emit("restart")
        console.log('A user has just Disconnected.')
    })
}

);

