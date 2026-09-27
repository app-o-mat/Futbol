# Pop Darts Shop

This describes the shop feature for [Pop Darts](popdarts.md)

There is also a shop where you can make custom popdart suctions in the design you want but they cost in game currency.

One custom suction is 5 for basic colors including red green blue and black, 

For a mediocre one it costs 10 and you get red green blue black white yellow and for the best one it costs 30 you get those colors and including a shiny finish.

When you buy something, it uses your sprites and deducts from your balance if you have enough. After each round, the player with the most sprites can shop. There is a shop button on the screen upper right that shows up between games (but not when a game is started.)

# Plan 

1. Put a shop button on the screen if a game is not in progress.
2. When we load, the game is not in progress until player one goes
3. When the four rounds are over, the game is not in progress

If they click the shop button then
4. Hide the table when the shop is shown
5. Show all the popdart suctions that the player can afford.
6. The player can pick one or close the shop
6a. if they pick a popdart, then deduct sprites from their account and use the popdart in the game
7. When the shop is closed, show the table again.