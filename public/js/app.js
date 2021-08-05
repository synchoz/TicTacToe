let socket = io();
const startButton = document.getElementById('startButton');
const allCells = document.querySelectorAll('.cell-grid');
const playGrid = document.querySelector('.play-grid');
const h2 = document.querySelector("h2");
const h1 = document.querySelector("h1");
const h3 = document.querySelector("h3");
startButton.disabled = true;
playGrid.style.display = 'none';
let currentPlayer = null;
h2.style.display = 'none';

socket.on('player2start',(data)=>
{
    if(player1 === data)//means that the second player just joined
    {
        console.log(data);
        console.log('this player should start the game');
        startButton.disabled = false;
        h3.innerHTML = "The second player is doing the turn now";
        //disable button click
        allCells.forEach(cell =>
            {
                cell.disabled = true;
            })
    }
    else
    {
        h3.innerHTML = "It is your turn now";
    }

    h3.style.display = "none";
});

socket.on("moves",(data)=> 
    {
        console.log(`${data}`);
        if(data)//means no moves left to do which means a tie
        {
            h1.style.display = "";
            h1.innerHTML = "It is a Tie!";
            h1.style.color = "red";
            h3.style.display = "none";
            setTimeout(() => {
                playGrid.style.display = "none";
                window.location.reload(false); //sends restart to server
              }, 7000);
        }
    })

allCells.forEach(cell => {
    cell.addEventListener('click', () =>
{
    socket.emit('clickCell',
    {
        cellToChange: cell.id, //sending the id to emit as a property
        playerClicked: player1 //will know in the server side which player clicked button
    })
})
});


socket.on("private message", (arg1,arg2)=>
{
    if(socket.id === arg1)
    {
        h2.innerHTML = arg2;
    }
})

socket.on("connect", () => {
        player1 = socket.id; // ojIckSD2jqNzOqIrAGzL
        currentPlayer = player1;
        console.log(`${player1} given id to player`)
  });

socket.on('clickCell', (data) =>
{
    hitThatCell(data.cellToChange); //reads the property and gets the object from DOM 
})


socket.on("hello",(msg,arg2) =>
{
    //console.log(`server sent hello ${arg2} has just choose cell`);
    cell.innerHTML = msg;
    //should say msg whos turn now
    if(player1 === arg2)
    {
        h3.innerHTML = "The second player is doing the turn now";
        //disable button click
        allCells.forEach(cell =>
            {
                cell.disabled = true;
            })
    }
    else
    {
        h3.innerHTML = "It is your turn now";
        //enable button click
        allCells.forEach(cell =>
            {
                cell.disabled = false;
            })
    }
    
})
socket.on("restart",() =>
{
    window.location.reload(false);
})

function hitThatCell(cellToChange,toChange)
{
    socket.on("winner",(data,indexNumber1,indexNumber2,indexNumber3) => //make a restart button which needs to refresh the moves array into empty one!
    {
        allCells.forEach(cell =>
            {
                if(cell.id ===`cell${indexNumber1}` ||cell.id ===`cell${indexNumber2}` || cell.id ===`cell${indexNumber3}`)
                {
                    cell.style.backgroundColor = "red";
                }
            })
        if(data === currentPlayer) //so each client knows which client lost and which client won the game
        {
            h1.innerHTML = "You Win the game!";
            h1.style.color = "green";
            h3.style.display = "none";
            socket.emit("gamefinish",`${currentPlayer}`);
            setTimeout(() => {
                window.location.reload(false); //can send as a seperate function()
              }, 5000);
        }
        else
        {
            allCells.forEach(cell =>
                {
                    cell.disabled = true;
                })
            h1.innerHTML = "You Lost the game!";
            h1.style.color = "red";
            h3.style.display = "none";
            setTimeout(() => { 
                window.location.reload(false);
              }, 5000);
        }
    })
    cell = document.getElementById(`${cellToChange}`); //makes the button have the X or the O 
}

startButton.addEventListener('click', () =>
{
    socket.emit('startGame')
})


socket.on('startGame',()=>
{
    hideStartButton();
})

function hideStartButton()
{
    h3.style.display = "";
    h2.style.display = "";
    startButton.style.display = "none";
    playGrid.style.display = "";//shows the playing grid
}