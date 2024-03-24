---
title: How to Play Mulligan
date: 2024-03-24
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
placed face-down in the middle of the table in the *deck pile*. Next
to the *deck pile* is the *discard pile*. This will start empty.

In a circle around the *deck* and *discard piles* is the *trade ring*.
The *trade ring* begins empty as well. Each player has a single slot
on the *trade ring*, where they will place their *auctioned card*, or
their *offers* for somebody else's card.

Once the hands have been dealt and the remaining cards placed in the
*deck pile*, pick somebody to take the first turn.

## The Game Loop

On each turn, whoever's turn it is (the '*auctioneer*') gets the
choice of three actions. They may **Skip**, **Auction**, or **Fold**.
*Skip* is fairly self-explanatory. If the *auctioneer* chooses to
*Skip*, then their turn immediately ends, and the *active player* to
their left (clockwise) becomes the new *auctioneer*.

> To begin with, all players are '*active*'. *Inactive* players are
> explained later.

### Auction

Auctions are at the centre of this game, and are how players are able
to improve their hands. When the *auctioneer* chooses to *auction*,
they select a card from their hand, and place it face-up on the *trade
ring*. This card is called the *auctioned card*. At this point the
*auctioneer* can no longer choose to skip their turn. If they have
auctioned a card on the *trade ring*, they will not have that card at
the end of the turn.

After the *auctioned card* is presented, every other *active player*
must make an *offer* for the *auctioned card*; They place their
*offer* face down on the *trade ring*. After all *active players* have
a card on the *trade ring*, all of the *offers* are switched to
face-up position.

At this point, the *auctioneer* has two choices. They can choose to
**Swap** the *auctioned card* with one of the *offers*, or they can
choose to **Mulligan**.

### Swap

If the *auctioneer* chooses to *Swap*, Then they take one of the
*offers* from the *trade ring*, and place it in their hand. The player
they swapped with, takes the *auctioned card* and adds it to their
hand. All other active players retrieve their original *offer* from
the *trade ring* and return it their hand.

#### Mulligan

If the *auctioneer* decides none of the *offers* will help them,
then they may choose to *Mulligan*. In a *Mulligan*, all cards in the
trade ring are sent face-up to the *discard pile*, and each of the
players are drawn a new card from the *deck pile*. Cards in the
*discard pile* are dead; They will never circulate in the game again.

### Fold

A *Fold* is an action the *auctioneer* takes once they are happy with
their hand; They do not think they can get a better hand, and do not
want to risk being forced to lose a card. When the auctioneer folds,
as though they had chosen to skip their turn, their turn ends
immediately. After *folding*, a player becomes *innactive*. This means
that they no longer participate in auctions, they no longer have a
turn, and their hand becomes frozen for the rest of the game.

## End States

There are two ways for the game to end. If there are only two *active
players*, and one of them chooses to fold, then the game ends.
Alternatively, if there are no longer sufficient cards in
the deck pile to draw a new card for each *active player* (immediately
following a *Mulligan*), then the game must also end.

### 2 Players Remain

When there are only two *active players* remaining, the game still
functions as normal. The *trade ring* will just have a single *offer*.
Once either of these players fold, the game ends, and the other player
is also forced to fold.

### The Deck Nears Empty

Immediately after dealing cards following a mulligan, if there are no
longer enough cards in the *deck pile* to deal for every player, then
the game ends. Any left-over cards are revealed and then sent to the
*discard pile*.

## Win Condition

Once the game has ended, all players reveal their hands. The winner is
the player with the most valuable hand, just like in poker and many
other card games. Similarly, most of the hand evaluations are very
similar to poker.

### Hand Evaluation

