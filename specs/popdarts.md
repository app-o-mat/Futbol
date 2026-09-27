# Pop Darts Game

This game is a 2d game that is based on pop darts. 

You have to throw a suction pop dart as close as you can to the big suction pop dart that is on a table.

The initial game setup is two players next to each other on the left and a table with a popdart in the center on the right.

To throw a popdart, you hold down the space key and a timing bar will show up. If you keep holding it down, it fills up. It starts red. When it is 75% filled it will be green. It goes from red to green in between and towards red after up until 100%. When the user lets go of the space bar, use the percent filled to calculate their aim. 75% is perfect. Then throw the dart based on their aim.

If you time it perfectly it will land on top of the big suction getting you 5 points. 

There are 4 rounds.

There are 4 rings around it to mark 4,3,2,1 points. 

This is a 2 player game. If you win, you get in-game currency based on what happens. The currency is called sprites and you get 10 for each win 5 for a draw and 0 for a loss.

## Plan

1. Make a popdartindex.html like cpsindex.html
2. Make a popdarts.js like cps.js but just the template, not the game
3. Put the two players on the left (one is red and one is green)
4. Put the table on the right
5. Put a suction (blue) in the center
6. Start with player one (put text to say whose turn it is)
7. Let the player throw their pop dart with space and the timing mechanism
8. Throw the dart based on the aim
9. Go to Player 2
10. Let them throw
11. Do 4 rounds
12. Give currency based on outcome
13. Start a new game (remember currency) - set points to 0