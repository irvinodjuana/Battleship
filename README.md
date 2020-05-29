# Battleship
🚢 Battleship game and AI in JavaScript

Play the game here: https://irvinodjuana.github.io/Battleship/

## Overview
Battleship is traditionally a 2-player game in which the players arrange 5 ships of various lengths on a 10x10 board which are hidden to each other. They then alternate choosing coordinates to place "shots" and receive indicators of whether their shots resulted in a "hit", "miss", or "sink". 

In this online version, you can instead play against a program set to Easy, Medium, or Hard, and select shots on the screen by clicking on the grid with your cursor. You can arrange your board quickly by clicking "Randomize" until you see a configuration you like and skip the normally tedious part of arranging your ships manually. Once you start, you can see which ships are still in play on the left and right panels.

Good luck and have fun!

## AI Strategies
The primary motivation of this project was to implement some of the various automated battleship strategies for fun. The web page mostly exists just because my friends don't typically like to play games through the command line. 

These strategies are heavily inspired by this blog post: http://datagenetics.com/blog/december32011/index.html 

- Easy: Randomly choose coordinates without repetition
- Medium: Search randomly until hit found - then, conduct depth-first search, recursing if node is another hit
- Hard: Estimate likelihood of each cell containing a ship by "density" - iterating through each remaining ship and incrementing a counter for all possible locations

## Screenshots
<img width="1440" alt="Selection Phase" src="https://user-images.githubusercontent.com/42985539/83218651-33034100-a123-11ea-8692-1596f67c0334.png">
<img width="1440" alt="Play Phase" src="https://user-images.githubusercontent.com/42985539/83218737-68a82a00-a123-11ea-8c49-fa713aa6970f.png">
<img width="1440" alt="Win Phase" src="https://user-images.githubusercontent.com/42985539/83218664-3c8ca900-a123-11ea-962a-ae605ed9e1bb.png">



