---
title: How to Play Mulligan
date: 2024-03-19
---

## Introduction

Mulligan is a card game that blends strategy with social negotiation
as each player tries to navigate a series of trades and auctions to
try and get the best hand possible by the end of the game, without
accidentally giving an opponent exactly what they need to beat you.
The game is best played with three to six people, but it works with
any number greater than one.

Mulligan is a game I created myself when I was bored one day and
couldn't find any fun card games. I'm sure it has a lot of glaring
flaws, but it was made in under 24 hours, and so far I've found it
pretty fun, and I'm very open to feedback to improve it.

## Setup

At the start of the game, each player is drawn a hand of 5 cards. You
never reveal your hand to the other players. The remaining cards are
placed in the middle of the table in the deck pile. Next to the deck
pile is the discard pile. This will start empty. In a circle around
the deck and discard piles is the trade ring. The trade ring begins
empty as well. Each round each player will present a single card on
the trade ring. Once the hands have been dealt and the remaining cards
placed in the deck pile, pick somebody to take the first turn.

## The Game Loop

On each turn, whoever's turn it is (the 'active player') gets the
choice of three action. The player may skip, auction, or fold. Skip is
fairly self explanatory. If the player chooses to skip, then control
is immediately transferred to the next player, and it becomes their
turn.

### Auction

Auctions are at the centre of this game, and are how players are able
to improve their decks. When a player chooses to auction, they select
a card from their hand, and place it face-up on the trade ring. This
card is called the auctioned card. At this point the player can no
longer choose to skip their turn. If they have auctioned a card on the
trading ring, they will not have that card at the end of the turn.

After, each player, except the active player, has to offer one of the
cards from their hand in exchange for the auctioned card. They place
their offer face down on the trading ring. After each player has
placed an offer on the trade ring, all of the offers are switched to
face-up position.

At this point, the active player has two choices. They can choose to
swap the auctioned card with one of the offers, or they can choose to
mulligan.

### Swap

If the active player chooses to swap, then all players, except the
active player and they player they swapped with, retrieves their
original card from the trading ring, and control moves to the next
player.

#### Mulligan

If the active player decides none of the offered cards will help them,
then they may choose to mulligan. In a mulligan, all cards in the
trading ring are sent to the discard pile, and each of the players are
drawn a new card. Cards in the discard pile are dead; they will never
circulate in the game again. After every player is drawn a new card,
the next player's turn begins.

### Fold

A fold is an action a player takes once they are happy with their
hand; they do not think they can get a better hand, and do not want to
risk being forced to lose a card they want. When a player folds, they
no longer participate in trades, and they no longer have a turn. They
have not lost the game, they have just finalised their hand.

## End States

There are two ways for the game to end. If all (but 1) players fold,
then the game ends and each player's hands are evaluated to determine
a winner. Alternatively, if there are no longer sufficient cards in
the deck pile to draw a new card for each player, then the game must
also end.

### 2 Players Remain

When there are only two players remaining that have not folded, the
game still functions as normal. The trade ring will just have a single
offer. Once either of these players fold, the game ends, and the other
player is also forced to fold.

### The Deck Nears Empty

Immediately after dealing cards following a mulligan, if there are no
longer enough cards to deal for every player, then the game ends. Any
leftover cards are revealed and then sent to the discard pile. If you
are playing with 2 or 4 players, then there will be no leftover cards,
and the game ends as soon as the deck is empty.

## Win Condition

Once the game has ended, all players that have not folded have their
hands frozen, and each player reveals their hand. The winner is the
player with the most valuable hand, just like in poker and many other
card games. Similarly, most of the hand evaluations are very similar
to poker.

### Hand Evaluation

The possible types of hands are as follows, in order of least valuable
to most valuable:

 - High Card: A single card. Your hand does not fit any of the other
   valid hands
 - Pair: Two cards of the same value.
 - Two Pair: Two pairs.
 - Low Straight: Four consecutive cards.
 - Three of a Kind: Three cards of the same value
 - Four of a Kind: Four cards of the same value
 - Full House: Two of the same card + Three of the same card
 - High Straight: Five consecutive cards.
 - Flush: Five cards of the same suit.
 - Straight Flush: Five consecutive cards, all of the
   same suit.

#### High Ace and Low Ace

As usual, an Ace can count as both as the lowest card, and as the
highest card. However it can only serve one of these rolls at once. By
default, it is a high ace, meaning it wins against any other high
cards. It only serves as a low ace in straights, where it may be
adjacent to a two. However, as it can only be low or high (and never
both), you cannot have a straight that goes from king, to ace, to two.

#### Card Value

If two players have the same type of hand, whichever hand has the
single highest valued card wins. Note that this only refers to to the
hand that makes up the type. If you have a three of a kind, as well as
an ace, then you cannot use that ace to win against another three of a
kind.

#### Suit Value

On the very rare occasion that two hands are of the same type and have
the same highest card, i.e. A low straight where each player has a
straight from three to six, then the suit of each highest card is
compared. This is rarely important but it does mean that some suits
are very slightly more valuable with others. In the example, whichever
of these two players has the six in the straight with the most
valuable suit wins

The suits values are as follows:

Spades > Hearts > Diamonds > Clubs