The possible types of hands are as follows, in order of least valuable
to most valuable, with an example in brackets:

 - High Card: A single card. Your hand does not fit any of the other
   valid hands (♠A)
 - Pair: Two cards of the same value. (♥6 ♦6)
 - Two Pair: Two pairs. (♦J ♠J ♠4 ♣4)
 - Low Straight: Four consecutive cards. (♥J ♥Q ♠K ♦A)
 - Three-of-a-Kind: Three cards of the same value (♦9 ♥9 ♣9)
 - High Straight: Five consecutive cards. (♦10 ♥J ♥Q ♠K ♦A)
 - Flush: Five cards of the same suit. (♠5 ♠A ♠J ♠7 ♠2)
 - Full House: Two of the same card + Three of the same card
   (♠3 ♦3 ♦3 ♦6 ♠6)
 - Four of a Kind: Four cards of the same value (♦4 ♣4 ♥4 ♠4)
 - Straight Flush: Five consecutive cards, all of the
   same suit. (♠10 ♠J ♠Q ♠K ♠A)

The of cards that determine the value of your hand are called your
'*value hand*'. If you have a three-of-a-kind, then the three cards
making it up, are your *value hand*, and the rest of the cards in your
hand are ignored.

#### High Ace and Low Ace

As usual, an Ace can count as both as the lowest card, and as the
highest card. However it can only serve one of these rolls at once. By
default, it is a high ace, meaning it wins against any other high
cards. It only serves as a low ace in straights, where it may be
adjacent to a two. However, as it can only be low or high (and never
both), you cannot have a straight that goes from king, to ace, to two.

#### Card Value

If two players have the same type of hand, whoever's *value hand* has
the single highest valued card wins.

#### Suit Value

On the very rare occasion that two value hands are of the same type
and have the same highest card, i.e. A low straight where both players
have a straight from three to six, then the suit of each highest card
is compared. This is rarely important but it does mean that some suits
are very slightly more valuable with others. In the example, whichever
of these two players has the six in the straight with the most
valuable suit wins

The suits values are as follows:

Spades > Hearts > Clubs > Diamonds

Making Spades the most valuable suit, and Diamonds the least valuable.

## Assertions

These are just statements about the game that should always be true.
If, during a game, one of these is not true, then you've probably
misread the rules at some point.

- **All players** should have exactly 5 cards when a turn ends.

- During an auction **all active players** should have a card on the
  trade ring.

- There should **always** be at least 2 *active players*. If there is
  1, then the game has ended.

- It should **always** be possible to determine a winner, There can
  never be a tie.
  
- If you auction a card, you will **not** have that card at the end of
  your turn.

- If a card is in the discard pile, it will **never** be in any
  player's hands again.

## Notes

Communication is allowed at all points in the game. Deals made between
players are not enforced. If you promise to make a trade with someone,
there are no consequences for not doing so.

## Additions

Theses are a few extra rules you may add to change up the game a
little:

### Secret Offers

In this variation, offers are made face-down and never revealed. The
*auctioneer* must trust that each player has offered what they've said
they've offered. The cards are only ever revealed to everybody upon
being sent to the *discard pile*.

### High Risk

In this variation, at the beginning of the game, 13 cards from the
*deck pile* are sent face-down to the *discard pile*, meaning that 13
unknown cards will never appear in the game, making it faster and
riskier.

### Open Hands

In this variation, your hand is visible to all players. This mode
doesn't work with 'secret offers' but allows players to make more
informed deals and bribes, and increases the tension when you can see
what potential value hands an opponent could make, allowing you to
make strateigic offers and auctions. This tends to cause games to last
longer.

> I don't know if it actually causes games to be longer, but in
> play-testing, the games with this mode were noticably longer.

## Playing For Chips

I don't like gambling, but playing card games with fake chips can be a
lot of fun, so I've tried to come up with a system that allows you to
play for chips in *Mulligan*. This system actually involves much less
gambling than a game like poker, as you're not using the chips to
place bets, but instead using them to aid negotiations.

When playing for chips, I'd highly recommend playing with High Risk
mode, and Open Hands mode. It makes the game feel much more intense
and high-stakes.

When auctioning a card, you must place some amount of chips on top of
the *auctioned card*. Players making offers for the *auctioned card*
may choose to place chips with their offers, but they do not have to.
If the *auctioneer* chooses to *Swap*, then the chips on top of the
cards are swapped, just as the cards are. If the *auctioneer* chooses
to *Mulligan*, Then the chips on top of every card in the trade ring
are placed in a pot. The contents of the pot is awarded to the winner
of the game.

If you have no chips. Once you become the *auctioneer*, you are forced
to *Fold*.
